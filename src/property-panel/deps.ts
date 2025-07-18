// External dependencies
export { atom } from 'jotai'
export { useAtom, useAtomValue, useSetAtom } from 'jotai'

// Flowchart atoms
export {
  nodesAtom,
  edgesAtom,
  updateNodeAtom,
  updateEdgeAtom,
} from '../flowchart/index'

// Common types
export type { Node, Edge } from '../common/types/index'
