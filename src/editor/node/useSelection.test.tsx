import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSelection } from './useSelection'
import { Provider as JotaiProvider } from 'jotai'
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react'

describe('useSelection', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <JotaiProvider>{children}</JotaiProvider>
  )

  it('should return null for both selectedNode and selectedEdge when nothing is selected', () => {
    const nodes: ReactFlowNode[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1' },
      },
    ]
    const edges: ReactFlowEdge[] = []

    const { result } = renderHook(
      () => useSelection(nodes, edges),
      { wrapper: Wrapper }
    )

    expect(result.current.selectedNode).toBeNull()
    expect(result.current.selectedEdge).toBeNull()
  })

  it('should return selected node when a node is selected', () => {
    const nodes: ReactFlowNode[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1' },
        selected: true,
      },
      {
        id: '2',
        type: 'circle',
        position: { x: 100, y: 100 },
        data: { label: 'Node 2' },
        selected: false,
      },
    ]
    const edges: ReactFlowEdge[] = []

    const { result } = renderHook(
      () => useSelection(nodes, edges),
      { wrapper: Wrapper }
    )

    expect(result.current.selectedNode).toBeTruthy()
    expect(result.current.selectedNode?.id).toBe('1')
    expect(result.current.selectedNode?.type).toBe('rectangle')
    expect(result.current.selectedNode?.data.label).toBe('Node 1')
    expect(result.current.selectedEdge).toBeNull()
  })

  it('should return selected edge when an edge is selected', () => {
    const nodes: ReactFlowNode[] = []
    const edges: ReactFlowEdge[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'default',
        data: { edgeType: 'normal-arrow', label: 'Edge 1' },
        selected: true,
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        type: 'default',
        data: { edgeType: 'normal' },
        selected: false,
      },
    ]

    const { result } = renderHook(
      () => useSelection(nodes, edges),
      { wrapper: Wrapper }
    )

    expect(result.current.selectedNode).toBeNull()
    expect(result.current.selectedEdge).toBeTruthy()
    expect(result.current.selectedEdge?.id).toBe('e1-2')
    expect(result.current.selectedEdge?.type).toBe('normal-arrow')
    expect(result.current.selectedEdge?.data?.label).toBe('Edge 1')
  })

  it('should update when selection changes', () => {
    let nodes: ReactFlowNode[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1' },
        selected: true,
      },
    ]
    const edges: ReactFlowEdge[] = []

    const { result, rerender } = renderHook(
      () => useSelection(nodes, edges),
      { wrapper: Wrapper }
    )

    // Initially node 1 is selected
    expect(result.current.selectedNode?.id).toBe('1')
    expect(result.current.selectedEdge).toBeNull()

    // Update selection
    nodes = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1' },
        selected: false,
      },
    ]

    rerender()

    // Now nothing is selected
    expect(result.current.selectedNode).toBeNull()
    expect(result.current.selectedEdge).toBeNull()
  })

  it('should prefer node selection over edge selection if both are selected', () => {
    const nodes: ReactFlowNode[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1' },
        selected: true,
      },
    ]
    const edges: ReactFlowEdge[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'default',
        data: { edgeType: 'normal-arrow' },
        selected: true,
      },
    ]

    const { result } = renderHook(
      () => useSelection(nodes, edges),
      { wrapper: Wrapper }
    )

    // Node selection takes precedence
    expect(result.current.selectedNode).toBeTruthy()
    expect(result.current.selectedNode?.id).toBe('1')
    expect(result.current.selectedEdge).toBeNull()
  })
})