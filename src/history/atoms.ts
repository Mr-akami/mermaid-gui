import { atom } from 'jotai'
import type { Node, Edge } from '../common/types'

interface HistoryState {
  nodes: Node[]
  edges: Edge[]
}

interface History {
  states: HistoryState[]
  currentIndex: number
}

// Maximum number of history states to keep
const MAX_HISTORY_SIZE = 50

// History atom to track state changes
export const historyAtom = atom<History>({
  states: [],
  currentIndex: -1,
})

// Helper to check if two states are equal
const statesAreEqual = (state1: HistoryState, state2: HistoryState): boolean => {
  return JSON.stringify(state1) === JSON.stringify(state2)
}

// Atom to save current state to history
export const saveToHistoryAtom = atom(
  null,
  (get, set, { nodes, edges }: HistoryState) => {
    const history = get(historyAtom)
    const newState = { nodes, edges }
    
    // Don't save if it's the same as current state
    if (history.currentIndex >= 0) {
      const currentState = history.states[history.currentIndex]
      if (statesAreEqual(currentState, newState)) {
        return
      }
    }
    
    // Remove any states after currentIndex when adding new state
    const newStates = history.states.slice(0, history.currentIndex + 1)
    
    // Add new state
    newStates.push(newState)
    
    // Keep only last MAX_HISTORY_SIZE states
    if (newStates.length > MAX_HISTORY_SIZE) {
      newStates.shift()
    }
    
    set(historyAtom, {
      states: newStates,
      currentIndex: newStates.length - 1,
    })
  }
)

// Atom to check if undo is possible
export const canUndoAtom = atom((get) => {
  const history = get(historyAtom)
  return history.currentIndex > 0
})

// Atom to check if redo is possible
export const canRedoAtom = atom((get) => {
  const history = get(historyAtom)
  return history.currentIndex < history.states.length - 1
})

// Atom to perform undo
export const undoAtom = atom(
  null,
  (get, set) => {
    const history = get(historyAtom)
    
    if (history.currentIndex > 0) {
      const newIndex = history.currentIndex - 1
      const previousState = history.states[newIndex]
      
      set(historyAtom, {
        ...history,
        currentIndex: newIndex,
      })
      
      return previousState
    }
    
    return null
  }
)

// Atom to perform redo
export const redoAtom = atom(
  null,
  (get, set) => {
    const history = get(historyAtom)
    
    if (history.currentIndex < history.states.length - 1) {
      const newIndex = history.currentIndex + 1
      const nextState = history.states[newIndex]
      
      set(historyAtom, {
        ...history,
        currentIndex: newIndex,
      })
      
      return nextState
    }
    
    return null
  }
)