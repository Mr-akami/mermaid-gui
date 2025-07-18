import { atom, nodesAtom, edgesAtom, Node, Edge } from './deps'

// History state interface
interface HistoryState {
  nodes: Node[]
  edges: Edge[]
}

// History management atoms
const historyAtom = atom<HistoryState[]>([])
const historyIndexAtom = atom(0)

// Helper to save current state to history
export const saveToHistoryAtom = atom(null, (get, set) => {
  const nodes = get(nodesAtom)
  const edges = get(edgesAtom)
  const history = get(historyAtom)
  const currentIndex = get(historyIndexAtom)

  // Remove any states after current index (when new action after undo)
  const newHistory = history.slice(0, currentIndex + 1)

  // Add new state
  newHistory.push({ nodes: [...nodes], edges: [...edges] })

  // Limit history size to prevent memory issues
  if (newHistory.length > 50) {
    newHistory.shift()
  }

  set(historyAtom, newHistory)
  set(historyIndexAtom, newHistory.length - 1)
})

// Undo atom
export const undoAtom = atom(null, (get, set) => {
  const history = get(historyAtom)
  const currentIndex = get(historyIndexAtom)

  if (currentIndex > 0) {
    const newIndex = currentIndex - 1
    const state = history[newIndex]

    set(nodesAtom, [...state.nodes])
    set(edgesAtom, [...state.edges])
    set(historyIndexAtom, newIndex)
  }
})

// Redo atom
export const redoAtom = atom(null, (get, set) => {
  const history = get(historyAtom)
  const currentIndex = get(historyIndexAtom)

  if (currentIndex < history.length - 1) {
    const newIndex = currentIndex + 1
    const state = history[newIndex]

    set(nodesAtom, [...state.nodes])
    set(edgesAtom, [...state.edges])
    set(historyIndexAtom, newIndex)
  }
})

// Can undo/redo atoms
export const canUndoAtom = atom((get) => {
  const currentIndex = get(historyIndexAtom)
  return currentIndex > 0
})

export const canRedoAtom = atom((get) => {
  const history = get(historyAtom)
  const currentIndex = get(historyIndexAtom)
  return currentIndex < history.length - 1
})

// Initialize history with empty state
export const initializeHistoryAtom = atom(null, (get, set) => {
  const nodes = get(nodesAtom)
  const edges = get(edgesAtom)
  set(historyAtom, [{ nodes: [...nodes], edges: [...edges] }])
  set(historyIndexAtom, 0)
})

