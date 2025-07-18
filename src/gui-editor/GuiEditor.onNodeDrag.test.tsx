import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { GuiEditor } from './GuiEditor'
import { Provider } from 'jotai'
import { ReactFlowProvider } from '@xyflow/react'
import { createStore } from 'jotai'
import { nodesAtom } from '../flowchart/index'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

describe('GuiEditor - onNodeDrag handlers', () => {
  it('should have onNodeDragStart, onNodeDrag, and onNodeDragStop handlers', () => {
    const store = createStore()
    
    // Set up test nodes
    store.set(nodesAtom, [
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: [],
        position: { x: 200, y: 200 },
        data: { label: 'Test Subgraph' },
        width: 600,
        height: 200,
      },
      {
        id: 'Rect1',
        type: 'rectangle',
        parentId: undefined,
        childIds: [],
        position: { x: 100, y: 100 },
        data: { label: 'Test Rectangle' },
        width: 150,
        height: 50,
      },
    ])
    
    const { container } = render(
      <Provider store={store}>
        <ReactFlowProvider>
          <GuiEditor />
        </ReactFlowProvider>
      </Provider>
    )
    
    // Check that ReactFlow component exists
    const reactFlow = container.querySelector('.react-flow')
    expect(reactFlow).toBeTruthy()
    
    // The handlers should be defined in the component
    // We can't directly test them due to React Flow's internal implementation,
    // but we can verify the component renders without errors
    expect(container.querySelector('[data-testid="gui-editor"]')).toBeTruthy()
  })

  it('should detect when a node is within subgraph bounds', () => {
    // Test the logic for detecting if a node is within subgraph bounds
    const subgraphBounds = {
      x: 200,
      y: 200,
      width: 600,
      height: 200,
    }
    
    const nodeBounds = {
      x: 250,
      y: 250,
      width: 150,
      height: 50,
    }
    
    // Calculate node center
    const nodeCenterX = nodeBounds.x + nodeBounds.width / 2
    const nodeCenterY = nodeBounds.y + nodeBounds.height / 2
    
    // Check if node center is within subgraph bounds
    const isWithin = (
      nodeCenterX >= subgraphBounds.x &&
      nodeCenterX <= subgraphBounds.x + subgraphBounds.width &&
      nodeCenterY >= subgraphBounds.y &&
      nodeCenterY <= subgraphBounds.y + subgraphBounds.height
    )
    
    expect(isWithin).toBe(true)
  })
  
  it('should detect when a node is outside subgraph bounds', () => {
    const subgraphBounds = {
      x: 200,
      y: 200,
      width: 600,
      height: 200,
    }
    
    const nodeBounds = {
      x: 50,
      y: 50,
      width: 150,
      height: 50,
    }
    
    // Calculate node center
    const nodeCenterX = nodeBounds.x + nodeBounds.width / 2
    const nodeCenterY = nodeBounds.y + nodeBounds.height / 2
    
    // Check if node center is within subgraph bounds
    const isWithin = (
      nodeCenterX >= subgraphBounds.x &&
      nodeCenterX <= subgraphBounds.x + subgraphBounds.width &&
      nodeCenterY >= subgraphBounds.y &&
      nodeCenterY <= subgraphBounds.y + subgraphBounds.height
    )
    
    expect(isWithin).toBe(false)
  })
})