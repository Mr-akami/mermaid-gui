import { atom, Node, Edge } from './deps'

// Selected element ID
export const selectedElementIdAtom = atom<string | null>(null)

// Selected element type
export const selectedElementTypeAtom = atom<'node' | 'edge' | null>(null)

// Combined selected element atom
export const selectedElementAtom = atom(
  (get) => {
    const id = get(selectedElementIdAtom)
    const type = get(selectedElementTypeAtom)

    return id && type ? { id, type } : null
  },
  (get, set, value: { id: string; type: 'node' | 'edge' } | null) => {
    if (value) {
      set(selectedElementIdAtom, value.id)
      set(selectedElementTypeAtom, value.type)
    } else {
      set(selectedElementIdAtom, null)
      set(selectedElementTypeAtom, null)
    }
  },
)
