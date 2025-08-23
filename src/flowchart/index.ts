// Export types
export type { IRNode, IREdge, IRFlowchartData, MermaidParseResult } from './core/types'

// Export atoms
export {
  nodesAtom,
  edgesAtom,
  flowchartDataAtom,
  flowchartMermaidCodeAtom,
  syncRawCodeToFlowchartAtom,
  syncFlowchartToRawCodeAtom,
  layoutDirectionAtom,
  updateLayoutDirectionAtom,
  addNodeAtom,
  removeNodeAtom,
  updateNodeAtom,
  addEdgeAtom,
  updateEdgeAtom,
  removeEdgeAtom,
} from './atoms'

// Export components
export { FlowchartNode } from './components/FlowchartNode'
export { FlowchartEdge } from './components/FlowchartEdge'
export { BiDirectionalEdge } from './components/BiDirectionalEdge'
export { ResizableSubgraph } from './components/ResizableSubgraph'

// Export types and constants
export { MERMAID_NODE_TYPES, NODE_TYPE_CONFIG, type MermaidNodeType } from './nodeTypes'
export { MERMAID_EDGE_TYPES, EDGE_TYPE_CONFIG, type MermaidEdgeType } from './edgeTypes'

// Export IRBridge converters
export {
  // From toIRFromXyflow
  toIRNode,
  toIREdge,
  toIRNodes,
  toIREdges,
  // From toXyflowFromIR
  toXyflowNode,
  toXyflowEdge,
  toXyflowNodes,
  toXyflowEdges,

} from './IRBridge'

// Export history
export {
  historyAtom,
  saveToHistoryAtom,
  canUndoAtom,
  canRedoAtom,
  undoAtom,
  redoAtom,
} from './history'

// Export builders and parsers
export { buildFlowchartCode } from './core/builders/flowchartCodeBuilder'
export { parseFlowchartCode } from './core/code-parser/flowchartParser'

// Export editor components
export { FlowchartEditor } from './editor/FlowchartEditor'
export { FlowchartToolbar } from './editor/FlowchartToolbar'
export { FlowchartPropertyPanel } from './editor/FlowchartPropertyPanel'


