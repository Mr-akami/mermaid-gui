import type { Node, Edge, MermaidParseResult } from './deps'
import { nanoid } from './deps'
import { parseNode } from './nodeParser'
import { parseEdge } from './edgeParser'

export function parseFlowchart(code: string, layoutDirection: 'TB' | 'LR' = 'TB'): MermaidParseResult {
  try {
    const lines = code
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length === 0 || !lines[0].startsWith('flowchart')) {
      return {
        success: false,
        error:
          'Invalid syntax: Flowchart must start with "flowchart" directive',
      }
    }

    const nodes: Node[] = []
    const edges: Edge[] = []
    const nodeMap = new Map<string, Node>()
    const subgraphStack: Node[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]

      // Handle end of subgraph
      if (line === 'end') {
        subgraphStack.pop()
        continue
      }

      // Try to parse as node
      const parsedNode = parseNode(line)
      if (parsedNode) {
        const node: Node = {
          id: parsedNode.id,
          type: parsedNode.type,
          parentId:
            subgraphStack.length > 0
              ? subgraphStack[subgraphStack.length - 1].id
              : undefined,
          childIds: [],
          position: { x: 0, y: 0 }, // Position will be determined by layout engine
          data: { label: parsedNode.label },
        }

        nodes.push(node)
        nodeMap.set(node.id, node)

        // Update parent's childIds
        if (node.parentId) {
          const parent = nodeMap.get(node.parentId)
          if (parent) {
            parent.childIds.push(node.id)
          }
        }

        // If it's a subgraph, add to stack
        if (node.type === 'subgraph') {
          subgraphStack.push(node)
        }

        continue
      }

      // Try to parse as edge
      const parsedEdge = parseEdge(line)
      if (parsedEdge) {
        // Helper function to get appropriate handles based on layout direction
        const getHandlesForDirection = (direction: 'TB' | 'LR') => {
          if (direction === 'TB') {
            return { source: 'bottom', target: 'top' }
          } else {
            return { source: 'right', target: 'left' }
          }
        }

        // Helper function to ensure node exists
        const ensureNodeExists = (nodeId: string) => {
          if (!nodeMap.has(nodeId)) {
            const node: Node = {
              id: nodeId,
              type: 'rectangle', // Default type for implicitly created nodes
              parentId: subgraphStack.length > 0 ? subgraphStack[subgraphStack.length - 1].id : undefined,
              childIds: [],
              position: { x: 0, y: 0 },
              data: { label: nodeId }, // Use ID as label by default
            }
            nodes.push(node)
            nodeMap.set(nodeId, node)
            
            // Update parent's childIds
            if (node.parentId) {
              const parent = nodeMap.get(node.parentId)
              if (parent) {
                parent.childIds.push(node.id)
              }
            }
          }
        }

        // Handle & operator by expanding to multiple edges
        if (parsedEdge.sources && parsedEdge.targets) {
          // Multiple sources and/or targets
          for (const source of parsedEdge.sources) {
            ensureNodeExists(source)
            for (const target of parsedEdge.targets) {
              ensureNodeExists(target)
              const handles = getHandlesForDirection(layoutDirection)
              const edge: Edge = {
                id: nanoid(),
                source,
                target,
                sourceHandle: handles.source,
                targetHandle: handles.target,
                type: parsedEdge.type,
                data: parsedEdge.label ? { label: parsedEdge.label } : undefined,
              }
              edges.push(edge)
            }
          }
        } else if (parsedEdge.source && parsedEdge.target) {
          // Single source and target (backward compatibility)
          ensureNodeExists(parsedEdge.source)
          ensureNodeExists(parsedEdge.target)
          const handles = getHandlesForDirection(layoutDirection)
          const edge: Edge = {
            id: nanoid(),
            source: parsedEdge.source,
            target: parsedEdge.target,
            sourceHandle: handles.source,
            targetHandle: handles.target,
            type: parsedEdge.type,
            data: parsedEdge.label ? { label: parsedEdge.label } : undefined,
          }
          edges.push(edge)
        }
        continue
      }

      // If neither node nor edge, skip (could be comments or empty lines)
    }

    // Apply automatic layout after parsing
    applyAutoLayout(nodes, edges, layoutDirection)

    return {
      success: true,
      data: { nodes, edges },
    }
  } catch (error) {
    return {
      success: false,
      error: `Invalid syntax: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

// Auto layout function for arranging nodes based on connections
function applyAutoLayout(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR'): void {
  if (nodes.length === 0) return

  const nodeSpacing = direction === 'TB' ? { x: 200, y: 150 } : { x: 200, y: 150 }
  const startPosition = { x: 100, y: 100 }
  
  // Build adjacency map
  const adjacencyMap = new Map<string, Set<string>>()
  const incomingMap = new Map<string, Set<string>>()
  
  nodes.forEach(node => {
    adjacencyMap.set(node.id, new Set())
    incomingMap.set(node.id, new Set())
  })
  
  edges.forEach(edge => {
    adjacencyMap.get(edge.source)?.add(edge.target)
    incomingMap.get(edge.target)?.add(edge.source)
  })
  
  // Find root nodes (nodes with no incoming edges)
  const rootNodes = nodes.filter(node => incomingMap.get(node.id)?.size === 0)
  
  if (rootNodes.length === 0 && nodes.length > 0) {
    // If no root nodes, pick the first node as root
    rootNodes.push(nodes[0])
  }
  
  const positioned = new Set<string>()
  const levels = new Map<string, number>()
  
  // BFS to assign levels
  const queue: Array<{ node: Node; level: number }> = []
  rootNodes.forEach((node) => {
    queue.push({ node, level: 0 })
    levels.set(node.id, 0)
  })
  
  while (queue.length > 0) {
    const { node, level } = queue.shift()!
    
    if (positioned.has(node.id)) continue
    positioned.add(node.id)
    
    // Position the node
    const nodesAtLevel = Array.from(levels.entries())
      .filter(([_, nodeLevel]) => nodeLevel === level)
      .length
    
    if (direction === 'TB') {
      node.position = {
        x: startPosition.x + (nodesAtLevel - 1) * nodeSpacing.x,
        y: startPosition.y + level * nodeSpacing.y
      }
    } else {
      node.position = {
        x: startPosition.x + level * nodeSpacing.x,
        y: startPosition.y + (nodesAtLevel - 1) * nodeSpacing.y
      }
    }
    
    // Add children to queue
    const children = adjacencyMap.get(node.id) || new Set()
    children.forEach(childId => {
      const childNode = nodes.find(n => n.id === childId)
      if (childNode && !positioned.has(childId)) {
        const childLevel = Math.max(level + 1, levels.get(childId) || 0)
        levels.set(childId, childLevel)
        queue.push({ node: childNode, level: childLevel })
      }
    })
  }
  
  // Position any remaining unconnected nodes
  nodes.forEach((node, index) => {
    if (!positioned.has(node.id)) {
      if (direction === 'TB') {
        node.position = {
          x: startPosition.x + index * nodeSpacing.x,
          y: startPosition.y
        }
      } else {
        node.position = {
          x: startPosition.x,
          y: startPosition.y + index * nodeSpacing.y
        }
      }
    }
  })
}
