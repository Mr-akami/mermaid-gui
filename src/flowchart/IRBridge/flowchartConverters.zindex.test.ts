import { describe, it, expect } from 'vitest'
import { toReactFlowNodes } from './toXyflowFromIR'
import type { IRNode } from '../core/types'

describe('Subgraph z-index ordering', () => {
  it('should set lower z-index for subgraphs and place them first in array', () => {
    const nodes: IRNode[] = [
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
        position: { x: 200, y: 200 },
        data: { label: 'Subgraph 1' },
        childIds: []
      },
      {
        id: 'node2',
        type: 'circle',
        position: { x: 300, y: 300 },
        data: { label: 'Node 2' },
        childIds: []
      },
      {
        id: 'sg2',
        type: 'subgraph',
        position: { x: 400, y: 400 },
        data: { label: 'Subgraph 2' },
        childIds: []
      }
    ]

    const result = toReactFlowNodes(nodes)
    const resultIds = result.map(n => n.id)

    // Subgraphs should come first (background)
    expect(resultIds[0]).toBe('sg1')
    expect(resultIds[1]).toBe('sg2')
    // Regular nodes should come after (foreground)
    expect(resultIds[2]).toBe('node1')
    expect(resultIds[3]).toBe('node2')
    
    // Check z-index values
    const sg1 = result.find(n => n.id === 'sg1')
    const sg2 = result.find(n => n.id === 'sg2')
    const node1 = result.find(n => n.id === 'node1')
    const node2 = result.find(n => n.id === 'node2')
    
    expect(sg1?.zIndex).toBe(-1000) // First subgraph
    expect(sg2?.zIndex).toBe(-999)  // Second subgraph (higher index but still background)
    expect(node1?.zIndex).toBe(1000)
    expect(node2?.zIndex).toBe(1000)
  })

  it('should maintain creation order among subgraphs', () => {
    const nodes: IRNode[] = [
      {
        id: 'sg3',
        type: 'subgraph',
        position: { x: 100, y: 100 },
        data: { label: 'Third Subgraph' },
        childIds: []
      },
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 200, y: 200 },
        data: { label: 'First Subgraph' },
        childIds: []
      },
      {
        id: 'sg2',
        type: 'subgraph',
        position: { x: 300, y: 300 },
        data: { label: 'Second Subgraph' },
        childIds: []
      }
    ]

    const result = toReactFlowNodes(nodes)
    const resultIds = result.map(n => n.id)

    // Subgraphs should maintain their original order
    expect(resultIds[0]).toBe('sg3')
    expect(resultIds[1]).toBe('sg1')
    expect(resultIds[2]).toBe('sg2')
  })

  it('should handle mixed nodes with parent-child relationships', () => {
    const nodes: IRNode[] = [
      {
        id: 'node1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        data: { label: 'Outside Node' },
        childIds: []
      },
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 200, y: 200 },
        data: { label: 'Subgraph' },
        childIds: ['child1']
      },
      {
        id: 'child1',
        type: 'circle',
        position: { x: 250, y: 250 },
        data: { label: 'Child Node' },
        parentId: 'sg1',
        childIds: []
      }
    ]

    const result = toReactFlowNodes(nodes)
    const resultIds = result.map(n => n.id)

    // Subgraph should be first (background)
    expect(resultIds[0]).toBe('sg1')
    // Other nodes after
    expect(resultIds[1]).toBe('node1')
    expect(resultIds[2]).toBe('child1')
  })
})