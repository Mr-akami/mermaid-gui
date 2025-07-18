import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GuiEditor } from './GuiEditor'
import { Provider } from 'jotai'
import { ReactFlowProvider } from '@xyflow/react'
import { nodesAtom } from '../flowchart/index'
import { createStore } from 'jotai'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    <ReactFlowProvider>{children}</ReactFlowProvider>
  </Provider>
)

describe('GuiEditor - Parent-Child Drag & Drop', () => {
  const addNodeByClickingOnCanvas = (container: HTMLElement, x: number, y: number) => {
    const pane = container.querySelector('.react-flow__pane')
    if (!pane) throw new Error('React Flow pane not found')
    fireEvent.click(pane, { clientX: x, clientY: y })
  }

  it('should update parent when node is dragged into subgraph', async () => {
    const store = createStore()
    const { container } = render(
      <Provider store={store}>
        <GuiEditor />
      </Provider>
    )
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })

    // Add a subgraph
    const subgraphButton = screen.getByTitle('Subgraph')
    fireEvent.click(subgraphButton)
    addNodeByClickingOnCanvas(container, 200, 200)
    
    // Add a rectangle
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)
    addNodeByClickingOnCanvas(container, 100, 100)
    
    await waitFor(() => {
      const nodes = store.get(nodesAtom)
      expect(nodes).toHaveLength(2)
    })

    // Check initial state - rectangle should not have parent
    const initialNodes = store.get(nodesAtom)
    const rect = initialNodes.find(n => n.type === 'rectangle')
    expect(rect?.parentId).toBeUndefined()
    
    // Simulate dragging rectangle into subgraph
    const rectNode = screen.getByText('New rectangle').closest('.react-flow__node')
    expect(rectNode).toBeTruthy()
    
    // Trigger drag events
    fireEvent.mouseDown(rectNode!)
    fireEvent.mouseMove(rectNode!, { clientX: 250, clientY: 250 })
    fireEvent.mouseUp(rectNode!)
    
    // Wait for parent relationship to be established
    await waitFor(() => {
      const updatedNodes = store.get(nodesAtom)
      const updatedRect = updatedNodes.find(n => n.type === 'rectangle')
      const subgraph = updatedNodes.find(n => n.type === 'subgraph')
      
      expect(updatedRect?.parentId).toBe(subgraph?.id)
      expect(subgraph?.childIds).toContain(updatedRect?.id)
    })
  })

  it('should remove parent when node is dragged out of subgraph', async () => {
    const store = createStore()
    
    // Set up initial state with rectangle inside subgraph
    store.set(nodesAtom, [
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: ['Rect1'],
        position: { x: 200, y: 200 },
        data: { label: 'New subgraph' },
        width: 600,
        height: 200,
      },
      {
        id: 'Rect1',
        type: 'rectangle',
        parentId: 'Subgraph1',
        childIds: [],
        position: { x: 250, y: 250 },
        data: { label: 'New rectangle' },
        width: 150,
        height: 50,
      },
    ])
    
    const { container } = render(
      <Provider store={store}>
        <GuiEditor />
      </Provider>
    )
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })
    
    // Verify initial parent relationship
    const initialNodes = store.get(nodesAtom)
    expect(initialNodes[1].parentId).toBe('Subgraph1')
    
    // Simulate dragging rectangle out of subgraph
    const rectNode = screen.getByText('New rectangle').closest('.react-flow__node')
    expect(rectNode).toBeTruthy()
    
    fireEvent.mouseDown(rectNode!)
    fireEvent.mouseMove(rectNode!, { clientX: 50, clientY: 50 })
    fireEvent.mouseUp(rectNode!)
    
    // Wait for parent relationship to be removed
    await waitFor(() => {
      const updatedNodes = store.get(nodesAtom)
      const updatedRect = updatedNodes.find(n => n.id === 'Rect1')
      const subgraph = updatedNodes.find(n => n.id === 'Subgraph1')
      
      expect(updatedRect?.parentId).toBeUndefined()
      expect(subgraph?.childIds).not.toContain('Rect1')
    })
  })

  it('should show drop target visual feedback', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })

    // Add a subgraph
    const subgraphButton = screen.getByTitle('Subgraph')
    fireEvent.click(subgraphButton)
    addNodeByClickingOnCanvas(container, 200, 200)
    
    // Add a rectangle
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)
    addNodeByClickingOnCanvas(container, 100, 100)
    
    await waitFor(() => {
      expect(screen.getByText('New subgraph')).toBeDefined()
      expect(screen.getByText('New rectangle')).toBeDefined()
    })
    
    const rectNode = screen.getByText('New rectangle').closest('.react-flow__node')
    const subgraphNode = screen.getByText('New subgraph').closest('.react-flow__node')
    
    // Start dragging
    fireEvent.mouseDown(rectNode!)
    fireEvent.mouseMove(rectNode!, { clientX: 250, clientY: 250 })
    
    // Check for drop target class
    await waitFor(() => {
      expect(subgraphNode?.classList.contains('drop-target')).toBe(true)
    })
    
    // Complete drag
    fireEvent.mouseUp(rectNode!)
    
    // Drop target class should be removed
    await waitFor(() => {
      expect(subgraphNode?.classList.contains('drop-target')).toBe(false)
    })
  })
})