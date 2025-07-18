import { atom, nodesAtom, edgesAtom, Node } from './deps'
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from './deps'

// Selected node type for click-to-add functionality
export const selectedNodeTypeAtom = atom<Node['type']>('rectangle')

// Computed atom to convert our Node type to ReactFlow Node type
export const reactFlowNodesAtom = atom((get) => {
  const nodes = get(nodesAtom)
  
  // Create a map for quick parent lookup
  const nodeMap = new Map(nodes.map(node => [node.id, node]))
  
  // Topological sort to ensure parents come before children
  const sortedNodes: Node[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()
  
  const visit = (nodeId: string) => {
    if (visited.has(nodeId)) return
    if (visiting.has(nodeId)) {
      // Circular dependency detected, skip
      return
    }
    
    visiting.add(nodeId)
    const node = nodeMap.get(nodeId)
    if (!node) return
    
    // Visit parent first
    if (node.parentId && nodeMap.has(node.parentId)) {
      visit(node.parentId)
    }
    
    visiting.delete(nodeId)
    visited.add(nodeId)
    sortedNodes.push(node)
  }
  
  // Visit all nodes
  nodes.forEach(node => visit(node.id))
  
  // Convert to ReactFlow nodes
  return sortedNodes.map(
    (node): ReactFlowNode => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      width: node.width,
      height: node.height,
      parentId: node.parentId,
      // Don't set selected property - let React Flow manage it
    }),
  )
})

// Computed atom to convert our Edge type to ReactFlow Edge type
export const reactFlowEdgesAtom = atom((get) => {
  const edges = get(edgesAtom)
  return edges.map(
    (edge): ReactFlowEdge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'default',
      data: {
        edgeType: edge.type,
        label: edge.data?.label,
      },
    }),
  )
})
