import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'jotai'
import { createStore } from 'jotai'
import DiagramTypeSelector from '../DiagramTypeSelector'
import { diagramTypeAtom } from '../../store/diagramStore'
import { nodesAtom, edgesAtom } from '../../store/flowStore'

describe('DiagramTypeSelector', () => {
  it('renders with default diagram type', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <DiagramTypeSelector />
      </Provider>
    )

    const select = screen.getByDisplayValue('📊 Flowchart')
    expect(select).toBeInTheDocument()
  })

  it('displays all available diagram types', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <DiagramTypeSelector />
      </Provider>
    )

    const select = screen.getByRole('combobox')
    const options = select.querySelectorAll('option')
    
    expect(options).toHaveLength(5)
    expect(options[0]).toHaveTextContent('📊 Flowchart')
    expect(options[1]).toHaveTextContent('🔄 Sequence')
    expect(options[2]).toHaveTextContent('📦 Class')
    expect(options[3]).toHaveTextContent('🗂️ Entity Relationship')
    expect(options[4]).toHaveTextContent('🔲 State')
  })

  it('reflects current diagram type from atom', () => {
    const store = createStore()
    store.set(diagramTypeAtom, 'sequence')
    
    render(
      <Provider store={store}>
        <DiagramTypeSelector />
      </Provider>
    )

    const select = screen.getByDisplayValue('🔄 Sequence')
    expect(select).toBeInTheDocument()
  })

  it('updates diagram type atom when user selects different type', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <DiagramTypeSelector />
      </Provider>
    )

    const select = screen.getByRole('combobox')
    
    // Change to sequence diagram
    fireEvent.change(select, { target: { value: 'sequence' } })
    
    expect(store.get(diagramTypeAtom)).toBe('sequence')
  })

  it('clears canvas when diagram type changes via effect atom', () => {
    const store = createStore()
    
    // Set up initial state with nodes and edges
    const initialNodes = [
      {
        id: 'node1',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Test Node', shape: 'rectangle' }
      }
    ]
    
    const initialEdges = [
      {
        id: 'edge1',
        source: 'node1',
        target: 'node2'
      }
    ]
    
    store.set(nodesAtom, initialNodes)
    store.set(edgesAtom, initialEdges)
    
    render(
      <Provider store={store}>
        <DiagramTypeSelector />
      </Provider>
    )

    const select = screen.getByRole('combobox')
    
    // Verify initial state
    expect(store.get(nodesAtom)).toEqual(initialNodes)
    expect(store.get(edgesAtom)).toEqual(initialEdges)
    expect(store.get(diagramTypeAtom)).toBe('flowchart')
    
    // Change diagram type - this should trigger clearing
    fireEvent.change(select, { target: { value: 'class' } })
    
    // Verify canvas is cleared and diagram type is updated
    expect(store.get(nodesAtom)).toEqual([])
    expect(store.get(edgesAtom)).toEqual([])
    expect(store.get(diagramTypeAtom)).toBe('class')
  })

  it('handles all diagram type changes correctly', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <DiagramTypeSelector />
      </Provider>
    )

    const select = screen.getByRole('combobox')
    const diagramTypes = ['sequence', 'class', 'er', 'state', 'flowchart']
    
    diagramTypes.forEach(type => {
      fireEvent.change(select, { target: { value: type } })
      expect(store.get(diagramTypeAtom)).toBe(type)
    })
  })

  it('preserves selection state across re-renders', () => {
    const store = createStore()
    
    const { rerender } = render(
      <Provider store={store}>
        <DiagramTypeSelector />
      </Provider>
    )

    const select = screen.getByRole('combobox')
    
    // Change to ER diagram
    fireEvent.change(select, { target: { value: 'er' } })
    expect(store.get(diagramTypeAtom)).toBe('er')
    
    // Re-render component
    rerender(
      <Provider store={store}>
        <DiagramTypeSelector />
      </Provider>
    )
    
    // Should still show ER as selected
    const updatedSelect = screen.getByDisplayValue('🗂️ Entity Relationship')
    expect(updatedSelect).toBeInTheDocument()
  })

  it('uses effect atom for canvas clearing behavior', () => {
    const store = createStore()
    
    // Add some content to canvas
    const testNodes = [
      {
        id: 'test',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Test', shape: 'rectangle' }
      }
    ]
    
    store.set(nodesAtom, testNodes)
    
    render(
      <Provider store={store}>
        <DiagramTypeSelector />
      </Provider>
    )

    const select = screen.getByRole('combobox')
    
    // Change diagram type
    fireEvent.change(select, { target: { value: 'state' } })
    
    // Verify the component used the effect atom (which clears canvas)
    expect(store.get(nodesAtom)).toEqual([])
    expect(store.get(diagramTypeAtom)).toBe('state')
  })

  it('maintains proper accessibility attributes', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <DiagramTypeSelector />
      </Provider>
    )

    const label = screen.getByText('Diagram Type:')
    const select = screen.getByRole('combobox')
    
    expect(label).toBeInTheDocument()
    expect(select).toBeInTheDocument()
    expect(select).toHaveClass('px-3', 'py-1', 'text-sm')
  })

  it('handles edge case of invalid diagram type gracefully', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <DiagramTypeSelector />
      </Provider>
    )

    const select = screen.getByRole('combobox')
    
    // Try to set an invalid value - should not crash
    fireEvent.change(select, { target: { value: 'invalid' } })
    
    // The atom should handle invalid values gracefully or use fallback
    // This test ensures the component doesn't crash with unexpected values
    expect(select).toBeInTheDocument()
  })
})