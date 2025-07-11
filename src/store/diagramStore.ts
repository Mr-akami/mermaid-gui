import { atom } from 'jotai'

export type DiagramType = 'flowchart' | 'sequence' | 'class' | 'er' | 'state'
export type FlowchartDirection = 'TB' | 'TD' | 'BT' | 'LR' | 'RL'

export const diagramTypeAtom = atom<DiagramType>('flowchart')
export const flowchartDirectionAtom = atom<FlowchartDirection>('TD')

export const diagramTypes = [
  { value: 'flowchart', label: 'Flowchart', icon: '📊' },
  { value: 'sequence', label: 'Sequence', icon: '🔄' },
  { value: 'class', label: 'Class', icon: '📦' },
  { value: 'er', label: 'Entity Relationship', icon: '🗂️' },
  { value: 'state', label: 'State', icon: '🔲' },
] as const