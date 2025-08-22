import { atom } from 'jotai'
import { DiagramType } from './common/types'

// Raw code text that user edits
export const rawCodeAtom = atom<string>('flowchart TD\n    N0[Rectangle]')

// Current diagram type being edited
export const diagramTypeAtom = atom<DiagramType>('flowchart')

// Parse error if any
export const parseErrorAtom = atom<string | null>(null)

// Is user currently editing
export const isEditingAtom = atom<boolean>(false)