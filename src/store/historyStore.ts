import { atom } from 'jotai'
import { Node, Edge } from 'reactflow'
import { nodesAtom, edgesAtom } from './flowStore'

interface HistoryState {
  nodes: Node[]
  edges: Edge[]
}

interface History {
  past: HistoryState[]
  present: HistoryState
  future: HistoryState[]
}

// Initialize with empty state
const initialHistory: History = {
  past: [],
  present: { nodes: [], edges: [] },
  future: [],
}

// Private atom to store history
const historyAtom = atom<History>(initialHistory)

// Helper atom to track if we're in the middle of an undo/redo operation
const isUndoRedoAtom = atom(false)

// Helper atom to track if history has been initialized
const isInitializedAtom = atom(false)

// Helper function to check if states are equal
const statesEqual = (a: HistoryState, b: HistoryState): boolean => {
  if (a.nodes.length !== b.nodes.length || a.edges.length !== b.edges.length) {
    return false
  }
  return JSON.stringify(a) === JSON.stringify(b)
}

// Atom to push current state to history
export const pushToHistoryAtom = atom(
  null,
  (get, set) => {
    const isUndoRedo = get(isUndoRedoAtom)
    if (isUndoRedo) return // Don't push to history during undo/redo
    
    const nodes = get(nodesAtom)
    const edges = get(edgesAtom)
    const history = get(historyAtom)
    const isInitialized = get(isInitializedAtom)
    
    const newState: HistoryState = { nodes: [...nodes], edges: [...edges] }
    
    // Initialize if needed
    if (!isInitialized) {
      set(historyAtom, {
        past: [],
        present: newState,
        future: [],
      })
      set(isInitializedAtom, true)
      return
    }
    
    // Only push if state has changed
    if (!statesEqual(history.present, newState)) {
      set(historyAtom, {
        past: [...history.past, history.present].slice(-50), // Keep last 50 states
        present: newState,
        future: [], // Clear future on new action
      })
    }
  }
)

// Undo atom
export const undoAtom = atom(
  (get) => get(historyAtom).past.length > 0,
  (get, set) => {
    const history = get(historyAtom)
    if (history.past.length === 0) return
    
    const previous = history.past[history.past.length - 1]
    const newPast = history.past.slice(0, -1)
    
    set(isUndoRedoAtom, true)
    set(historyAtom, {
      past: newPast,
      present: previous,
      future: [history.present, ...history.future],
    })
    
    // Update the actual nodes and edges
    set(nodesAtom, previous.nodes)
    set(edgesAtom, previous.edges)
    set(isUndoRedoAtom, false)
  }
)

// Redo atom
export const redoAtom = atom(
  (get) => get(historyAtom).future.length > 0,
  (get, set) => {
    const history = get(historyAtom)
    if (history.future.length === 0) return
    
    const next = history.future[0]
    const newFuture = history.future.slice(1)
    
    set(isUndoRedoAtom, true)
    set(historyAtom, {
      past: [...history.past, history.present],
      present: next,
      future: newFuture,
    })
    
    // Update the actual nodes and edges
    set(nodesAtom, next.nodes)
    set(edgesAtom, next.edges)
    set(isUndoRedoAtom, false)
  }
)

