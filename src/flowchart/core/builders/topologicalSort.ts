import type { FlowchartData } from './deps'

/**
 * Topological sort implementation for DAG ordering
 * Sorts nodes based on their dependencies (edges) to ensure
 * that nodes appear before their dependents in the result
 */
export function topologicalSort(
  nodes: FlowchartData['nodes'], 
  edges: FlowchartData['edges']
): FlowchartData['nodes'] {
  if (nodes.length === 0) return []
  
  // Build adjacency list and incoming degree count
  const adjacencyList = new Map<string, Set<string>>()
  const incomingDegree = new Map<string, number>()
  
  // Initialize all nodes
  nodes.forEach(node => {
    adjacencyList.set(node.id, new Set())
    incomingDegree.set(node.id, 0)
  })
  
  // Build graph from edges
  edges.forEach(edge => {
    if (adjacencyList.has(edge.source) && adjacencyList.has(edge.target)) {
      adjacencyList.get(edge.source)!.add(edge.target)
      incomingDegree.set(edge.target, (incomingDegree.get(edge.target) || 0) + 1)
    }
  })
  
  // Find nodes with no incoming edges (roots)
  const queue: string[] = []
  for (const [nodeId, degree] of incomingDegree.entries()) {
    if (degree === 0) {
      queue.push(nodeId)
    }
  }
  
  const result: FlowchartData['nodes'] = []
  const nodeMap = new Map(nodes.map(node => [node.id, node]))
  
  // Process nodes in topological order
  while (queue.length > 0) {
    const currentId = queue.shift()!
    const currentNode = nodeMap.get(currentId)
    
    if (currentNode) {
      result.push(currentNode)
    }
    
    // Update incoming degrees of adjacent nodes
    const adjacentNodes = adjacencyList.get(currentId) || new Set()
    for (const adjacentId of adjacentNodes) {
      const newDegree = (incomingDegree.get(adjacentId) || 0) - 1
      incomingDegree.set(adjacentId, newDegree)
      
      if (newDegree === 0) {
        queue.push(adjacentId)
      }
    }
  }
  
  // Handle remaining nodes (disconnected or in cycles)
  const processedIds = new Set(result.map(node => node.id))
  nodes.forEach(node => {
    if (!processedIds.has(node.id)) {
      result.push(node)
    }
  })
  
  return result
}