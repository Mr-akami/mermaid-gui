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
  Connection,
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
  NodeTypes,
  EdgeTypes,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
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

// Import ReactFlow CSS
import 'reactflow/dist/style.css'
