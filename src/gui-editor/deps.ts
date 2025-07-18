// External dependencies
export { atom } from 'jotai'
export { useAtom, useSetAtom, useAtomValue } from 'jotai'
export {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge as ReactFlowEdge,
  type Node as ReactFlowNode,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
} from 'reactflow'

// Flowchart components and atoms
export { FlowchartNode } from '../flowchart/index'
export { FlowchartEdge } from '../flowchart/index'
export {
  nodesAtom,
  edgesAtom,
  addNodeAtom,
  updateNodeAtom,
  removeNodeAtom,
  addEdgeAtom,
  removeEdgeAtom,
} from '../flowchart/index'

// Common types
export type { Node, Edge } from '../common/types/index'

// Property panel atoms
export { selectedElementAtom } from '../property-panel/index'

// Import ReactFlow CSS
import 'reactflow/dist/style.css'
