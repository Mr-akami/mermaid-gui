import { describe, it, expect, vi, afterEach, afterAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'jotai'
import { createStore } from 'jotai'
import UndoRedoButtons from '../UndoRedoButtons'
import { nodesAtom } from '../../store/flowStore'
import { pushToHistoryAtom, undoAtom } from '../../store/historyStore'

// Mock console.log
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

describe('UndoRedoButtons', () => {
  afterEach(() => {
    consoleSpy.mockClear()
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  it('renders undo and redo buttons', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )

    expect(screen.getByText('↶ Undo')).toBeInTheDocument()
    expect(screen.getByText('↷ Redo')).toBeInTheDocument()
  })

  it('initially disables both buttons when no history exists', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )

    const undoButton = screen.getByText('↶ Undo')
    const redoButton = screen.getByText('↷ Redo')
    
    expect(undoButton).toBeDisabled()
    expect(redoButton).toBeDisabled()
    expect(undoButton).toHaveClass('bg-gray-300', 'text-gray-500', 'cursor-not-allowed')
    expect(redoButton).toHaveClass('bg-gray-300', 'text-gray-500', 'cursor-not-allowed')
  })

  it('enables undo button when history is available', () => {
    const store = createStore()
    
    // Build up some history
    store.set(nodesAtom, [])
    store.set(pushToHistoryAtom)
    
    const testNode = {
      id: 'test',
      type: 'flowchart',
      position: { x: 0, y: 0 },
      data: { label: 'Test', shape: 'rectangle' }
    }
    
    store.set(nodesAtom, [testNode])
    store.set(pushToHistoryAtom)
    
    render(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )

    const undoButton = screen.getByText('↶ Undo')
    const redoButton = screen.getByText('↷ Redo')
    
    expect(undoButton).not.toBeDisabled()
    expect(redoButton).toBeDisabled()
    expect(undoButton).toHaveClass('bg-gray-600', 'text-white', 'hover:bg-gray-700')
  })

  it('enables redo button after undo operation', () => {
    const store = createStore()
    
    // Build up history and undo
    store.set(nodesAtom, [])
    store.set(pushToHistoryAtom)
    
    const testNode = {
      id: 'test',
      type: 'flowchart',
      position: { x: 0, y: 0 },
      data: { label: 'Test', shape: 'rectangle' }
    }
    
    store.set(nodesAtom, [testNode])
    store.set(pushToHistoryAtom)
    
    // Perform undo
    store.set(undoAtom)
    
    render(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )

    const undoButton = screen.getByText('↶ Undo')
    const redoButton = screen.getByText('↷ Redo')
    
    expect(undoButton).toBeDisabled() // No more undo available
    expect(redoButton).not.toBeDisabled() // Redo is now available
    expect(redoButton).toHaveClass('bg-gray-600', 'text-white', 'hover:bg-gray-700')
  })

  it('triggers undo when undo button clicked', () => {
    const store = createStore()
    
    // Set up history
    store.set(nodesAtom, [])
    store.set(pushToHistoryAtom)
    
    const testNode = {
      id: 'test',
      type: 'flowchart',
      position: { x: 0, y: 0 },
      data: { label: 'Test', shape: 'rectangle' }
    }
    
    store.set(nodesAtom, [testNode])
    store.set(pushToHistoryAtom)
    
    render(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )

    // Verify initial state
    expect(store.get(nodesAtom)).toEqual([testNode])
    
    const undoButton = screen.getByText('↶ Undo')
    fireEvent.click(undoButton)
    
    // Should have performed undo
    expect(store.get(nodesAtom)).toEqual([])
    
    // Should have logged the undo action
    expect(consoleSpy).toHaveBeenCalledWith('Undo clicked, canUndo:', true)
  })

  it('triggers redo when redo button clicked', () => {
    const store = createStore()
    
    // Set up history and undo
    store.set(nodesAtom, [])
    store.set(pushToHistoryAtom)
    
    const testNode = {
      id: 'test',
      type: 'flowchart',
      position: { x: 0, y: 0 },
      data: { label: 'Test', shape: 'rectangle' }
    }
    
    store.set(nodesAtom, [testNode])
    store.set(pushToHistoryAtom)
    store.set(undoAtom) // Undo to enable redo
    
    render(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )

    // Verify state after undo
    expect(store.get(nodesAtom)).toEqual([])
    
    const redoButton = screen.getByText('↷ Redo')
    fireEvent.click(redoButton)
    
    // Should have performed redo
    expect(store.get(nodesAtom)).toEqual([testNode])
    
    // Should have logged the redo action
    expect(consoleSpy).toHaveBeenCalledWith('Redo clicked, canRedo:', true)
  })

  it('updates button states dynamically as history changes', () => {
    const store = createStore()
    
    const { rerender } = render(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )

    let undoButton = screen.getByText('↶ Undo')
    let redoButton = screen.getByText('↷ Redo')
    
    // Initially both disabled
    expect(undoButton).toBeDisabled()
    expect(redoButton).toBeDisabled()
    
    // Add history
    store.set(nodesAtom, [])
    store.set(pushToHistoryAtom)
    
    const testNode = {
      id: 'test',
      type: 'flowchart',
      position: { x: 0, y: 0 },
      data: { label: 'Test', shape: 'rectangle' }
    }
    
    store.set(nodesAtom, [testNode])
    store.set(pushToHistoryAtom)
    
    rerender(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )
    
    undoButton = screen.getByText('↶ Undo')
    redoButton = screen.getByText('↷ Redo')
    
    // Undo should be enabled, redo disabled
    expect(undoButton).not.toBeDisabled()
    expect(redoButton).toBeDisabled()
    
    // Perform undo
    store.set(undoAtom)
    
    rerender(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )
    
    undoButton = screen.getByText('↶ Undo')
    redoButton = screen.getByText('↷ Redo')
    
    // Undo should be disabled, redo enabled
    expect(undoButton).toBeDisabled()
    expect(redoButton).not.toBeDisabled()
  })

  it('handles multiple undo/redo operations correctly', () => {
    const store = createStore()
    
    // Create multiple history states
    const states = [
      [],
      [{ id: 'A', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'A', shape: 'rectangle' } }],
      [
        { id: 'A', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'A', shape: 'rectangle' } },
        { id: 'B', type: 'flowchart', position: { x: 100, y: 0 }, data: { label: 'B', shape: 'rectangle' } }
      ]
    ]
    
    // Build history
    states.forEach(state => {
      store.set(nodesAtom, state)
      store.set(pushToHistoryAtom)
    })
    
    render(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )

    const undoButton = screen.getByText('↶ Undo')
    const redoButton = screen.getByText('↷ Redo')
    
    // Verify final state
    expect(store.get(nodesAtom)).toEqual(states[2])
    expect(undoButton).not.toBeDisabled()
    expect(redoButton).toBeDisabled()
    
    // Undo to previous state
    fireEvent.click(undoButton)
    expect(store.get(nodesAtom)).toEqual(states[1])
    expect(undoButton).not.toBeDisabled()
    expect(redoButton).not.toBeDisabled()
    
    // Undo to initial state
    fireEvent.click(undoButton)
    expect(store.get(nodesAtom)).toEqual(states[0])
    expect(undoButton).toBeDisabled()
    expect(redoButton).not.toBeDisabled()
    
    // Redo back to first state
    fireEvent.click(redoButton)
    expect(store.get(nodesAtom)).toEqual(states[1])
    expect(undoButton).not.toBeDisabled()
    expect(redoButton).not.toBeDisabled()
  })

  it('handles edge case when buttons are clicked while disabled', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )

    const undoButton = screen.getByText('↶ Undo')
    const redoButton = screen.getByText('↷ Redo')
    
    // Buttons should be disabled
    expect(undoButton).toBeDisabled()
    expect(redoButton).toBeDisabled()
    
    // Try to click disabled buttons
    fireEvent.click(undoButton)
    fireEvent.click(redoButton)
    
    // State should remain unchanged
    expect(store.get(nodesAtom)).toEqual([])
    
    // Note: Disabled buttons in React don't actually trigger onClick handlers
    // So we won't see console logs for disabled button clicks
    // This test verifies the buttons are properly disabled and state doesn't change
  })

  it('displays proper tooltips for accessibility', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )

    const undoButton = screen.getByText('↶ Undo')
    const redoButton = screen.getByText('↷ Redo')
    
    expect(undoButton).toHaveAttribute('title', 'Undo (Ctrl+Z)')
    expect(redoButton).toHaveAttribute('title', 'Redo (Ctrl+Shift+Z or Ctrl+Y)')
  })

  it('has proper styling and positioning', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <UndoRedoButtons />
      </Provider>
    )

    const container = screen.getByText('↶ Undo').closest('div')
    
    expect(container).toHaveClass(
      'absolute',
      'top-4',
      'right-4',
      'z-10',
      'bg-white',
      'rounded-lg',
      'shadow-lg',
      'p-2',
      'flex',
      'space-x-2'
    )
  })
})