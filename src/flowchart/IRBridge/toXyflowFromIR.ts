import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react'
import { IRNode, IREdge } from '../core/types'

/**
 * Conversion utilities from IR (Intermediate Representation) to React Flow (Xyflow)
 */

// Convert IR node to React Flow node
export function toXyflowNode(irNode: IRNode, index?: number): ReactFlowNode {
  const { childIds: _childIds, direction, ...rfNodeProps } = irNode
  
  // Keep subgraph type for React Flow with explicit z-index
  if (irNode.type === 'subgraph') {
    // Keep subgraphs in background even when selected
    const baseZIndex = -1000
    const orderZIndex = index !== undefined ? index : 0
    return {
      ...rfNodeProps,
      type: 'subgraph', // Keep as subgraph, not group
      data: {
        ...rfNodeProps.data,
        ...(direction && { direction }),
      },
      zIndex: baseZIndex + orderZIndex, // Subgraphs always in background, ordered by creation
      style: {
        zIndex: baseZIndex + orderZIndex,
        width: irNode.width || 200,
        height: irNode.height || 200,
      },
      ...(irNode.parentId && { parentId: irNode.parentId }),
    } as ReactFlowNode
  }
  
  return {
    ...rfNodeProps,
    zIndex: 1000, // Regular nodes in foreground
    style: {
      zIndex: 1000,
    },
    ...(irNode.parentId && { parentId: irNode.parentId }),
  } as ReactFlowNode
}

// Convert IR edge to React Flow edge
// Note: markerEnd is handled by BiDirectionalEdge component, not here
export function toXyflowEdge(irEdge: IREdge): ReactFlowEdge {
  const result: ReactFlowEdge = {
    id: irEdge.id,
    source: irEdge.source,
    target: irEdge.target,
    type: 'default',
    data: {
      edgeType: irEdge.type,
      ...(irEdge.data?.label && { label: irEdge.data.label }),
    },
  }
  
  // Preserve handle information
  if (irEdge.sourceHandle) {
    result.sourceHandle = irEdge.sourceHandle
  }
  if (irEdge.targetHandle) {
    result.targetHandle = irEdge.targetHandle
  }
  
  return result
}

// Convert array of IR nodes to React Flow nodes
export function toXyflowNodes(irNodes: IRNode[]): ReactFlowNode[] {
  // Perform topological sort to ensure parents come before children
  const sorted = topologicalSortNodes(irNodes)
  
  // Sort nodes to place subgraphs at the back (lower z-index)
  // Subgraphs are sorted by their creation order (array index)
  const subgraphs = sorted.filter(n => n.type === 'subgraph')
  const otherNodes = sorted.filter(n => n.type !== 'subgraph')
  
  // Subgraphs first (background), then other nodes (foreground)
  // zIndex property in toXyflowNode will handle the actual layering
  const finalOrder = [...subgraphs, ...otherNodes]
  
  return finalOrder.map((node) => {
    const subgraphIndex = node.type === 'subgraph' ? subgraphs.indexOf(node) : undefined
    return toXyflowNode(node, subgraphIndex)
  })
}

// Helper function to perform topological sort on nodes based on parent-child relationships
function topologicalSortNodes(nodes: IRNode[]): IRNode[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const visited = new Set<string>()
  const result: IRNode[] = []
  
  function visit(nodeId: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    const node = nodeMap.get(nodeId)
    if (!node) return
    
    // Visit parent first
    if (node.parentId && nodeMap.has(node.parentId)) {
      visit(node.parentId)
    }
    
    result.push(node)
  }
  
  // First visit all top-level nodes (nodes without parents)
  nodes.filter(n => !n.parentId).forEach(node => visit(node.id))
  
  // Then visit any remaining nodes (in case of orphaned children)
  nodes.forEach(node => visit(node.id))
  
  return result
}

// Convert array of IR edges to React Flow edges
export function toXyflowEdges(irEdges: IREdge[]): ReactFlowEdge[] {
  return irEdges.map(toXyflowEdge)
}

