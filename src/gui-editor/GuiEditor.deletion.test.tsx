import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GuiEditor } from './GuiEditor'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

describe('GuiEditor - Node Deletion', () => {
  const addNodeByClickingOnCanvas = async (user: ReturnType<typeof userEvent.setup>, container: HTMLElement, x: number, y: number) => {
    const pane = container.querySelector('.react-flow__pane')
    if (!pane) throw new Error('React Flow pane not found')
    await user.click(pane, { coords: { x, y } })
  }
  it('should delete selected node when Delete key is pressed', async () => {
    const user = userEvent.setup()
    
    const { container } = render(<GuiEditor />)
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      const viewport = container.querySelector('.react-flow__viewport')
      expect(viewport).toBeTruthy()
    })

    // Add nodes by clicking on the canvas
    await addNodeByClickingOnCanvas(user, container, 100, 100)
    await addNodeByClickingOnCanvas(user, container, 300, 100)

    // Wait for nodes to be rendered
    const nodes = await screen.findAllByText(/Rect\d+/)
    expect(nodes).toHaveLength(2)

    // Click on the first node to select it
    const firstNode = nodes[0]
    await user.click(firstNode)

    // Wait for selection to be applied
    await waitFor(() => {
      const selectedNode = container.querySelector('.react-flow__node.selected')
      expect(selectedNode).toBeTruthy()
    })

    // Press Delete key
    await user.keyboard('{Delete}')

    // Wait for node to be removed
    await waitFor(() => {
      const remainingNodes = screen.queryAllByText(/Rect\d+/)
      expect(remainingNodes).toHaveLength(1)
    })
  })

  it('should delete selected node when Backspace key is pressed', async () => {
    const user = userEvent.setup()
    
    const { container } = render(<GuiEditor />)
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      const viewport = container.querySelector('.react-flow__viewport')
      expect(viewport).toBeTruthy()
    })

    // Add nodes by clicking on the canvas
    await addNodeByClickingOnCanvas(user, container, 100, 100)
    await addNodeByClickingOnCanvas(user, container, 300, 100)

    // Wait for nodes to be rendered
    const nodes = await screen.findAllByText(/Rect\d+/)
    expect(nodes).toHaveLength(2)

    // Click on the first node to select it
    const firstNode = nodes[0]
    await user.click(firstNode)

    // Wait for selection to be applied
    await waitFor(() => {
      const selectedNode = container.querySelector('.react-flow__node.selected')
      expect(selectedNode).toBeTruthy()
    })

    // Press Backspace key
    await user.keyboard('{Backspace}')

    // Wait for node to be removed
    await waitFor(() => {
      const remainingNodes = screen.queryAllByText(/Rect\d+/)
      expect(remainingNodes).toHaveLength(1)
    })
  })

  it('should delete multiple selected nodes at once', async () => {
    const user = userEvent.setup()
    
    const { container } = render(<GuiEditor />)
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      const viewport = container.querySelector('.react-flow__viewport')
      expect(viewport).toBeTruthy()
    })

    // Add nodes by clicking on the canvas
    await addNodeByClickingOnCanvas(user, container, 100, 100)
    await addNodeByClickingOnCanvas(user, container, 300, 100)

    // Wait for nodes to be rendered
    const nodes = await screen.findAllByText(/Rect\d+/)
    expect(nodes).toHaveLength(2)

    // Click on the first node to select it
    await user.click(nodes[0])

    // Hold shift and click the second node to add to selection
    await user.keyboard('{Shift>}')
    await user.click(nodes[1])
    await user.keyboard('{/Shift}')

    // Wait for both nodes to be selected
    await waitFor(() => {
      const selectedNodes = container.querySelectorAll('.react-flow__node.selected')
      expect(selectedNodes).toHaveLength(2)
    })

    // Press Delete key
    await user.keyboard('{Delete}')

    // Wait for all nodes to be removed
    await waitFor(() => {
      const remainingNodes = screen.queryAllByText(/Rect\d+/)
      expect(remainingNodes).toHaveLength(0)
    })
  })

  it('should not delete nodes when no node is selected', async () => {
    const user = userEvent.setup()
    
    const { container } = render(<GuiEditor />)
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      const viewport = container.querySelector('.react-flow__viewport')
      expect(viewport).toBeTruthy()
    })

    // Add nodes by clicking on the canvas
    await addNodeByClickingOnCanvas(user, container, 100, 100)
    await addNodeByClickingOnCanvas(user, container, 300, 100)

    // Wait for nodes to be rendered
    const nodes = await screen.findAllByText(/Rect\d+/)
    expect(nodes).toHaveLength(2)

    // Click on the viewport to deselect any nodes
    const viewport = container.querySelector('.react-flow__viewport')!
    await user.click(viewport)

    // Press Delete key
    await user.keyboard('{Delete}')

    // Verify nodes are still there
    await waitFor(() => {
      const remainingNodes = screen.queryAllByText(/Rect\d+/)
      expect(remainingNodes).toHaveLength(2)
    })
  })

  it('should delete edges connected to deleted nodes', async () => {
    const user = userEvent.setup()
    
    const { container } = render(<GuiEditor />)
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      const viewport = container.querySelector('.react-flow__viewport')
      expect(viewport).toBeTruthy()
    })

    // Add nodes by clicking on the canvas
    await addNodeByClickingOnCanvas(user, container, 100, 100)
    await addNodeByClickingOnCanvas(user, container, 300, 100)

    // Wait for nodes to be rendered
    await screen.findAllByText(/Rect\d+/)

    // Add an edge between nodes by dragging from source to target
    const nodes = container.querySelectorAll('.react-flow__node')
    const sourceHandle = nodes[0].querySelector('.source')
    const targetHandle = nodes[1].querySelector('.target')
    
    if (!sourceHandle || !targetHandle) throw new Error('Handles not found')
    
    // Drag from source to target
    await user.pointer([
      { target: sourceHandle },
      { target: targetHandle }
    ])

    // Wait for edge to be created
    await waitFor(() => {
      const edges = container.querySelectorAll('.react-flow__edge')
      expect(edges).toHaveLength(1)
    })

    // Select and delete the first node
    const nodeElements = await screen.findAllByText(/Rect\d+/)
    await user.click(nodeElements[0])

    await waitFor(() => {
      const selectedNode = container.querySelector('.react-flow__node.selected')
      expect(selectedNode).toBeTruthy()
    })

    await user.keyboard('{Delete}')

    // Wait for node and edge to be removed
    await waitFor(() => {
      const remainingNodes = screen.queryAllByText(/Rect\d+/)
      expect(remainingNodes).toHaveLength(1)
      
      const edges = container.querySelectorAll('.react-flow__edge')
      expect(edges).toHaveLength(0)
    })
  })
})