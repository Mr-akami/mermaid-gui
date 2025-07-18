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

describe('GuiEditor - Node Positioning in Subgraph', () => {
  it('should maintain relative position when node is dropped into subgraph', async () => {
    const store = createStore()
    
    // Set up initial nodes - subgraph at (200, 200), rectangle at (100, 100)
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
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })
    
    // Get initial node positions
    const initialNodes = store.get(nodesAtom)
    const initialRect = initialNodes.find(n => n.id === 'Rect1')
    expect(initialRect?.position).toEqual({ x: 100, y: 100 })
    
    // Simulate dragging rectangle into subgraph
    // The rectangle should end up at a position relative to the subgraph
    const rectNode = screen.getByText('Test Rectangle').closest('.react-flow__node')
    expect(rectNode).toBeTruthy()
    
    // Drag from (100, 100) to (250, 250) - inside the subgraph
    fireEvent.mouseDown(rectNode!)
    fireEvent.mouseMove(rectNode!, { clientX: 250, clientY: 250 })
    fireEvent.mouseUp(rectNode!)
    
    // Wait for parent relationship to be established
    await waitFor(() => {
      const updatedNodes = store.get(nodesAtom)
      const updatedRect = updatedNodes.find(n => n.id === 'Rect1')
      expect(updatedRect?.parentId).toBe('Subgraph1')
    })
    
    // Check that the position is relative to the subgraph
    const finalNodes = store.get(nodesAtom)
    const finalRect = finalNodes.find(n => n.id === 'Rect1')
    
    // When dropped into subgraph, position should be relative to subgraph
    // Expected: (250 - 200, 250 - 200) = (50, 50)
    expect(finalRect?.position.x).toBeCloseTo(50, 0)
    expect(finalRect?.position.y).toBeCloseTo(50, 0)
  })
  
  it('should convert to absolute position when node is removed from subgraph', async () => {
    const store = createStore()
    
    // Set up initial state with rectangle inside subgraph
    store.set(nodesAtom, [
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: ['Rect1'],
        position: { x: 200, y: 200 },
        data: { label: 'Test Subgraph' },
        width: 600,
        height: 200,
      },
      {
        id: 'Rect1',
        type: 'rectangle',
        parentId: 'Subgraph1',
        childIds: [],
        position: { x: 50, y: 50 }, // Relative to subgraph
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
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })
    
    // Simulate dragging rectangle out of subgraph
    const rectNode = screen.getByText('Test Rectangle').closest('.react-flow__node')
    expect(rectNode).toBeTruthy()
    
    // Drag to position outside subgraph
    fireEvent.mouseDown(rectNode!)
    fireEvent.mouseMove(rectNode!, { clientX: 50, clientY: 50 })
    fireEvent.mouseUp(rectNode!)
    
    // Wait for parent relationship to be removed
    await waitFor(() => {
      const updatedNodes = store.get(nodesAtom)
      const updatedRect = updatedNodes.find(n => n.id === 'Rect1')
      expect(updatedRect?.parentId).toBeUndefined()
    })
    
    // Check that the position is now absolute
    const finalNodes = store.get(nodesAtom)
    const finalRect = finalNodes.find(n => n.id === 'Rect1')
    
    // Position should be absolute (not relative to former parent)
    expect(finalRect?.position.x).toBeCloseTo(50, 0)
    expect(finalRect?.position.y).toBeCloseTo(50, 0)
  })
  
  it('should handle nested subgraphs correctly', async () => {
    const store = createStore()
    
    // Set up nested subgraphs
    store.set(nodesAtom, [
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: ['Subgraph2'],
        position: { x: 100, y: 100 },
        data: { label: 'Outer Subgraph' },
        width: 800,
        height: 400,
      },
      {
        id: 'Subgraph2',
        type: 'subgraph',
        parentId: 'Subgraph1',
        childIds: [],
        position: { x: 100, y: 100 }, // Relative to Subgraph1
        data: { label: 'Inner Subgraph' },
        width: 400,
        height: 200,
      },
      {
        id: 'Rect1',
        type: 'rectangle',
        parentId: undefined,
        childIds: [],
        position: { x: 50, y: 50 },
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
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })
    
    // Drag rectangle into inner subgraph
    const rectNode = screen.getByText('Test Rectangle').closest('.react-flow__node')
    expect(rectNode).toBeTruthy()
    
    // Drag to position inside inner subgraph (absolute: 250, 250)
    fireEvent.mouseDown(rectNode!)
    fireEvent.mouseMove(rectNode!, { clientX: 250, clientY: 250 })
    fireEvent.mouseUp(rectNode!)
    
    // Wait for parent relationship
    await waitFor(() => {
      const updatedNodes = store.get(nodesAtom)
      const updatedRect = updatedNodes.find(n => n.id === 'Rect1')
      expect(updatedRect?.parentId).toBe('Subgraph2')
    })
    
    // Check position is relative to inner subgraph
    const finalNodes = store.get(nodesAtom)
    const finalRect = finalNodes.find(n => n.id === 'Rect1')
    
    // Relative position: (250 - 200, 250 - 200) = (50, 50)
    expect(finalRect?.position.x).toBeCloseTo(50, 0)
    expect(finalRect?.position.y).toBeCloseTo(50, 0)
  })
})