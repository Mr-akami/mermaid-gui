import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'jotai'
import { useAtom } from 'jotai'
import { nodesAtom, edgesAtom } from '../atoms'
import { toReactFlowNodes } from './flowchartConverters'
import type { Node } from '../../common/types'

describe('Z-index integration with atoms', () => {
  let wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element

  beforeEach(() => {
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider>{children}</Provider>
    )
  })

  it('should maintain z-index when nodes are added in different orders', () => {
    const { result } = renderHook(() => {
      const [nodes, setNodes] = useAtom(nodesAtom)
      return { nodes, setNodes, toReactFlowNodes }
    }, { wrapper })

    // Add a regular node first
    act(() => {
      result.current.setNodes([
        {
          id: 'node1',
          type: 'rectangle',
          position: { x: 100, y: 100 },
          data: { label: 'First Node' },
          childIds: []
        }
      ])
    })

    let rfNodes = toReactFlowNodes(result.current.nodes)
    expect(rfNodes[0].zIndex).toBe(1000)

    // Add a subgraph after
    act(() => {
      result.current.setNodes([
        ...result.current.nodes,
        {
          id: 'sg1',
          type: 'subgraph',
          position: { x: 50, y: 50 },
          data: { label: 'Added After' },
          childIds: []
        }
      ])
    })

    rfNodes = toReactFlowNodes(result.current.nodes)
    
    // Subgraph should be first in array (background)
    expect(rfNodes[0].id).toBe('sg1')
    expect(rfNodes[0].zIndex).toBe(-1000)
    
    // Regular node should be second (foreground)
    expect(rfNodes[1].id).toBe('node1')
    expect(rfNodes[1].zIndex).toBe(1000)

    // Add another node
    act(() => {
      result.current.setNodes([
        ...result.current.nodes,
        {
          id: 'node2',
          type: 'circle',
          position: { x: 200, y: 200 },
          data: { label: 'Third Node' },
          childIds: []
        }
      ])
    })

    rfNodes = toReactFlowNodes(result.current.nodes)
    
    // Check final order
    expect(rfNodes[0].id).toBe('sg1') // Subgraph first
    expect(rfNodes[0].zIndex).toBe(-1000)
    expect(rfNodes[1].zIndex).toBe(1000) // Regular nodes after
    expect(rfNodes[2].zIndex).toBe(1000)
  })

  it('should handle multiple subgraphs with correct z-index ordering', () => {
    const { result } = renderHook(() => {
      const [nodes, setNodes] = useAtom(nodesAtom)
      return { nodes, setNodes, toReactFlowNodes }
    }, { wrapper })

    // Add multiple nodes and subgraphs in mixed order
    act(() => {
      result.current.setNodes([
        {
          id: 'node1',
          type: 'rectangle',
          position: { x: 100, y: 100 },
          data: { label: 'Node 1' },
          childIds: []
        },
        {
          id: 'sg1',
          type: 'subgraph',
          position: { x: 50, y: 50 },
          data: { label: 'Subgraph 1' },
          childIds: []
        },
        {
          id: 'node2',
          type: 'circle',
          position: { x: 200, y: 200 },
          data: { label: 'Node 2' },
          childIds: []
        },
        {
          id: 'sg2',
          type: 'subgraph',
          position: { x: 300, y: 50 },
          data: { label: 'Subgraph 2' },
          childIds: []
        }
      ])
    })

    const rfNodes = toReactFlowNodes(result.current.nodes)
    
    // All subgraphs should come first
    expect(rfNodes[0].type).toBe('group') // sg1
    expect(rfNodes[1].type).toBe('group') // sg2
    
    // Check z-index values
    expect(rfNodes[0].zIndex).toBe(-1000) // sg1
    expect(rfNodes[1].zIndex).toBe(-999)  // sg2
    expect(rfNodes[2].zIndex).toBe(1000)  // node1
    expect(rfNodes[3].zIndex).toBe(1000)  // node2
    
    // Verify IDs are in correct order
    expect(rfNodes.map(n => n.id)).toEqual(['sg1', 'sg2', 'node1', 'node2'])
  })
})