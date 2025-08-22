import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { NodeEditorCore } from './NodeEditorCore'
import { ReactFlowProvider } from '@xyflow/react'
import { act } from 'react'

// Mock dependencies
vi.mock('./deps', async () => {
  const actual = await vi.importActual('./deps')
  return {
    ...actual,
    BiDirectionalEdge: () => <div>BiDirectionalEdge</div>,
    FlowchartNode: () => <div>FlowchartNode</div>,
    ResizableSubgraph: () => <div>ResizableSubgraph</div>,
  }
})

// Mock React Flow hooks and components
const mockSetNodes = vi.fn()
const mockGetIntersectingNodes = vi.fn()

let capturedOnNodeDragStop: any = null

vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react')
  return {
    ...actual,
    ReactFlow: ({ children, onNodeDragStop, ...props }: any) => {
      capturedOnNodeDragStop = onNodeDragStop
      return (
        <div data-testid="react-flow" {...props}>
          {children}
        </div>
      )
    },
    useReactFlow: () => ({
      screenToFlowPosition: ({ x, y }: { x: number; y: number }) => ({ x, y }),
      getIntersectingNodes: mockGetIntersectingNodes,
    }),
    Background: () => <div>Background</div>,
    useNodesState: () => {
      return [
        [
          { id: 'n1', type: 'rectangle', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
          { id: 'group1', type: 'subgraph', position: { x: 100, y: 100 }, data: { label: 'Group 1' } }
        ],
        mockSetNodes,
        vi.fn()
      ]
    },
    useEdgesState: () => [[], vi.fn(), vi.fn()],
  }
})

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('NodeEditorCore - Drop Operations', () => {
  beforeEach(() => {
    mockSetNodes.mockClear()
    mockGetIntersectingNodes.mockClear()
    capturedOnNodeDragStop = null
  })

  it('should update node parent when dropped on a subgraph', async () => {
    // Setup: subgraph node is intersecting
    mockGetIntersectingNodes.mockReturnValue([
      { id: 'group1', type: 'subgraph', position: { x: 100, y: 100 }, data: { label: 'Group 1' } }
    ])

    render(<NodeEditorCore />, { wrapper: Wrapper })

    // Wait for React Flow to initialize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Simulate drag stop
    const draggedNode = {
      id: 'n1',
      type: 'rectangle',
      position: { x: 150, y: 150 },
      data: { label: 'Node 1' }
    }

    act(() => {
      capturedOnNodeDragStop?.(
        { stopPropagation: vi.fn() } as any,
        draggedNode
      )
    })

    // Verify setNodes was called to update the parent
    expect(mockSetNodes).toHaveBeenCalledWith(expect.any(Function))
    
    // Get the update function
    const updateFn = mockSetNodes.mock.calls[0][0]
    const updatedNodes = updateFn([
      { id: 'n1', type: 'rectangle', position: { x: 150, y: 150 }, data: { label: 'Node 1' } },
      { id: 'group1', type: 'subgraph', position: { x: 100, y: 100 }, data: { label: 'Group 1' } }
    ])
    
    // Check that n1 now has parentId set to group1
    const updatedN1 = updatedNodes.find((n: any) => n.id === 'n1')
    expect(updatedN1.parentId).toBe('group1')
    
    // Check that position was adjusted to be relative to parent
    expect(updatedN1.position.x).toBe(50) // 150 - 100
    expect(updatedN1.position.y).toBe(50) // 150 - 100
  })

  it('should not update node if dropped on non-subgraph node', async () => {
    // Setup: regular node is intersecting
    mockGetIntersectingNodes.mockReturnValue([
      { id: 'n2', type: 'rectangle', position: { x: 100, y: 100 }, data: { label: 'Node 2' } }
    ])

    render(<NodeEditorCore />, { wrapper: Wrapper })

    // Wait for React Flow to initialize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Simulate drag stop
    const draggedNode = {
      id: 'n1',
      type: 'rectangle',
      position: { x: 150, y: 150 },
      data: { label: 'Node 1' }
    }

    act(() => {
      capturedOnNodeDragStop?.(
        { stopPropagation: vi.fn() } as any,
        draggedNode
      )
    })

    // Verify setNodes was not called (or called with no changes)
    expect(mockSetNodes).not.toHaveBeenCalled()
  })

  it('should remove parentId when node is dragged out of group', async () => {
    // Setup: no intersecting nodes
    mockGetIntersectingNodes.mockReturnValue([])

    render(<NodeEditorCore />, { wrapper: Wrapper })

    // Wait for React Flow to initialize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Simulate drag stop of a node that has a parent
    const draggedNode = {
      id: 'n1',
      type: 'rectangle',
      position: { x: 250, y: 250 },
      parentId: 'group1',
      data: { label: 'Node 1' }
    }

    act(() => {
      capturedOnNodeDragStop?.(
        { stopPropagation: vi.fn() } as any,
        draggedNode
      )
    })

    // Verify setNodes was called to remove parent
    expect(mockSetNodes).toHaveBeenCalledWith(expect.any(Function))
    
    // Get the update function
    const updateFn = mockSetNodes.mock.calls[0][0]
    const updatedNodes = updateFn([
      { 
        id: 'n1', 
        type: 'rectangle', 
        position: { x: 50, y: 50 }, // Relative position
        parentId: 'group1',
        data: { label: 'Node 1' } 
      },
      { 
        id: 'group1', 
        type: 'subgraph', 
        position: { x: 100, y: 100 }, 
        data: { label: 'Group 1' } 
      }
    ])
    
    // Check that n1 no longer has parentId
    const updatedN1 = updatedNodes.find((n: any) => n.id === 'n1')
    expect(updatedN1.parentId).toBeUndefined()
    
    // Check that position was converted to absolute
    expect(updatedN1.position.x).toBe(250) // Uses the dragged position
    expect(updatedN1.position.y).toBe(250)
  })

  it('should not allow dropping a subgraph inside another subgraph', async () => {
    // Setup: subgraph node is intersecting
    mockGetIntersectingNodes.mockReturnValue([
      { id: 'group2', type: 'subgraph', position: { x: 200, y: 200 }, data: { label: 'Group 2' } }
    ])

    render(<NodeEditorCore />, { wrapper: Wrapper })

    // Wait for React Flow to initialize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Simulate drag stop of a subgraph node
    const draggedNode = {
      id: 'group1',
      type: 'subgraph',
      position: { x: 250, y: 250 },
      data: { label: 'Group 1' }
    }

    act(() => {
      capturedOnNodeDragStop?.(
        { stopPropagation: vi.fn() } as any,
        draggedNode
      )
    })

    // Verify setNodes was not called - groups can't be nested
    expect(mockSetNodes).not.toHaveBeenCalled()
  })
})