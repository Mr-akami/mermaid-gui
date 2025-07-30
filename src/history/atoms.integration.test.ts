import { describe, test, expect } from 'vitest'
import { createStore } from 'jotai'
import { 
  historyAtom, 
  saveToHistoryAtom, 
  undoAtom, 
  redoAtom,
  canUndoAtom,
  canRedoAtom 
} from './atoms'

describe('history atoms integration - redo persistence', () => {
  test('redo should work correctly with debounced saves', async () => {
    const store = createStore()
    
    // Initial state
    const state1 = { 
      nodes: [{ id: '1', type: 'rectangle' as const, position: { x: 0, y: 0 }, data: { label: 'Node 1' } }],
      edges: [] 
    }
    
    // Add second node
    const state2 = { 
      nodes: [
        { id: '1', type: 'rectangle' as const, position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
        { id: '2', type: 'circle' as const, position: { x: 100, y: 100 }, data: { label: 'Node 2' } }
      ],
      edges: [] 
    }
    
    // Save initial states
    store.set(saveToHistoryAtom, state1)
    store.set(saveToHistoryAtom, state2)
    
    // Verify we have 2 states
    expect(store.get(historyAtom).states).toHaveLength(2)
    expect(store.get(historyAtom).currentIndex).toBe(1)
    expect(store.get(canUndoAtom)).toBe(true)
    expect(store.get(canRedoAtom)).toBe(false)
    
    // Perform undo
    const undoState = store.set(undoAtom)
    expect(undoState).toEqual(state1)
    expect(store.get(historyAtom).currentIndex).toBe(0)
    expect(store.get(canRedoAtom)).toBe(true)
    
    // Simulate debounced save trying to save the same state
    store.set(saveToHistoryAtom, state1)
    
    // Redo should still be available
    expect(store.get(canRedoAtom)).toBe(true)
    expect(store.get(historyAtom).states).toHaveLength(2)
    
    // Perform redo
    const redoState = store.set(redoAtom)
    expect(redoState).toEqual(state2)
    expect(store.get(historyAtom).currentIndex).toBe(1)
    expect(store.get(canRedoAtom)).toBe(false)
  })
  
  test('redo should be cleared when adding a different state after undo', async () => {
    const store = createStore()
    
    const state1 = { 
      nodes: [{ id: '1' }],
      edges: [] 
    }
    
    const state2 = { 
      nodes: [{ id: '1' }, { id: '2' }],
      edges: [] 
    }
    
    const state3 = { 
      nodes: [{ id: '1' }, { id: '3' }], // Different from state2
      edges: [] 
    }
    
    // Setup initial states
    store.set(saveToHistoryAtom, state1)
    store.set(saveToHistoryAtom, state2)
    
    // Undo
    store.set(undoAtom)
    expect(store.get(canRedoAtom)).toBe(true)
    
    // Add a different state (not the same as what we undid)
    store.set(saveToHistoryAtom, state3)
    
    // Redo should no longer be available
    expect(store.get(canRedoAtom)).toBe(false)
    expect(store.get(historyAtom).states).toHaveLength(2)
    expect(store.get(historyAtom).states[1]).toEqual(state3)
  })
})