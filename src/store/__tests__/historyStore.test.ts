import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'jotai'
import { Node, Edge } from 'reactflow'
import { pushToHistoryAtom, undoAtom, redoAtom } from '../historyStore'
import { nodesAtom, edgesAtom } from '../flowStore'

describe('History Store', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore()
  })

  const createTestNode = (id: string, label?: string): Node => ({
    id,
    type: 'flowchart',
    position: { x: 0, y: 0 },
    data: { label: label || id, shape: 'rectangle' }
  })

  const createTestEdge = (id: string, source: string, target: string): Edge => ({
    id,
    source,
    target,
    type: 'flowchart'
  })

  describe('Initial State', () => {
    it('starts with no undo/redo available', () => {
      expect(store.get(undoAtom)).toBe(false)
      expect(store.get(redoAtom)).toBe(false)
    })

    it('initializes history on first push', () => {
      const node = createTestNode('A')
      store.set(nodesAtom, [node])
      store.set(pushToHistoryAtom)

      // After initialization, no undo should be available yet
      expect(store.get(undoAtom)).toBe(false)
      expect(store.get(redoAtom)).toBe(false)
    })
  })

  describe('History Tracking', () => {
    it('tracks state changes', () => {
      // Initialize
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      // Make a change
      const nodeA = createTestNode('A')
      store.set(nodesAtom, [nodeA])
      store.set(pushToHistoryAtom)

      // Now undo should be available
      expect(store.get(undoAtom)).toBe(true)
      expect(store.get(redoAtom)).toBe(false)
    })

    it('does not track identical states', () => {
      const node = createTestNode('A')
      
      // Initialize with same state
      store.set(nodesAtom, [node])
      store.set(pushToHistoryAtom)

      // Push same state again
      store.set(nodesAtom, [node])
      store.set(pushToHistoryAtom)

      // Should not have undo available since state didn't change
      expect(store.get(undoAtom)).toBe(false)
    })

    it('tracks multiple state changes', () => {
      // Initialize
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      // First change
      const nodeA = createTestNode('A')
      store.set(nodesAtom, [nodeA])
      store.set(pushToHistoryAtom)

      // Second change
      const nodeB = createTestNode('B')
      store.set(nodesAtom, [nodeA, nodeB])
      store.set(pushToHistoryAtom)

      // Should be able to undo
      expect(store.get(undoAtom)).toBe(true)
    })

    it('tracks edge changes', () => {
      // Initialize
      store.set(nodesAtom, [])
      store.set(edgesAtom, [])
      store.set(pushToHistoryAtom)

      // Add nodes
      const nodeA = createTestNode('A')
      const nodeB = createTestNode('B')
      store.set(nodesAtom, [nodeA, nodeB])
      store.set(pushToHistoryAtom)

      // Add edge
      const edge = createTestEdge('A-B', 'A', 'B')
      store.set(edgesAtom, [edge])
      store.set(pushToHistoryAtom)

      expect(store.get(undoAtom)).toBe(true)
    })

    it('limits history to 50 states', () => {
      // Initialize
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      // Add 60 different states
      for (let i = 1; i <= 60; i++) {
        const nodes = Array.from({ length: i }, (_, j) => createTestNode(`node${j}`))
        store.set(nodesAtom, nodes)
        store.set(pushToHistoryAtom)
      }

      // Should be able to undo, but not all 60 states
      expect(store.get(undoAtom)).toBe(true)
      
      // Undo all available states
      let undoCount = 0
      while (store.get(undoAtom)) {
        store.set(undoAtom)
        undoCount++
      }
      
      // Should have undone maximum of 50 states
      expect(undoCount).toBeLessThanOrEqual(50)
    })
  })

  describe('Undo Functionality', () => {
    it('undoes single change', () => {
      // Initialize empty
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      // Add node
      const nodeA = createTestNode('A')
      store.set(nodesAtom, [nodeA])
      store.set(pushToHistoryAtom)

      expect(store.get(nodesAtom)).toEqual([nodeA])
      expect(store.get(undoAtom)).toBe(true)

      // Undo
      store.set(undoAtom)

      expect(store.get(nodesAtom)).toEqual([])
      expect(store.get(undoAtom)).toBe(false)
      expect(store.get(redoAtom)).toBe(true)
    })

    it('undoes multiple changes', () => {
      // Initialize
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      // First change
      const nodeA = createTestNode('A')
      store.set(nodesAtom, [nodeA])
      store.set(pushToHistoryAtom)

      // Second change
      const nodeB = createTestNode('B')
      store.set(nodesAtom, [nodeA, nodeB])
      store.set(pushToHistoryAtom)

      // Third change
      const nodeC = createTestNode('C')
      store.set(nodesAtom, [nodeA, nodeB, nodeC])
      store.set(pushToHistoryAtom)

      expect(store.get(nodesAtom)).toEqual([nodeA, nodeB, nodeC])

      // Undo first time
      store.set(undoAtom)
      expect(store.get(nodesAtom)).toEqual([nodeA, nodeB])

      // Undo second time
      store.set(undoAtom)
      expect(store.get(nodesAtom)).toEqual([nodeA])

      // Undo third time
      store.set(undoAtom)
      expect(store.get(nodesAtom)).toEqual([])

      // Should not be able to undo further
      expect(store.get(undoAtom)).toBe(false)
    })

    it('undoes edge changes', () => {
      const nodeA = createTestNode('A')
      const nodeB = createTestNode('B')
      
      // Initialize with nodes
      store.set(nodesAtom, [nodeA, nodeB])
      store.set(edgesAtom, [])
      store.set(pushToHistoryAtom)

      // Add edge
      const edge = createTestEdge('A-B', 'A', 'B')
      store.set(edgesAtom, [edge])
      store.set(pushToHistoryAtom)

      expect(store.get(edgesAtom)).toEqual([edge])

      // Undo
      store.set(undoAtom)

      expect(store.get(edgesAtom)).toEqual([])
      expect(store.get(nodesAtom)).toEqual([nodeA, nodeB])
    })

    it('does nothing when no undo available', () => {
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      expect(store.get(undoAtom)).toBe(false)

      // Try to undo
      store.set(undoAtom)

      // Should remain the same
      expect(store.get(nodesAtom)).toEqual([])
      expect(store.get(undoAtom)).toBe(false)
    })
  })

  describe('Redo Functionality', () => {
    it('redoes single change', () => {
      // Setup with change and undo
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      const nodeA = createTestNode('A')
      store.set(nodesAtom, [nodeA])
      store.set(pushToHistoryAtom)

      store.set(undoAtom) // Undo

      expect(store.get(nodesAtom)).toEqual([])
      expect(store.get(redoAtom)).toBe(true)

      // Redo
      store.set(redoAtom)

      expect(store.get(nodesAtom)).toEqual([nodeA])
      expect(store.get(redoAtom)).toBe(false)
      expect(store.get(undoAtom)).toBe(true)
    })

    it('redoes multiple changes', () => {
      // Setup
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      const nodeA = createTestNode('A')
      store.set(nodesAtom, [nodeA])
      store.set(pushToHistoryAtom)

      const nodeB = createTestNode('B')
      store.set(nodesAtom, [nodeA, nodeB])
      store.set(pushToHistoryAtom)

      // Undo both changes
      store.set(undoAtom)
      store.set(undoAtom)

      expect(store.get(nodesAtom)).toEqual([])

      // Redo first
      store.set(redoAtom)
      expect(store.get(nodesAtom)).toEqual([nodeA])

      // Redo second
      store.set(redoAtom)
      expect(store.get(nodesAtom)).toEqual([nodeA, nodeB])

      expect(store.get(redoAtom)).toBe(false)
    })

    it('does nothing when no redo available', () => {
      const nodeA = createTestNode('A')
      store.set(nodesAtom, [nodeA])
      store.set(pushToHistoryAtom)

      expect(store.get(redoAtom)).toBe(false)

      // Try to redo
      store.set(redoAtom)

      // Should remain the same
      expect(store.get(nodesAtom)).toEqual([nodeA])
      expect(store.get(redoAtom)).toBe(false)
    })

    it('clears redo history on new action', () => {
      // Setup with undo
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      const nodeA = createTestNode('A')
      store.set(nodesAtom, [nodeA])
      store.set(pushToHistoryAtom)

      const nodeB = createTestNode('B')
      store.set(nodesAtom, [nodeA, nodeB])
      store.set(pushToHistoryAtom)

      // Undo one step
      store.set(undoAtom)
      expect(store.get(redoAtom)).toBe(true)

      // Make a new change
      const nodeC = createTestNode('C')
      store.set(nodesAtom, [nodeA, nodeC])
      store.set(pushToHistoryAtom)

      // Redo should no longer be available
      expect(store.get(redoAtom)).toBe(false)
    })
  })

  describe('Undo/Redo Integration', () => {
    it('maintains state consistency through undo/redo cycles', () => {
      // Build up history
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      const states = [
        [createTestNode('A')],
        [createTestNode('A'), createTestNode('B')],
        [createTestNode('A'), createTestNode('B'), createTestNode('C')]
      ]

      states.forEach(state => {
        store.set(nodesAtom, state)
        store.set(pushToHistoryAtom)
      })

      // Undo all
      store.set(undoAtom) // Back to state 2
      store.set(undoAtom) // Back to state 1
      store.set(undoAtom) // Back to initial state

      expect(store.get(nodesAtom)).toEqual([])

      // Redo all
      store.set(redoAtom) // Forward to state 1
      expect(store.get(nodesAtom)).toEqual(states[0])

      store.set(redoAtom) // Forward to state 2
      expect(store.get(nodesAtom)).toEqual(states[1])

      store.set(redoAtom) // Forward to state 3
      expect(store.get(nodesAtom)).toEqual(states[2])
    })

    it('prevents infinite loops during undo/redo operations', () => {
      // This test ensures that undo/redo operations don't trigger pushToHistory
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      const nodeA = createTestNode('A')
      store.set(nodesAtom, [nodeA])
      store.set(pushToHistoryAtom)

      expect(store.get(undoAtom)).toBe(true)

      // Undo should not create new history entries
      store.set(undoAtom)
      
      // Try to push to history during undo state - should be ignored
      store.set(pushToHistoryAtom)
      
      expect(store.get(redoAtom)).toBe(true)
      
      // Redo should restore the previous state
      store.set(redoAtom)
      expect(store.get(nodesAtom)).toEqual([nodeA])
    })
  })

  describe('Complex State Changes', () => {
    it('handles complex node and edge combinations', () => {
      // Initialize
      store.set(nodesAtom, [])
      store.set(edgesAtom, [])
      store.set(pushToHistoryAtom)

      // State 1: Add nodes
      const nodeA = createTestNode('A')
      const nodeB = createTestNode('B')
      store.set(nodesAtom, [nodeA, nodeB])
      store.set(pushToHistoryAtom)

      // State 2: Add edge
      const edge = createTestEdge('A-B', 'A', 'B')
      store.set(edgesAtom, [edge])
      store.set(pushToHistoryAtom)

      // State 3: Add another node
      const nodeC = createTestNode('C')
      store.set(nodesAtom, [nodeA, nodeB, nodeC])
      store.set(pushToHistoryAtom)

      // Verify current state
      expect(store.get(nodesAtom)).toEqual([nodeA, nodeB, nodeC])
      expect(store.get(edgesAtom)).toEqual([edge])

      // Undo to state 2
      store.set(undoAtom)
      expect(store.get(nodesAtom)).toEqual([nodeA, nodeB])
      expect(store.get(edgesAtom)).toEqual([edge])

      // Undo to state 1
      store.set(undoAtom)
      expect(store.get(nodesAtom)).toEqual([nodeA, nodeB])
      expect(store.get(edgesAtom)).toEqual([])

      // Undo to initial state
      store.set(undoAtom)
      expect(store.get(nodesAtom)).toEqual([])
      expect(store.get(edgesAtom)).toEqual([])
    })

    it('handles deep object changes correctly', () => {
      // Initialize
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)

      // Add node with specific data
      const nodeV1 = createTestNode('A', 'Version 1')
      store.set(nodesAtom, [nodeV1])
      store.set(pushToHistoryAtom)

      // Modify node data
      const nodeV2 = { ...nodeV1, data: { ...nodeV1.data, label: 'Version 2' } }
      store.set(nodesAtom, [nodeV2])
      store.set(pushToHistoryAtom)

      expect(store.get(nodesAtom)[0].data.label).toBe('Version 2')

      // Undo
      store.set(undoAtom)
      
      expect(store.get(nodesAtom)[0].data.label).toBe('Version 1')
    })
  })
})