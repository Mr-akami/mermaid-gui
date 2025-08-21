import type { Node, Edge } from '../../common/types'

export interface ParsedFlowchart {
  direction: 'TD' | 'TB' | 'LR' | 'RL' | 'BT' | 'DT'
  nodes: Node[]
  edges: Edge[]
}

// Node type patterns - order matters for matching
// Using array to guarantee order
const NODE_PATTERNS: Array<[string, RegExp]> = [
  ['doubleCircle', /^([A-Za-z0-9_]+)\(\(\((.*?)\)\)\)$/],  // Must come before circle
  ['circle', /^([A-Za-z0-9_]+)\(\((.*?)\)\)$/],            // Must come before roundEdges
  ['stadium', /^([A-Za-z0-9_]+)\(\[(.*?)\]\)$/],           // Must come before roundEdges
  ['roundEdges', /^([A-Za-z0-9_]+)\((.*?)\)$/],
  ['subroutine', /^([A-Za-z0-9_]+)\[\[(.*?)\]\]$/],        // Must come before rectangle
  ['cylindrical', /^([A-Za-z0-9_]+)\[\((.*?)\)\]$/],       // Must come before rectangle
  ['parallelogram', /^([A-Za-z0-9_]+)\[\/(.*?)\/\]$/],     // Must come before rectangle
  ['trapezoid', /^([A-Za-z0-9_]+)\[\\(.*?)\\]$/],         // Matches [\content\]
  ['rectangle', /^([A-Za-z0-9_]+)\[(.*?)\]$/],
  ['hexagon', /^([A-Za-z0-9_]+)\{\{(.*?)\}\}$/],           // Must come before diamond
  ['diamond', /^([A-Za-z0-9_]+)\{(.*?)\}$/],
]

// Edge type patterns
const EDGE_PATTERNS = {
  'normal': /^-+$/,
  'normal-arrow': /^-+>$/,
  'thick': /^=+$/,
  'thick-arrow': /^=+>$/,
  'dotted': /^-\.-$/,
  'dotted-arrow': /^-\.->$/,
}

export function parseFlowchartCode(code: string): ParsedFlowchart {
  const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  const result: ParsedFlowchart = {
    direction: 'TD',
    nodes: [],
    edges: []
  }
  
  const nodeMap = new Map<string, Node>()
  let currentSubgraph: Node | null = null
  let nodeIdCounter = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Parse flowchart declaration
    if (line.startsWith('flowchart')) {
      const direction = line.split(' ')[1] as any
      if (direction) {
        result.direction = direction
      }
      continue
    }
    
    // Skip subgraph handling for now (can be added later)
    if (line.startsWith('subgraph')) {
      const match = line.match(/subgraph\s+([A-Za-z0-9_]+)?\s*\[(.*?)\]/) || 
                   line.match(/subgraph\s+(.*)/)
      if (match) {
        const id = match[1] || `sg${nodeIdCounter++}`
        const label = match[2] || match[1] || 'Subgraph'
        currentSubgraph = {
          id,
          type: 'subgraph',
          data: { label: label.replace(/<br>/g, '\n') },
          position: { x: 0, y: 0 },
          childIds: [],
          parentId: undefined
        }
        nodeMap.set(id, currentSubgraph)
        result.nodes.push(currentSubgraph)
      }
      continue
    }
    
    if (line === 'end') {
      currentSubgraph = null
      continue
    }
    
    // Parse connections and nodes
    // First check if it's just a node definition without connection
    if (!line.includes('--') && !line.includes('==') && !line.includes('-.')) {
      const node = parseNode(line)
      if (node && !nodeMap.has(node.id)) {
        if (currentSubgraph) {
          node.parentId = currentSubgraph.id
          currentSubgraph.childIds?.push(node.id)
        }
        nodeMap.set(node.id, node)
        result.nodes.push(node)
      }
      continue
    }
    
    // Check for chained connections first (e.g., A --> B --> C)
    const chainPattern = /^(.+?)\s+((?:--|==|-\.)+>?)\s+(.+)$/
    const chainMatch = line.match(chainPattern)
    
    if (chainMatch) {
      const [, firstPart, connector, rest] = chainMatch
      
      // Check if rest contains another connector (chain)
      const restChainMatch = rest.match(/^(.+?)\s+((?:--|==|-\.)+>?)\s+(.+)$/)
      
      if (restChainMatch && restChainMatch[2] === connector) {
        // This is a chained connection
        const nodes = [firstPart, restChainMatch[1], restChainMatch[3]]
        
        // Process each node in the chain
        for (const nodeDef of nodes) {
          const nodeId = getNodeId(nodeDef)
          if (!nodeMap.has(nodeId)) {
            const node = parseNode(nodeDef) || {
              id: nodeId,
              type: 'rectangle' as const,
              data: { label: nodeId },
              position: { x: 0, y: 0 },
              childIds: []
            }
            
            if (currentSubgraph) {
              node.parentId = currentSubgraph.id
              currentSubgraph.childIds?.push(node.id)
            }
            nodeMap.set(node.id, node)
            result.nodes.push(node)
          }
        }
        
        // Create edges between consecutive nodes
        for (let i = 0; i < nodes.length - 1; i++) {
          const sourceId = getNodeId(nodes[i])
          const targetId = getNodeId(nodes[i + 1])
          const edge = parseEdge(sourceId, targetId, connector)
          if (edge) {
            result.edges.push(edge)
          }
        }
        
        continue
      }
    }
    
    // Parse regular connections
    const connectionMatch = line.match(/^([A-Za-z0-9_]+(?:\[.*?\]|\(.*?\)|\{.*?\}|\[\[.*?\]\])*)\s*(.*?)\s*([A-Za-z0-9_]+(?:\[.*?\]|\(.*?\)|\{.*?\}|\[\[.*?\]\])*)$/)
    
    if (connectionMatch) {
      const [, source, connection, target] = connectionMatch
      
      // Parse source node if it has a definition
      if (source && !nodeMap.has(getNodeId(source))) {
        const sourceNode = parseNode(source)
        if (sourceNode) {
          if (currentSubgraph) {
            sourceNode.parentId = currentSubgraph.id
            currentSubgraph.childIds?.push(sourceNode.id)
          }
          nodeMap.set(sourceNode.id, sourceNode)
          result.nodes.push(sourceNode)
        }
      }
      
      // Parse target node if it has a definition
      if (target && !nodeMap.has(getNodeId(target))) {
        const targetNode = parseNode(target)
        if (targetNode) {
          if (currentSubgraph) {
            targetNode.parentId = currentSubgraph.id
            currentSubgraph.childIds?.push(targetNode.id)
          }
          nodeMap.set(targetNode.id, targetNode)
          result.nodes.push(targetNode)
        }
      }
      
      // Parse edge
      if (connection && source && target) {
        const edge = parseEdge(getNodeId(source), getNodeId(target), connection)
        if (edge) {
          result.edges.push(edge)
        }
      }
    }
  }
  
  // Assign positions to nodes (simple grid layout)
  assignNodePositions(result.nodes, result.edges, result.direction)
  
  return result
}

function getNodeId(nodeDefinition: string): string {
  // Extract node ID from node definition
  const match = nodeDefinition.match(/^([A-Za-z0-9_]+)/)
  return match ? match[1] : nodeDefinition
}

function parseNode(nodeDefinition: string): Node | null {
  // Try each node pattern in order
  for (const [type, pattern] of NODE_PATTERNS) {
    const match = nodeDefinition.match(pattern)
    if (match) {
      const [, id, label] = match
      return {
        id,
        type: type as Node['type'],
        data: { 
          label: (label || id).replace(/<br>/g, '\n').replace(/\\(.)/g, '$1')
        },
        position: { x: 0, y: 0 },
        childIds: []
      }
    }
  }
  
  // If no pattern matches, check if it's just an ID
  const idMatch = nodeDefinition.match(/^([A-Za-z0-9_]+)$/)
  if (idMatch) {
    return {
      id: idMatch[1],
      type: 'rectangle',
      data: { label: idMatch[1] },
      position: { x: 0, y: 0 },
      childIds: []
    }
  }
  
  return null
}

function parseEdge(sourceId: string, targetId: string, connection: string): Edge | null {
  // Parse edge type and label
  let edgeType: Edge['type'] = 'normal'
  let label = ''
  
  // Check for label in connection
  const labelMatch = connection.match(/\|(.*?)\|/)
  if (labelMatch) {
    label = labelMatch[1].replace(/<br>/g, '\n')
    connection = connection.replace(/\|.*?\|/, '')
  }
  
  // Determine edge type
  const edgePattern = connection.replace(/\s/g, '')
  for (const [type, pattern] of Object.entries(EDGE_PATTERNS)) {
    if (pattern.test(edgePattern)) {
      edgeType = type as Edge['type']
      break
    }
  }
  
  return {
    id: `${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    type: edgeType,
    ...(label && { data: { label } })
  }
}

function assignNodePositions(nodes: Node[], edges: Edge[], direction: string) {
  // Simple layout algorithm - arrange nodes in a grid
  const levels = calculateNodeLevels(nodes, edges)
  const nodesByLevel = new Map<number, Node[]>()
  
  // Group nodes by level
  for (const node of nodes) {
    const level = levels.get(node.id) || 0
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, [])
    }
    nodesByLevel.get(level)!.push(node)
  }
  
  // Assign positions based on level and index
  // TD and TB have the same behavior (top to bottom)
  // BT and DT have the same behavior (bottom to top)
  const isHorizontal = direction === 'LR' || direction === 'RL'
  const isReversed = direction === 'BT' || direction === 'DT' || direction === 'RL'
  const levelSpacing = 150
  const nodeSpacing = 150
  
  const maxLevel = Math.max(...nodesByLevel.keys())
  
  nodesByLevel.forEach((levelNodes, level) => {
    levelNodes.forEach((node, index) => {
      const effectiveLevel = isReversed ? maxLevel - level : level
      
      if (isHorizontal) {
        node.position = {
          x: effectiveLevel * levelSpacing,
          y: index * nodeSpacing
        }
      } else {
        node.position = {
          x: index * nodeSpacing,
          y: effectiveLevel * levelSpacing
        }
      }
    })
  })
}

function calculateNodeLevels(nodes: Node[], edges: Edge[]): Map<string, number> {
  const levels = new Map<string, number>()
  const visited = new Set<string>()
  
  // Build adjacency list
  const adjacency = new Map<string, string[]>()
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, [])
    }
    adjacency.get(edge.source)!.push(edge.target)
  }
  
  // Find root nodes (nodes with no incoming edges)
  const roots = nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  )
  
  // BFS to assign levels
  const queue: { node: Node; level: number }[] = roots.map(node => ({ node, level: 0 }))
  
  while (queue.length > 0) {
    const { node, level } = queue.shift()!
    
    if (visited.has(node.id)) continue
    visited.add(node.id)
    levels.set(node.id, level)
    
    // Add connected nodes to queue
    const connections = adjacency.get(node.id) || []
    for (const targetId of connections) {
      const targetNode = nodes.find(n => n.id === targetId)
      if (targetNode && !visited.has(targetId)) {
        queue.push({ node: targetNode, level: level + 1 })
      }
    }
  }
  
  // Assign level 0 to any unvisited nodes
  for (const node of nodes) {
    if (!levels.has(node.id)) {
      levels.set(node.id, 0)
    }
  }
  
  return levels
}