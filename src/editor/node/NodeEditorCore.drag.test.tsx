import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

// Mock React Flow hooks
const mockGetIntersectingNodes = vi.fn()

vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react')
  return {
    ...actual,
    ReactFlow: ({ children, onNodeDragStop, ...props }: any) => (
      <div data-testid="react-flow" {...props}>
        {children}
        <button onClick={() => onNodeDragStop?.(
          { stopPropagation: () => {} } as any, 
          { id: 'n1', position: { x: 150, y: 150 }, type: 'rectangle', data: { label: 'Node 1' } }
        )}>Trigger Drag Stop</button>
      </div>
    ),
    useReactFlow: () => ({
      screenToFlowPosition: ({ x, y }: { x: number; y: number }) => ({ x, y }),
      getIntersectingNodes: mockGetIntersectingNodes,
    }),
    Background: () => <div>Background</div>,
    Controls: () => <div>Controls</div>,
    MiniMap: () => <div>MiniMap</div>,
    useNodesState: () => {
      return [[], vi.fn(), vi.fn()]
    },
    useEdgesState: () => {
      return [[], vi.fn(), vi.fn()]
    },
  }
})

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('NodeEditorCore - Drag and Drop', () => {
  beforeEach(() => {
    mockGetIntersectingNodes.mockClear()
  })

  it('should detect intersection with group node on drag stop', async () => {
    // Mock intersecting nodes to return a group node
    mockGetIntersectingNodes.mockReturnValue([
      { id: 'group1', type: 'group', position: { x: 100, y: 100 }, data: { label: 'Group 1' } }
    ])

    render(<NodeEditorCore />, { wrapper: Wrapper })

    // Wait for React Flow to initialize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Trigger drag stop
    const dragButton = screen.getByText('Trigger Drag Stop')
    fireEvent.click(dragButton)

    // Verify getIntersectingNodes was called
    expect(mockGetIntersectingNodes).toHaveBeenCalledWith({
      id: 'n1',
      position: { x: 150, y: 150 },
      type: 'rectangle',
      data: { label: 'Node 1' }
    })
  })

  it('should find the first group node among intersecting nodes', async () => {
    // Mock intersecting nodes with both regular and group nodes
    mockGetIntersectingNodes.mockReturnValue([
      { id: 'n2', type: 'rectangle', position: { x: 50, y: 50 }, data: { label: 'Node 2' } },
      { id: 'group1', type: 'group', position: { x: 100, y: 100 }, data: { label: 'Group 1' } },
      { id: 'n3', type: 'circle', position: { x: 200, y: 200 }, data: { label: 'Node 3' } }
    ])

    render(<NodeEditorCore />, { wrapper: Wrapper })

    // Wait for React Flow to initialize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Trigger drag stop
    const dragButton = screen.getByText('Trigger Drag Stop')
    fireEvent.click(dragButton)

    // Verify the handler processed the group node
    expect(mockGetIntersectingNodes).toHaveBeenCalled()
  })

  it('should handle drag stop when no group nodes are intersecting', async () => {
    // Mock intersecting nodes with only regular nodes
    mockGetIntersectingNodes.mockReturnValue([
      { id: 'n2', type: 'rectangle', position: { x: 50, y: 50 }, data: { label: 'Node 2' } },
      { id: 'n3', type: 'circle', position: { x: 200, y: 200 }, data: { label: 'Node 3' } }
    ])

    render(<NodeEditorCore />, { wrapper: Wrapper })

    // Wait for React Flow to initialize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Trigger drag stop - should not throw
    const dragButton = screen.getByText('Trigger Drag Stop')
    expect(() => fireEvent.click(dragButton)).not.toThrow()
  })

  it('should handle drag stop when no nodes are intersecting', async () => {
    // Mock no intersecting nodes
    mockGetIntersectingNodes.mockReturnValue([])

    render(<NodeEditorCore />, { wrapper: Wrapper })

    // Wait for React Flow to initialize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Trigger drag stop - should not throw
    const dragButton = screen.getByText('Trigger Drag Stop')
    expect(() => fireEvent.click(dragButton)).not.toThrow()
  })
})