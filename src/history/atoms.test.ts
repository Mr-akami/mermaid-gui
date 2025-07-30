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
import { Node } from '../common/types'

// Helper to create a valid node
const createNode = (id: string): Node => ({
  id,
  type: 'rectangle',
  childIds: [],
  position: { x: 0, y: 0 },
  data: { label: `Node ${id}` }
})

describe('history atoms', () => {
  test('should save initial state', () => {
    const store = createStore()
    
    const initialState = {
      nodes: [{ 
        id: '1', 
        type: 'rectangle' as const, 
        childIds: [],
        position: { x: 0, y: 0 }, 
        data: { label: 'Node 1' } 
      }],
      edges: []
    }
    
    store.set(saveToHistoryAtom, initialState)
    
    const history = store.get(historyAtom)
    expect(history.states).toHaveLength(1)
    expect(history.currentIndex).toBe(0)
    expect(history.states[0]).toEqual(initialState)
  })

  test('should add multiple states to history', () => {
    const store = createStore()
    
    const state1 = { nodes: [createNode('1')], edges: [] }
    const state2 = { nodes: [createNode('1'), createNode('2')], edges: [] }
    const state3 = { nodes: [createNode('1'), createNode('2'), createNode('3')], edges: [] }
    
    store.set(saveToHistoryAtom, state1)
    store.set(saveToHistoryAtom, state2)
    store.set(saveToHistoryAtom, state3)
    
    const history = store.get(historyAtom)
    expect(history.states).toHaveLength(3)
    expect(history.currentIndex).toBe(2)
  })

  test('should perform undo', () => {
    const store = createStore()
    
    const state1 = { nodes: [createNode('1')], edges: [] }
    const state2 = { nodes: [createNode('1'), createNode('2')], edges: [] }
    
    store.set(saveToHistoryAtom, state1)
    store.set(saveToHistoryAtom, state2)
    
    const previousState = store.set(undoAtom)
    
    expect(previousState).toEqual(state1)
    expect(store.get(historyAtom).currentIndex).toBe(0)
  })

  test('should perform redo after undo', () => {
    const store = createStore()
    
    const state1 = { nodes: [createNode('1')], edges: [] }
    const state2 = { nodes: [createNode('1'), createNode('2')], edges: [] }
    
    store.set(saveToHistoryAtom, state1)
    store.set(saveToHistoryAtom, state2)
    
    // Undo
    store.set(undoAtom)
    expect(store.get(historyAtom).currentIndex).toBe(0)
    
    // Redo
    const nextState = store.set(redoAtom)
    
    expect(nextState).toEqual(state2)
    expect(store.get(historyAtom).currentIndex).toBe(1)
  })

  test('should not break redo when saving the same state after undo', () => {
    const store = createStore()
    
    const state1 = { nodes: [createNode('1')], edges: [] }
    const state2 = { nodes: [createNode('1'), createNode('2')], edges: [] }
    
    store.set(saveToHistoryAtom, state1)
    store.set(saveToHistoryAtom, state2)
    
    // Undo
    const undoState = store.set(undoAtom)
    expect(undoState).toEqual(state1)
    expect(store.get(canRedoAtom)).toBe(true)
    
    // Save the same state (simulating what happens with debounced save)
    store.set(saveToHistoryAtom, state1)
    
    // Redo should still be possible if we saved the same state
    expect(store.get(canRedoAtom)).toBe(true) // Fixed!
  })

  test('should clear redo history when saving a different state after undo', () => {
    const store = createStore()
    
    const state1 = { nodes: [createNode('1')], edges: [] }
    const state2 = { nodes: [createNode('1'), createNode('2')], edges: [] }
    const state3 = { nodes: [createNode('1'), createNode('3')], edges: [] }
    
    store.set(saveToHistoryAtom, state1)
    store.set(saveToHistoryAtom, state2)
    
    // Undo
    store.set(undoAtom)
    
    // Save a different state
    store.set(saveToHistoryAtom, state3)
    
    // Redo should not be possible anymore
    expect(store.get(canRedoAtom)).toBe(false)
    expect(store.get(historyAtom).states).toHaveLength(2)
    expect(store.get(historyAtom).states[1]).toEqual(state3)
  })

  test('canUndo should return correct values', () => {
    const store = createStore()
    
    expect(store.get(canUndoAtom)).toBe(false)
    
    store.set(saveToHistoryAtom, { nodes: [], edges: [] })
    expect(store.get(canUndoAtom)).toBe(false)
    
    store.set(saveToHistoryAtom, { nodes: [createNode('1')], edges: [] })
    expect(store.get(canUndoAtom)).toBe(true)
  })

  test('canRedo should return correct values', () => {
    const store = createStore()
    
    expect(store.get(canRedoAtom)).toBe(false)
    
    store.set(saveToHistoryAtom, { nodes: [], edges: [] })
    store.set(saveToHistoryAtom, { nodes: [createNode('1')], edges: [] })
    
    expect(store.get(canRedoAtom)).toBe(false)
    
    store.set(undoAtom)
    expect(store.get(canRedoAtom)).toBe(true)
  })
})