import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react'
import { IRNode, IREdge } from '../core/types'

/**
 * Conversion utilities from React Flow (Xyflow) to IR (Intermediate Representation)
 */

// Convert React Flow node to IR node
export function toIRNode(rfNode: ReactFlowNode): IRNode {
  return {
    id: rfNode.id,
    type: rfNode.type as IRNode['type'],
    position: rfNode.position,
    data: {
      label: String(rfNode.data?.label || '')
    },
    childIds: [],
    ...(rfNode.parentId && { parentId: rfNode.parentId }),
    ...(rfNode.width && { width: rfNode.width }),
    ...(rfNode.height && { height: rfNode.height }),
    ...(rfNode.data && typeof rfNode.data === 'object' && 'direction' in rfNode.data && rfNode.data.direction ? { direction: rfNode.data.direction as IRNode['direction'] } : {}),
  }
}

// Convert React Flow edge to IR edge
export function toIREdge(rfEdge: ReactFlowEdge): IREdge {
  const result: IREdge = {
    id: rfEdge.id,
    source: rfEdge.source,
    target: rfEdge.target,
    type: (rfEdge.data?.edgeType || 'normal-arrow') as IREdge['type'],
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

// Convert array of React Flow nodes to IR nodes
export function toIRNodes(rfNodes: ReactFlowNode[]): IRNode[] {
  const nodes = rfNodes.map(toIRNode)
  
  // Rebuild childIds based on parentId relationships
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  
  // Clear existing childIds and rebuild
  nodes.forEach(node => {
    node.childIds = []
  })
  
  // Populate childIds based on parentId
  nodes.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!
      if (!parent.childIds) {
        parent.childIds = []
      }
      if (!parent.childIds.includes(node.id)) {
        parent.childIds.push(node.id)
      }
    }
  })
  
  return nodes
}

// Convert array of React Flow edges to IR edges
export function toIREdges(rfEdges: ReactFlowEdge[]): IREdge[] {
  return rfEdges.map(toIREdge)
}

