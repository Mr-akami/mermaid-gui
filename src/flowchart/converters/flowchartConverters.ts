import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react'
import { Node as CustomNode, Edge as CustomEdge } from '../../common/types'

/**
 * Core conversion utilities for flowchart data
 * These functions handle the conversion between different data formats
 * without any UI-specific logic like markerEnd handling
 */

// Convert React Flow node to our custom node type
export function toCustomNode(rfNode: ReactFlowNode): CustomNode {
  return {
    id: rfNode.id,
    type: rfNode.type as CustomNode['type'],
    position: rfNode.position,
    data: {
      label: String(rfNode.data?.label || '')
    },
    childIds: [],
    ...(rfNode.width && { width: rfNode.width }),
    ...(rfNode.height && { height: rfNode.height }),
  }
}

// Convert our custom node to React Flow node
export function toReactFlowNode(customNode: CustomNode): ReactFlowNode {
  const { childIds: _childIds, ...rfNodeProps } = customNode
  return rfNodeProps as ReactFlowNode
}

// Convert React Flow edge to our custom edge type
export function toCustomEdge(rfEdge: ReactFlowEdge): CustomEdge {
  const result: CustomEdge = {
    id: rfEdge.id,
    source: rfEdge.source,
    target: rfEdge.target,
    type: (rfEdge.data?.edgeType || 'normal-arrow') as CustomEdge['type'],
  }
  
  // Preserve handle information
  if (rfEdge.sourceHandle) {
    result.sourceHandle = rfEdge.sourceHandle
  }
  if (rfEdge.targetHandle) {
    result.targetHandle = rfEdge.targetHandle
  }
  
  if (rfEdge.data?.label) {
    result.data = { label: String(rfEdge.data.label) }
  }
  
  return result
}

// Convert our custom edge to React Flow edge
// Note: markerEnd is handled by BiDirectionalEdge component, not here
export function toReactFlowEdge(customEdge: CustomEdge): ReactFlowEdge {
  const result: ReactFlowEdge = {
    id: customEdge.id,
    source: customEdge.source,
    target: customEdge.target,
    type: 'default',
    data: {
      edgeType: customEdge.type,
      ...(customEdge.data?.label && { label: customEdge.data.label }),
    },
  }
  
  // Preserve handle information
  if (customEdge.sourceHandle) {
    result.sourceHandle = customEdge.sourceHandle
  }
  if (customEdge.targetHandle) {
    result.targetHandle = customEdge.targetHandle
  }
  
  return result
}

// Array conversion functions
export function toCustomNodes(rfNodes: ReactFlowNode[]): CustomNode[] {
  return rfNodes.map(toCustomNode)
}

export function toReactFlowNodes(customNodes: CustomNode[]): ReactFlowNode[] {
  return customNodes.map(toReactFlowNode)
}

export function toCustomEdges(rfEdges: ReactFlowEdge[]): CustomEdge[] {
  return rfEdges.map(toCustomEdge)
}

export function toReactFlowEdges(customEdges: CustomEdge[]): ReactFlowEdge[] {
  return customEdges.map(toReactFlowEdge)
}