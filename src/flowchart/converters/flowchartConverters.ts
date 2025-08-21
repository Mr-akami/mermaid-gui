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
    ...(rfNode.parentId && { parentId: rfNode.parentId }),
    ...(rfNode.width && { width: rfNode.width }),
    ...(rfNode.height && { height: rfNode.height }),
  }
}

// Convert our custom node to React Flow node
export function toReactFlowNode(customNode: CustomNode, index?: number, isSelected?: boolean): ReactFlowNode {
  const { childIds: _childIds, ...rfNodeProps } = customNode
  
  // Keep subgraph type for React Flow with explicit z-index
  if (customNode.type === 'subgraph') {
    // Keep subgraphs in background even when selected
    const baseZIndex = -1000
    const orderZIndex = index !== undefined ? index : 0
    return {
      ...rfNodeProps,
      type: 'subgraph', // Keep as subgraph, not group
      zIndex: baseZIndex + orderZIndex, // Subgraphs always in background, ordered by creation
      style: {
        zIndex: baseZIndex + orderZIndex,
        width: customNode.width || 200,
        height: customNode.height || 200,
      },
      ...(customNode.parentId && { parentId: customNode.parentId }),
    } as ReactFlowNode
  }
  
  return {
    ...rfNodeProps,
    zIndex: 1000, // Regular nodes in foreground
    style: {
      zIndex: 1000,
    },
    ...(customNode.parentId && { parentId: customNode.parentId }),
  } as ReactFlowNode
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
  const nodes = rfNodes.map(toCustomNode)
  
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

export function toReactFlowNodes(customNodes: CustomNode[]): ReactFlowNode[] {
  // Perform topological sort to ensure parents come before children
  const sorted = topologicalSortNodes(customNodes)
  
  // Sort nodes to place subgraphs at the back (lower z-index)
  // Subgraphs are sorted by their creation order (array index)
  const subgraphs = sorted.filter(n => n.type === 'subgraph')
  const otherNodes = sorted.filter(n => n.type !== 'subgraph')
  
  // Subgraphs first (background), then other nodes (foreground)
  // zIndex property in toReactFlowNode will handle the actual layering
  const finalOrder = [...subgraphs, ...otherNodes]
  
  return finalOrder.map((node, index) => {
    const subgraphIndex = node.type === 'subgraph' ? subgraphs.indexOf(node) : undefined
    return toReactFlowNode(node, subgraphIndex)
  })
}

// Helper function to perform topological sort on nodes based on parent-child relationships
function topologicalSortNodes(nodes: CustomNode[]): CustomNode[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const visited = new Set<string>()
  const result: CustomNode[] = []
  
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

export function toCustomEdges(rfEdges: ReactFlowEdge[]): CustomEdge[] {
  return rfEdges.map(toCustomEdge)
}

export function toReactFlowEdges(customEdges: CustomEdge[]): ReactFlowEdge[] {
  return customEdges.map(toReactFlowEdge)
}