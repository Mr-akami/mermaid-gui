// External dependencies
export { atom } from 'jotai'
export { useAtom, useSetAtom, useAtomValue } from 'jotai'
export {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge as ReactFlowEdge,
  type Node as ReactFlowNode,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react'

// Flowchart components and atoms
export { FlowchartNode } from '../flowchart/index'
export { FlowchartEdge } from '../flowchart/index'
export { ResizableSubgraph } from '../flowchart/index'
export {
  nodesAtom,
  edgesAtom,
  addNodeAtom,
  updateNodeAtom,
  removeNodeAtom,
  addEdgeAtom,
  removeEdgeAtom,
} from '../flowchart/index'

// History atoms and hooks
export {
  undoAtom,
  redoAtom,
  canUndoAtom,
  canRedoAtom,
  useUndoRedo,
} from '../history/index'

// Common types
export type { Node, Edge } from '../common/types/index'

// Property panel atoms
export { selectedElementAtom } from '../property-panel/index'

// Import ReactFlow CSS
import '@xyflow/react/dist/style.css'
