import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { NodeEditor } from './NodeEditor'

describe('NodeEditorCore - Undo/Redo functionality', () => {
  test('should undo and redo node creation', async () => {
    const user = userEvent.setup()
    render(<NodeEditor />)
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Rectangle')).toBeDefined()
    })
    
    // Get initial node count (should be 1)
    const initialNodes = document.querySelectorAll('.react-flow__node')
    expect(initialNodes).toHaveLength(1)
    
    // Click circle button to select circle type
    const circleButton = screen.getByTitle('Circle')
    await user.click(circleButton)
    
    // Click on the canvas to add a circle node
    const reactFlow = document.querySelector('.react-flow__pane')
    if (!reactFlow) throw new Error('React Flow pane not found')
    
    await user.click(reactFlow)
    
    // Wait for the new node to appear
    await waitFor(() => {
      const nodes = document.querySelectorAll('.react-flow__node')
      expect(nodes).toHaveLength(2)
    })
    
    // Wait a bit for history to save (debounced)
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Click undo button
    const undoButton = screen.getByTitle('Undo (Ctrl+Z)')
    await user.click(undoButton)
    
    // Should go back to 1 node
    await waitFor(() => {
      const nodes = document.querySelectorAll('.react-flow__node')
      expect(nodes).toHaveLength(1)
    })
    
    // Click redo button
    const redoButton = screen.getByTitle('Redo (Ctrl+Y)')
    await user.click(redoButton)
    
    // Should have 2 nodes again
    await waitFor(() => {
      const nodes = document.querySelectorAll('.react-flow__node')
      expect(nodes).toHaveLength(2)
    })
  })
  
  test('should properly disable/enable undo/redo buttons', async () => {
    const user = userEvent.setup()
    render(<NodeEditor />)
    
    await waitFor(() => {
      expect(screen.getByText('Rectangle')).toBeDefined()
    })
    
    const undoButton = screen.getByTitle('Undo (Ctrl+Z)')
    const redoButton = screen.getByTitle('Redo (Ctrl+Y)')
    
    // Initially, undo should be disabled, redo should be disabled
    expect(undoButton).toBeDisabled()
    expect(redoButton).toBeDisabled()
    
    // Add a node
    const circleButton = screen.getByTitle('Circle')
    await user.click(circleButton)
    
    const reactFlow = document.querySelector('.react-flow__pane')
    if (!reactFlow) throw new Error('React Flow pane not found')
    await user.click(reactFlow)
    
    // Wait for history to save
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Now undo should be enabled
    await waitFor(() => {
      expect(undoButton).not.toBeDisabled()
    })
    expect(redoButton).toBeDisabled()
    
    // Undo
    await user.click(undoButton)
    
    // Now redo should be enabled
    await waitFor(() => {
      expect(redoButton).not.toBeDisabled()
    })
  })
  
  test('should not break redo when performing same operation after undo', async () => {
    const user = userEvent.setup()
    render(<NodeEditor />)
    
    await waitFor(() => {
      expect(screen.getByText('Rectangle')).toBeDefined()
    })
    
    // Add a node
    const circleButton = screen.getByTitle('Circle')
    await user.click(circleButton)
    
    const reactFlow = document.querySelector('.react-flow__pane')
    if (!reactFlow) throw new Error('React Flow pane not found')
    await user.click(reactFlow)
    
    // Wait for the new node and history save
    await waitFor(() => {
      const nodes = document.querySelectorAll('.react-flow__node')
      expect(nodes).toHaveLength(2)
    })
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Undo
    const undoButton = screen.getByTitle('Undo (Ctrl+Z)')
    await user.click(undoButton)
    
    await waitFor(() => {
      const nodes = document.querySelectorAll('.react-flow__node')
      expect(nodes).toHaveLength(1)
    })
    
    // Wait to ensure debounced save doesn't interfere
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Redo should still be available
    const redoButton = screen.getByTitle('Redo (Ctrl+Y)')
    expect(redoButton).not.toBeDisabled()
    
    // Redo should work
    await user.click(redoButton)
    
    await waitFor(() => {
      const nodes = document.querySelectorAll('.react-flow__node')
      expect(nodes).toHaveLength(2)
    })
  })
})