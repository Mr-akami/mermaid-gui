import {
  atom,
  nanoid,
  buildFlowchartCode,
  Node,
  Edge,
  FlowchartData,
} from './deps'

// Base atoms for nodes and edges
export const nodesAtom = atom<Node[]>([])
export const edgesAtom = atom<Edge[]>([])

// Computed atom for flowchart data
export const flowchartDataAtom = atom<FlowchartData>((get) => ({
  nodes: get(nodesAtom),
  edges: get(edgesAtom),
}))

// Computed atom for mermaid code
export const mermaidCodeAtom = atom<string>((get) => {
  const flowchartData = get(flowchartDataAtom)
  return buildFlowchartCode(flowchartData)
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
    const node: Node = {
      id: nanoid(),
      type: newNode.type,
      parentId: newNode.parentId,
      childIds: [],
      position: newNode.position,
      data: { label: newNode.label },
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
    },
  ) => {
    const nodes = get(nodesAtom)
    const updatedNodes = nodes.map((node) =>
      node.id === update.id
        ? {
            ...node,
            ...(update.position && { position: update.position }),
            ...(update.data && { data: { ...node.data, ...update.data } }),
          }
        : node,
    )
    set(nodesAtom, updatedNodes)
  },
)

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
    const edge: Edge = {
      id: nanoid(),
      source: newEdge.source,
      target: newEdge.target,
      type: newEdge.type,
      ...(newEdge.label && { data: { label: newEdge.label } }),
    }
    set(edgesAtom, [...edges, edge])
  },
)

// Write atom for removing an edge
export const removeEdgeAtom = atom(null, (get, set, edgeId: string) => {
  const edges = get(edgesAtom)
  set(
    edgesAtom,
    edges.filter((edge) => edge.id !== edgeId),
  )
})
