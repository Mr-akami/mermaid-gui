import { atom } from 'jotai'
import { nodesAtom, edgesAtom } from './flowStore'

export type DiagramType = 'flowchart' | 'sequence' | 'class' | 'er' | 'state'
export type FlowchartDirection = 'TB' | 'TD' | 'BT' | 'LR' | 'RL'

export const diagramTypeAtom = atom<DiagramType>('flowchart')
export const flowchartDirectionAtom = atom<FlowchartDirection>('TD')

// Effect atom that clears canvas when diagram type changes
export const diagramTypeClearEffectAtom = atom(
  (get) => get(diagramTypeAtom),
  (_get, set, newDiagramType: DiagramType) => {
    // Clear nodes and edges when diagram type changes
    set(nodesAtom, [])
    set(edgesAtom, [])
    set(diagramTypeAtom, newDiagramType)
  }
)

export const diagramTypes = [
  { value: 'flowchart', label: 'Flowchart', icon: '📊' },
  { value: 'sequence', label: 'Sequence', icon: '🔄' },
  { value: 'class', label: 'Class', icon: '📦' },
  { value: 'er', label: 'Entity Relationship', icon: '🗂️' },
  { value: 'state', label: 'State', icon: '🔲' },
] as const