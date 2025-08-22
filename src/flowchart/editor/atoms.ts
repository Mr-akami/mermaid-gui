import { atom } from 'jotai'
import { Node, Edge } from '../types'

// Atom to track the currently selected node ID
export const selectedNodeIdAtom = atom<string | null>(null)

// Atom to track the currently selected edge ID
export const selectedEdgeIdAtom = atom<string | null>(null)

// Atom to track the currently selected node
export const selectedNodeAtom = atom<Node | null>(null)

// Atom to track the currently selected edge
export const selectedEdgeAtom = atom<Edge | null>(null)

// Atom to trigger PropertyPanel focus
export const focusPropertyPanelAtom = atom(false)

// Write atom to handle selection updates
export const updateSelectionAtom = atom(
  null,
  (get, set, update: { node?: Node | null; edge?: Edge | null }) => {
    if (update.node !== undefined) {
      set(selectedNodeAtom, update.node)
      // Clear edge selection when node is selected
      if (update.node) {
        set(selectedEdgeAtom, null)
      }
    }
    if (update.edge !== undefined) {
      set(selectedEdgeAtom, update.edge)
      // Clear node selection when edge is selected
      if (update.edge) {
        set(selectedNodeAtom, null)
      }
    }
  }
)