import { atom, nodesAtom, edgesAtom, Node, Edge } from './deps'
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from './deps'

// Computed atom to convert our Node type to ReactFlow Node type
export const reactFlowNodesAtom = atom<ReactFlowNode[]>((get) => {
  const nodes = get(nodesAtom)
  return nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  }))
})

// Computed atom to convert our Edge type to ReactFlow Edge type
export const reactFlowEdgesAtom = atom<ReactFlowEdge[]>((get) => {
  const edges = get(edgesAtom)
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'default',
    data: {
      edgeType: edge.type,
      label: edge.data?.label,
    },
  }))
})
