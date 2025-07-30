import { describe, it, expect } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { NodeEditor } from './NodeEditor'

describe('NodeEditor', () => {
  it('should render ReactFlow with initial node', async () => {
    const { container } = render(<NodeEditor />)
    
    // Wait for ReactFlow to initialize
    await waitFor(() => {
      const reactFlow = container.querySelector('.react-flow')
      expect(reactFlow).toBeTruthy()
    })
    
    // Check initial node exists
    await waitFor(() => {
      const nodes = container.querySelectorAll('.react-flow__node')
      expect(nodes).toHaveLength(1)
    })
    
    // Check initial node has correct type (changed from input to rectangle)
    const initialNode = container.querySelector('.react-flow__node-rectangle')
    expect(initialNode).toBeTruthy()
  })
  
  it('should create new node when connection is dropped on empty space', async () => {
    const { container } = render(<NodeEditor />)
    
    // Wait for ReactFlow to initialize
    await waitFor(() => {
      const reactFlow = container.querySelector('.react-flow')
      expect(reactFlow).toBeTruthy()
    })
    
    // Initially should have 1 node
    let nodes = container.querySelectorAll('.react-flow__node')
    expect(nodes).toHaveLength(1)
    
    // Test will verify behavior when onConnectEnd is implemented
    // For now, just ensure the component renders without errors
  })
})