import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { GuiEditor } from './GuiEditor'
import { Provider } from 'jotai'
import { ReactFlowProvider } from '@xyflow/react'

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

describe('GuiEditor - Node Deletion', () => {
  const addNodeByClickingOnCanvas = (container: HTMLElement, x: number, y: number) => {
    const pane = container.querySelector('.react-flow__pane')
    if (!pane) throw new Error('React Flow pane not found')
    fireEvent.click(pane, { clientX: x, clientY: y })
  }
  
  it('should delete selected node when Delete key is pressed', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })
    
    // Select rectangle tool
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)

    // Add nodes by clicking on the canvas
    addNodeByClickingOnCanvas(container, 100, 100)
    addNodeByClickingOnCanvas(container, 300, 100)

    // Wait for nodes to be rendered
    await waitFor(() => {
      const nodes = screen.getAllByText(/New rectangle/)
      expect(nodes).toHaveLength(2)
    })

    // Click on the first node to select it
    const firstNode = screen.getAllByText(/New rectangle/)[0].closest('.react-flow__node')
    expect(firstNode).toBeTruthy()
    fireEvent.click(firstNode!)

    // Wait for selection to be applied
    await waitFor(() => {
      const selectedNode = container.querySelector('.react-flow__node.selected')
      expect(selectedNode).toBeTruthy()
    })

    // Press Delete key
    fireEvent.keyDown(document, { key: 'Delete' })

    // Wait for node to be removed
    await waitFor(() => {
      const remainingNodes = screen.queryAllByText(/New rectangle/)
      expect(remainingNodes).toHaveLength(1)
    })
  })

  it('should delete selected node when Backspace key is pressed', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })
    
    // Select rectangle tool
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)

    // Add nodes by clicking on the canvas
    addNodeByClickingOnCanvas(container, 100, 100)
    addNodeByClickingOnCanvas(container, 300, 100)

    // Wait for nodes to be rendered
    await waitFor(() => {
      const nodes = screen.getAllByText(/New rectangle/)
      expect(nodes).toHaveLength(2)
    })

    // Click on the first node to select it
    const firstNode = screen.getAllByText(/New rectangle/)[0].closest('.react-flow__node')
    expect(firstNode).toBeTruthy()
    fireEvent.click(firstNode!)

    // Wait for selection to be applied
    await waitFor(() => {
      const selectedNode = container.querySelector('.react-flow__node.selected')
      expect(selectedNode).toBeTruthy()
    })

    // Press Backspace key
    fireEvent.keyDown(document, { key: 'Backspace' })

    // Wait for node to be removed
    await waitFor(() => {
      const remainingNodes = screen.queryAllByText(/New rectangle/)
      expect(remainingNodes).toHaveLength(1)
    })
  })

  it('should delete multiple selected nodes at once', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })
    
    // Select rectangle tool
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)

    // Add nodes by clicking on the canvas
    addNodeByClickingOnCanvas(container, 100, 100)
    addNodeByClickingOnCanvas(container, 300, 100)
    addNodeByClickingOnCanvas(container, 500, 100)

    // Wait for nodes to be rendered
    await waitFor(() => {
      const nodes = screen.getAllByText(/New rectangle/)
      expect(nodes).toHaveLength(3)
    })

    // Get node elements
    const nodes = screen.getAllByText(/New rectangle/).map(n => n.closest('.react-flow__node'))
    
    // Click on the first node to select it
    fireEvent.click(nodes[0]!)

    // Ctrl+click (or Cmd+click) the second node to add to selection
    fireEvent.click(nodes[1]!, { ctrlKey: true })

    // Wait for both nodes to be selected
    await waitFor(() => {
      const selectedNodes = container.querySelectorAll('.react-flow__node.selected')
      expect(selectedNodes).toHaveLength(2)
    })

    // Press Delete key
    fireEvent.keyDown(document, { key: 'Delete' })

    // Wait for nodes to be removed
    await waitFor(() => {
      const remainingNodes = screen.queryAllByText(/New rectangle/)
      expect(remainingNodes).toHaveLength(1)
    })
  })

  it('should not delete nodes when no node is selected', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })
    
    // Select rectangle tool
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)

    // Add nodes by clicking on the canvas
    addNodeByClickingOnCanvas(container, 100, 100)
    addNodeByClickingOnCanvas(container, 300, 100)

    // Wait for nodes to be rendered
    await waitFor(() => {
      const nodes = screen.getAllByText(/New rectangle/)
      expect(nodes).toHaveLength(2)
    })

    // Click on the viewport to deselect any nodes
    const pane = container.querySelector('.react-flow__pane')!
    fireEvent.click(pane, { clientX: 500, clientY: 300 })

    // Press Delete key
    fireEvent.keyDown(document, { key: 'Delete' })

    // Verify nodes are still there
    await waitFor(() => {
      const remainingNodes = screen.queryAllByText(/New rectangle/)
      expect(remainingNodes).toHaveLength(2)
    })
  })

  it('should maintain selection after dragging', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })
    
    // Select rectangle tool
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)

    // Add a node
    addNodeByClickingOnCanvas(container, 100, 100)

    // Wait for node to be rendered
    await waitFor(() => {
      expect(screen.getByText(/New rectangle/)).toBeDefined()
    })

    // Click on the node to select it
    const node = screen.getByText(/New rectangle/).closest('.react-flow__node')
    expect(node).toBeTruthy()
    fireEvent.click(node!)

    // Wait for selection
    await waitFor(() => {
      expect(node!.className).toContain('selected')
    })

    // Simulate dragging the node
    fireEvent.mouseDown(node!)
    fireEvent.mouseMove(node!, { clientX: 200, clientY: 200 })
    fireEvent.mouseUp(node!)

    // Check that node is still selected after drag
    expect(node!.className).toContain('selected')
    
    // Verify we can still delete it
    fireEvent.keyDown(document, { key: 'Delete' })
    
    await waitFor(() => {
      expect(screen.queryByText(/New rectangle/)).toBeNull()
    })
  })
})