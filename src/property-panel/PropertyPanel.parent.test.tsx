import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PropertyPanel } from './PropertyPanel'
import { Provider } from 'jotai'
import { nodesAtom, setNodeParentAtom } from './deps'
import { selectedElementAtom } from './atoms'
import { createStore } from 'jotai'

describe('PropertyPanel - Parent-Child Relationships', () => {
  const createTestStore = () => {
    const store = createStore()
    
    // Add test nodes
    store.set(nodesAtom, [
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: [],
        position: { x: 200, y: 200 },
        data: { label: 'Main Container' },
        width: 600,
        height: 200,
      },
      {
        id: 'Subgraph2',
        type: 'subgraph',
        parentId: undefined,
        childIds: [],
        position: { x: 400, y: 200 },
        data: { label: 'Secondary Container' },
        width: 600,
        height: 200,
      },
      {
        id: 'Rect1',
        type: 'rectangle',
        parentId: undefined,
        childIds: [],
        position: { x: 100, y: 100 },
        data: { label: 'Rectangle Node' },
        width: 150,
        height: 50,
      },
    ])
    
    return store
  }

  it('should display parent selector for nodes', () => {
    const store = createTestStore()
    
    // Select a rectangle node
    store.set(selectedElementAtom, { id: 'Rect1', type: 'node' })
    
    render(
      <Provider store={store}>
        <PropertyPanel />
      </Provider>
    )
    
    // Check that parent selector exists
    const parentLabel = screen.getByText('Parent')
    expect(parentLabel).toBeDefined()
    
    const parentSelect = screen.getByRole('combobox')
    expect(parentSelect).toBeDefined()
    
    // Check options
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3) // None + 2 subgraphs
    expect(options[0].textContent).toBe('None')
    expect(options[1].textContent).toBe('Subgraph1 - Main Container')
    expect(options[2].textContent).toBe('Subgraph2 - Secondary Container')
  })

  it('should update parent when selection changes', () => {
    const store = createTestStore()
    const mockSetNodeParent = vi.fn()
    
    // Mock the setNodeParentAtom
    const originalSet = store.set.bind(store)
    store.set = (atom: any, value: any) => {
      if (atom === setNodeParentAtom) {
        mockSetNodeParent(value)
        return
      }
      return originalSet(atom, value)
    }
    
    // Select a rectangle node
    store.set(selectedElementAtom, { id: 'Rect1', type: 'node' })
    
    render(
      <Provider store={store}>
        <PropertyPanel />
      </Provider>
    )
    
    const parentSelect = screen.getByRole('combobox')
    
    // Change parent to Subgraph1
    fireEvent.change(parentSelect, { target: { value: 'Subgraph1' } })
    
    expect(mockSetNodeParent).toHaveBeenCalledWith({
      nodeId: 'Rect1',
      parentId: 'Subgraph1',
    })
  })

  it('should display current parent if node has one', () => {
    const store = createTestStore()
    
    // Update node to have a parent
    const nodes = store.get(nodesAtom)
    store.set(nodesAtom, nodes.map(n => 
      n.id === 'Rect1' 
        ? { ...n, parentId: 'Subgraph1' }
        : n.id === 'Subgraph1'
        ? { ...n, childIds: ['Rect1'] }
        : n
    ))
    
    // Select the rectangle node
    store.set(selectedElementAtom, { id: 'Rect1', type: 'node' })
    
    render(
      <Provider store={store}>
        <PropertyPanel />
      </Provider>
    )
    
    const parentSelect = screen.getByRole('combobox') as HTMLSelectElement
    expect(parentSelect.value).toBe('Subgraph1')
  })

  it('should display children list for subgraph nodes', () => {
    const store = createTestStore()
    
    // Update subgraph to have children
    const nodes = store.get(nodesAtom)
    store.set(nodesAtom, nodes.map(n => 
      n.id === 'Subgraph1' 
        ? { ...n, childIds: ['Rect1'] }
        : n.id === 'Rect1'
        ? { ...n, parentId: 'Subgraph1' }
        : n
    ))
    
    // Select the subgraph
    store.set(selectedElementAtom, { id: 'Subgraph1', type: 'node' })
    
    render(
      <Provider store={store}>
        <PropertyPanel />
      </Provider>
    )
    
    // Check that children are displayed
    const childrenLabel = screen.getByText('Children')
    expect(childrenLabel).toBeDefined()
    
    const childrenText = screen.getByText('Rect1')
    expect(childrenText).toBeDefined()
  })

  it('should not show node as its own parent option', () => {
    const store = createTestStore()
    
    // Select a subgraph node
    store.set(selectedElementAtom, { id: 'Subgraph1', type: 'node' })
    
    render(
      <Provider store={store}>
        <PropertyPanel />
      </Provider>
    )
    
    const options = screen.getAllByRole('option')
    // Should only show None and Subgraph2 (not Subgraph1 itself)
    expect(options).toHaveLength(2)
    expect(options[0].textContent).toBe('None')
    expect(options[1].textContent).toBe('Subgraph2 - Secondary Container')
  })

  it('should allow removing parent by selecting None', () => {
    const store = createTestStore()
    const mockSetNodeParent = vi.fn()
    
    // Mock the setNodeParentAtom
    const originalSet = store.set.bind(store)
    store.set = (atom: any, value: any) => {
      if (atom === setNodeParentAtom) {
        mockSetNodeParent(value)
        return
      }
      return originalSet(atom, value)
    }
    
    // Set up node with parent
    const nodes = store.get(nodesAtom)
    store.set(nodesAtom, nodes.map(n => 
      n.id === 'Rect1' 
        ? { ...n, parentId: 'Subgraph1' }
        : n
    ))
    
    // Select the rectangle node
    store.set(selectedElementAtom, { id: 'Rect1', type: 'node' })
    
    render(
      <Provider store={store}>
        <PropertyPanel />
      </Provider>
    )
    
    const parentSelect = screen.getByRole('combobox')
    
    // Change parent to None
    fireEvent.change(parentSelect, { target: { value: '' } })
    
    expect(mockSetNodeParent).toHaveBeenCalledWith({
      nodeId: 'Rect1',
      parentId: null,
    })
  })
})