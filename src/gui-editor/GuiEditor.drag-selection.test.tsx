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

describe('GuiEditor - Node Drag Selection', () => {
  it('should maintain node selection after drag ends', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })
    
    // Select rectangle tool
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)

    // Add a node
    const pane = container.querySelector('.react-flow__pane')
    expect(pane).toBeTruthy()
    fireEvent.click(pane!, { clientX: 100, clientY: 100 })

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

    // Simulate dragging - mousedown, mousemove, mouseup
    fireEvent.mouseDown(node!)
    
    // Move the node
    fireEvent.mouseMove(document, { clientX: 200, clientY: 200 })
    
    // End drag
    fireEvent.mouseUp(document)

    // Check that node is still selected after drag ends
    await waitFor(() => {
      expect(node!.className).toContain('selected')
    }, { timeout: 2000 })
    
    // Verify we can still delete it (only selected nodes can be deleted)
    fireEvent.keyDown(document, { key: 'Delete' })
    
    await waitFor(() => {
      expect(screen.queryByText(/New rectangle/)).toBeNull()
    })
  })

  it('should handle multiple drags while maintaining selection', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })
    
    // Select rectangle tool
    const rectangleButton = screen.getByTitle('Rectangle')
    fireEvent.click(rectangleButton)

    // Add a node
    const pane = container.querySelector('.react-flow__pane')
    fireEvent.click(pane!, { clientX: 100, clientY: 100 })

    // Wait for node
    await waitFor(() => {
      expect(screen.getByText(/New rectangle/)).toBeDefined()
    })

    // Select the node
    const node = screen.getByText(/New rectangle/).closest('.react-flow__node')
    fireEvent.click(node!)

    await waitFor(() => {
      expect(node!.className).toContain('selected')
    })

    // First drag
    fireEvent.mouseDown(node!)
    fireEvent.mouseMove(document, { clientX: 150, clientY: 150 })
    fireEvent.mouseUp(document)

    // Should still be selected
    await waitFor(() => {
      expect(node!.className).toContain('selected')
    })

    // Second drag
    fireEvent.mouseDown(node!)
    fireEvent.mouseMove(document, { clientX: 200, clientY: 200 })
    fireEvent.mouseUp(document)

    // Should still be selected
    await waitFor(() => {
      expect(node!.className).toContain('selected')
    })
  })
})