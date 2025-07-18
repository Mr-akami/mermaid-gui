import { atom, nodesAtom, edgesAtom, Node } from './deps'
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from './deps'

// Selected node type for click-to-add functionality
export const selectedNodeTypeAtom = atom<Node['type']>('rectangle')

// Computed atom to convert our Node type to ReactFlow Node type
export const reactFlowNodesAtom = atom((get) => {
  const nodes = get(nodesAtom)
  return nodes.map(
    (node): ReactFlowNode => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      width: node.width,
      height: node.height,
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
