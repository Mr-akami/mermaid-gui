import {
  atom,
  buildFlowchartCode,
  Node,
  Edge,
  FlowchartData,
  saveToHistoryAtom,
  parseFlowchartCode,
} from './deps'
import { rawCodeAtom, diagramTypeAtom, parseErrorAtom, isEditingAtom } from '../editor/atoms'

// Counter atoms for sequential IDs
const nodeCountersAtom = atom<Record<string, number>>({
  rectangle: 0,
  circle: 0,
  diamond: 0,
  subgraph: 0,
})

// Base atoms for nodes and edges
export const nodesAtom = atom<Node[]>([])
export const edgesAtom = atom<Edge[]>([])

// Layout direction atom
export const layoutDirectionAtom = atom<'TD' | 'LR' | 'RL' | 'BT'>('TD')

// Helper function to get appropriate handles based on layout direction
const getHandlesForDirection = (direction: 'TD' | 'LR' | 'RL' | 'BT') => {
  switch (direction) {
    case 'TD':
      return { source: 'bottom', target: 'top' }
    case 'BT':
      return { source: 'top', target: 'bottom' }
    case 'LR':
      return { source: 'right', target: 'left' }
    case 'RL':
      return { source: 'left', target: 'right' }
    default:
      return { source: 'bottom', target: 'top' }
  }
}

// Write atom for updating layout direction and adjusting edges
export const updateLayoutDirectionAtom = atom(
  null,
  (get, set, newDirection: 'TD' | 'LR' | 'RL' | 'BT') => {
    const currentDirection = get(layoutDirectionAtom)
    if (currentDirection === newDirection) return
    
    set(layoutDirectionAtom, newDirection)
    
    // Update all edges to use appropriate handles for new direction
    const edges = get(edgesAtom)
    const nodes = get(nodesAtom)
    
    // Build a map of node IDs to their parent subgraph's direction
    const nodeDirectionMap = new Map<string, 'TD' | 'LR' | 'RL' | 'BT'>()
    
    nodes.forEach(node => {
      if (node.parentId) {
        const parent = nodes.find(n => n.id === node.parentId)
        if (parent?.type === 'subgraph' && parent.direction) {
          // Use parent subgraph's direction
          nodeDirectionMap.set(node.id, parent.direction as 'TD' | 'LR' | 'RL' | 'BT')
        }
      }
    })
    
    const updatedEdges = edges.map(edge => {
      // Check if either source or target has a specific direction from their subgraph
      const sourceDirection = nodeDirectionMap.get(edge.source)
      const targetDirection = nodeDirectionMap.get(edge.target)
      
      // Use subgraph direction if both nodes are in the same subgraph with a direction
      // Otherwise use the global direction
      const effectiveDirection = (sourceDirection && sourceDirection === targetDirection) 
        ? sourceDirection 
        : newDirection
      
      const handles = getHandlesForDirection(effectiveDirection)
      
      return {
        ...edge,
        sourceHandle: handles.source,
        targetHandle: handles.target,
      }
    })
    
    set(edgesAtom, updatedEdges)
    set(saveToHistoryAtom, { nodes: get(nodesAtom), edges: updatedEdges })
  }
)

// Computed atom for flowchart data
export const flowchartDataAtom = atom<FlowchartData>((get) => ({
  nodes: get(nodesAtom),
  edges: get(edgesAtom),
}))

// Computed atom for flowchart mermaid code (GUI -> Code)
export const flowchartMermaidCodeAtom = atom<string>((get) => {
  const flowchartData = get(flowchartDataAtom)
  const layoutDirection = get(layoutDirectionAtom)
  return buildFlowchartCode(flowchartData, layoutDirection)
})

// Sync raw code to flowchart atoms (Code -> GUI)
// This write-only atom is used to manually trigger the sync
export const syncRawCodeToFlowchartAtom = atom(
  null,
  (get, set) => {
    const rawCode = get(rawCodeAtom)
    const diagramType = get(diagramTypeAtom)
    
    // Only sync if diagram type is flowchart
    if (diagramType !== 'flowchart') {
      return
    }
    
    try {
      const result = parseFlowchartCode(rawCode)
      
      if (result && result.nodes && result.edges) {
        // Update layout direction from parsed code
        const parsedDirection = result.direction || 'TD'
        const normalizedDirection = parsedDirection === 'TB' ? 'TD' : 
                                   parsedDirection === 'DT' ? 'BT' : 
                                   parsedDirection as 'TD' | 'LR' | 'RL' | 'BT'
        
        // First set layout direction
        set(layoutDirectionAtom, normalizedDirection)
        
        // Add handles to edges based on direction
        const handles = getHandlesForDirection(normalizedDirection)
        const edgesWithHandles = result.edges.map(edge => ({
          ...edge,
          sourceHandle: handles.source,
          targetHandle: handles.target,
        }))
        
        // Set nodes and edges
        set(nodesAtom, result.nodes)
        set(edgesAtom, edgesWithHandles)
        set(parseErrorAtom, null)
      }
    } catch (err) {
      set(parseErrorAtom, err instanceof Error ? err.message : 'Failed to parse flowchart code')
    }
  }
)

// Sync flowchart atoms to raw code (GUI -> Code)
export const syncFlowchartToRawCodeAtom = atom(
  null,
  (get, set) => {
    const isEditing = get(isEditingAtom)
    
    // Only sync if user is not editing
    if (isEditing) {
      return
    }
    
    const mermaidCode = get(flowchartMermaidCodeAtom)
    set(rawCodeAtom, mermaidCode)
  }
)

// Write atom for adding a node
export const addNodeAtom = atom(
  null,
  (
    get,
    set,
    newNode: {
      type: Node['type']
      position: { x: number; y: number }
      label: string
      parentId?: string
    },
  ) => {
    const nodes = get(nodesAtom)
    const counters = get(nodeCountersAtom)

    // Generate sequential ID based on node type
    const typePrefix: Record<string, string> = {
      rectangle: 'Rect',
      circle: 'Circle',
      diamond: 'Diamond',
      subgraph: 'Subgraph',
      cylindrical: 'Cylinder',
      parallelogram: 'Para',
      trapezoid: 'Trap',
      hexagon: 'Hex',
      doubleCircle: 'DCircle',
      roundEdges: 'Round',
      stadium: 'Stadium',
      subroutine: 'Sub',
    }
    const nextCount = counters[newNode.type] + 1
    const nodeId = `${typePrefix[newNode.type]}${nextCount}`

    // Update counters
    set(nodeCountersAtom, {
      ...counters,
      [newNode.type]: nextCount,
    })

    // Default sizes - subgraph is 4x normal node size
    const defaultNodeSize = { width: 150, height: 50 }
    const defaultSubgraphSize = { width: 600, height: 200 }
    const nodeSize = newNode.type === 'subgraph' ? defaultSubgraphSize : defaultNodeSize

    const node: Node = {
      id: nodeId,
      type: newNode.type,
      parentId: newNode.parentId,
      childIds: [],
      position: newNode.position,
      data: { label: newNode.label },
      width: nodeSize.width,
      height: nodeSize.height,
    }

    // Update parent's childIds if parentId is provided
    if (node.parentId) {
      const updatedNodes = nodes.map((n) =>
        n.id === node.parentId
          ? { ...n, childIds: [...n.childIds, node.id] }
          : n,
      )
      set(nodesAtom, [...updatedNodes, node])
    } else {
      set(nodesAtom, [...nodes, node])
    }

    // Save to history
    set(saveToHistoryAtom, { nodes: get(nodesAtom), edges: get(edgesAtom) })
  },
)

// Write atom for removing a node
export const removeNodeAtom = atom(null, (get, set, nodeId: string) => {
  const nodes = get(nodesAtom)
  const edges = get(edgesAtom)

  // Remove the node and update parent's childIds
  const nodeToRemove = nodes.find((n) => n.id === nodeId)
  const filteredNodes = nodes
    .filter((n) => n.id !== nodeId)
    .map((n) => {
      if (n.id === nodeToRemove?.parentId) {
        return { ...n, childIds: n.childIds.filter((id) => id !== nodeId) }
      }
      return n
    })

  // Remove edges connected to this node
  const filteredEdges = edges.filter(
    (edge) => edge.source !== nodeId && edge.target !== nodeId,
  )

  set(nodesAtom, filteredNodes)
  set(edgesAtom, filteredEdges)
  set(saveToHistoryAtom, { nodes: filteredNodes, edges: filteredEdges })
})

// Write atom for updating a node
export const updateNodeAtom = atom(
  null,
  (
    get,
    set,
    update: {
      id: string
      position?: { x: number; y: number }
      data?: { label: string }
      width?: number
      height?: number
      parentId?: string | null
    },
  ) => {
    const nodes = get(nodesAtom)
    const updatedNodes = nodes.map((node) => {
      if (node.id === update.id) {
        // Handle parent-child relationship updates
        
        let updatedNode = {
          ...node,
          ...(update.position && { position: update.position }),
          ...(update.data && { data: { ...node.data, ...update.data } }),
          ...(update.width !== undefined && { width: update.width }),
          ...(update.height !== undefined && { height: update.height }),
        }
        
        // Handle parentId update
        if (update.parentId !== undefined) {
          if (update.parentId === null) {
            // Removing parent
            delete updatedNode.parentId
          } else {
            // Setting parent
            updatedNode.parentId = update.parentId
          }
        }
        
        return updatedNode
      }
      
      // Update parent nodes' childIds
      if (update.parentId !== undefined) {
        // Remove from old parent's childIds
        if (node.parentId === update.id) {
          return {
            ...node,
            childIds: node.childIds?.filter(id => id !== update.id) || []
          }
        }
        // Add to new parent's childIds
        if (update.parentId && node.id === update.parentId) {
          return {
            ...node,
            childIds: [...(node.childIds || []), update.id]
          }
        }
      }
      
      return node
    })
    set(nodesAtom, updatedNodes)
    set(saveToHistoryAtom, { nodes: updatedNodes, edges: get(edgesAtom) })
  },
)

// Counter atom for edges
const edgeCounterAtom = atom(0)

// Write atom for adding an edge
export const addEdgeAtom = atom(
  null,
  (
    get,
    set,
    newEdge: {
      source: string
      target: string
      type: Edge['type']
      label?: string
    },
  ) => {
    const edges = get(edgesAtom)
    const edgeCounter = get(edgeCounterAtom)
    const nextCount = edgeCounter + 1

    set(edgeCounterAtom, nextCount)

    const edge: Edge = {
      id: `Edge${nextCount}`,
      source: newEdge.source,
      target: newEdge.target,
      type: newEdge.type,
      ...(newEdge.label && { data: { label: newEdge.label } }),
    }
    set(edgesAtom, [...edges, edge])
    set(saveToHistoryAtom, { nodes: get(nodesAtom), edges: [...edges, edge] })
  },
)

// Write atom for updating an edge
export const updateEdgeAtom = atom(
  null,
  (
    get,
    set,
    update: {
      id: string
      data?: { label?: string }
      type?: Edge['type']
    },
  ) => {
    const edges = get(edgesAtom)
    const updatedEdges = edges.map((edge) =>
      edge.id === update.id
        ? {
            ...edge,
            ...(update.data && { data: { ...edge.data, ...update.data } }),
            ...(update.type && { type: update.type }),
          }
        : edge,
    )
    set(edgesAtom, updatedEdges)
    set(saveToHistoryAtom, { nodes: get(nodesAtom), edges: updatedEdges })
  },
)

// Write atom for removing an edge
export const removeEdgeAtom = atom(null, (get, set, edgeId: string) => {
  const edges = get(edgesAtom)
  const filteredEdges = edges.filter((edge) => edge.id !== edgeId)
  set(edgesAtom, filteredEdges)
  set(saveToHistoryAtom, { nodes: get(nodesAtom), edges: filteredEdges })
})
