import { describe, it, expect, vi, beforeEach } from 'vitest'
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

// Add better DOM environment setup for d3-drag
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})

// Add SVGElement if not present
if (typeof SVGElement === 'undefined') {
  global.SVGElement = class SVGElement extends Element {}
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    <ReactFlowProvider>{children}</ReactFlowProvider>
  </Provider>
)

describe('GuiEditor - Drag & Drop Parent-Child Relationships', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
  })

  const addNodeByClickingOnCanvas = (container: HTMLElement, x: number, y: number) => {
    const pane = container.querySelector('.react-flow__pane')
    if (!pane) throw new Error('React Flow pane not found')
    fireEvent.click(pane, { clientX: x, clientY: y })
  }

  it('should add node to subgraph when dropped inside', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })

    // First, add a subgraph
    const subgraphButton = screen.getByTitle('Subgraph')
    fireEvent.click(subgraphButton)
    addNodeByClickingOnCanvas(container, 200, 200)
    
    // Wait for subgraph to appear
    await waitFor(() => {
      expect(screen.getByText('New subgraph')).toBeDefined()
    })

    // Now add a rectangle node
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)
    addNodeByClickingOnCanvas(container, 100, 100)

    // Wait for rectangle to appear
    await waitFor(() => {
      expect(screen.getByText('New rectangle')).toBeDefined()
    })

    // Get the rectangle node
    const rectangleNode = screen.getByText('New rectangle').closest('.react-flow__node')
    expect(rectangleNode).toBeTruthy()

    // Get the subgraph node
    const subgraphNode = screen.getByText('New subgraph').closest('.react-flow__node')
    expect(subgraphNode).toBeTruthy()

    // Simulate dragging the rectangle onto the subgraph
    fireEvent.mouseDown(rectangleNode!)
    fireEvent.mouseMove(rectangleNode!, { clientX: 250, clientY: 250 })
    fireEvent.mouseUp(rectangleNode!)

    // Wait for the parent-child relationship to be established
    await waitFor(() => {
      // The rectangle should now be a child of the subgraph
      const updatedRectangle = screen.getByText('New rectangle').closest('.react-flow__node')
      expect(updatedRectangle?.getAttribute('data-parent-id')).toBe('Subgraph1')
    })
  })

  it('should remove node from subgraph when dragged outside', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })

    // Add a subgraph
    const subgraphButton = screen.getByTitle('Subgraph')
    fireEvent.click(subgraphButton)
    addNodeByClickingOnCanvas(container, 200, 200)
    
    await waitFor(() => {
      expect(screen.getByText('New subgraph')).toBeDefined()
    })

    // Add a rectangle inside the subgraph bounds
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)
    addNodeByClickingOnCanvas(container, 250, 250)

    await waitFor(() => {
      expect(screen.getByText('New rectangle')).toBeDefined()
    })

    // Manually set the parent relationship (simulating existing state)
    const rectangleNode = screen.getByText('New rectangle').closest('.react-flow__node')
    expect(rectangleNode).toBeTruthy()
    
    // Drag the rectangle outside the subgraph
    fireEvent.mouseDown(rectangleNode!)
    fireEvent.mouseMove(rectangleNode!, { clientX: 500, clientY: 100 })
    fireEvent.mouseUp(rectangleNode!)

    // Wait for the parent-child relationship to be removed
    await waitFor(() => {
      const updatedRectangle = screen.getByText('New rectangle').closest('.react-flow__node')
      expect(updatedRectangle?.getAttribute('data-parent-id')).toBeNull()
    })
  })

  it('should show drop indicator when dragging over subgraph', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })

    // Add a subgraph
    const subgraphButton = screen.getByTitle('Subgraph')
    fireEvent.click(subgraphButton)
    addNodeByClickingOnCanvas(container, 200, 200)
    
    await waitFor(() => {
      expect(screen.getByText('New subgraph')).toBeDefined()
    })

    // Add a rectangle
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)
    addNodeByClickingOnCanvas(container, 100, 100)

    await waitFor(() => {
      expect(screen.getByText('New rectangle')).toBeDefined()
    })

    const rectangleNode = screen.getByText('New rectangle').closest('.react-flow__node')
    const subgraphNode = screen.getByText('New subgraph').closest('.react-flow__node')

    // Start dragging the rectangle
    fireEvent.mouseDown(rectangleNode!)
    fireEvent.mouseMove(rectangleNode!, { clientX: 250, clientY: 250 })

    // Check for drop indicator
    await waitFor(() => {
      expect(subgraphNode?.classList.contains('drop-target')).toBe(true)
    })

    // Complete the drag
    fireEvent.mouseUp(rectangleNode!)

    // Drop indicator should be removed
    await waitFor(() => {
      expect(subgraphNode?.classList.contains('drop-target')).toBe(false)
    })
  })

  it('should not allow subgraph to be parent of itself', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })

    // Add two subgraphs
    const subgraphButton = screen.getByTitle('Subgraph')
    fireEvent.click(subgraphButton)
    addNodeByClickingOnCanvas(container, 200, 200)
    addNodeByClickingOnCanvas(container, 400, 200)
    
    await waitFor(() => {
      const subgraphs = screen.getAllByText(/New subgraph/)
      expect(subgraphs).toHaveLength(2)
    })

    const subgraph1 = screen.getAllByText(/New subgraph/)[0].closest('.react-flow__node')
    
    // Try to drag subgraph1 onto itself
    fireEvent.mouseDown(subgraph1!)
    fireEvent.mouseMove(subgraph1!, { clientX: 200, clientY: 200 })
    fireEvent.mouseUp(subgraph1!)

    // Verify no parent relationship was established
    await waitFor(() => {
      expect(subgraph1?.getAttribute('data-parent-id')).toBeNull()
    })
  })
})