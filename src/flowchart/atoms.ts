import {
  atom,
  buildFlowchartCode,
  Node,
  Edge,
  FlowchartData,
  saveToHistoryAtom,
} from './deps'

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

// Layout direction atom ('TB' for top-to-bottom, 'LR' for left-to-right)
export const layoutDirectionAtom = atom<'TB' | 'LR'>('TB')

// Helper function to get appropriate handles based on layout direction
const getHandlesForDirection = (direction: 'TB' | 'LR') => {
  if (direction === 'TB') {
    return { source: 'bottom', target: 'top' }
  } else {
    return { source: 'right', target: 'left' }
  }
}

// Write atom for updating layout direction and adjusting edges
export const updateLayoutDirectionAtom = atom(
  null,
  (get, set, newDirection: 'TB' | 'LR') => {
    const currentDirection = get(layoutDirectionAtom)
    if (currentDirection === newDirection) return
    
    set(layoutDirectionAtom, newDirection)
    
    // Update all edges to use appropriate handles for new direction
    const edges = get(edgesAtom)
    const handles = getHandlesForDirection(newDirection)
    
    const updatedEdges = edges.map(edge => ({
      ...edge,
      sourceHandle: handles.source,
      targetHandle: handles.target,
    }))
    
    set(edgesAtom, updatedEdges)
    set(saveToHistoryAtom, { nodes: get(nodesAtom), edges: updatedEdges })
  }
)

// Computed atom for flowchart data
export const flowchartDataAtom = atom<FlowchartData>((get) => ({
  nodes: get(nodesAtom),
  edges: get(edgesAtom),
}))

// Computed atom for mermaid code
export const mermaidCodeAtom = atom<string>((get) => {
  const flowchartData = get(flowchartDataAtom)
  const layoutDirection = get(layoutDirectionAtom)
  return buildFlowchartCode(flowchartData, layoutDirection)
})

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
    const typePrefix = {
      rectangle: 'Rect',
      circle: 'Circle',
      diamond: 'Diamond',
      subgraph: 'Subgraph',
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
    },
  ) => {
    const nodes = get(nodesAtom)
    const updatedNodes = nodes.map((node) =>
      node.id === update.id
        ? {
            ...node,
            ...(update.position && { position: update.position }),
            ...(update.data && { data: { ...node.data, ...update.data } }),
            ...(update.width !== undefined && { width: update.width }),
            ...(update.height !== undefined && { height: update.height }),
          }
        : node,
    )
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
