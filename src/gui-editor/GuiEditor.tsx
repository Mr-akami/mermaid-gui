import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Connection,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  useAtomValue,
  useSetAtom,
  addEdgeAtom,
  updateNodeAtom,
  removeNodeAtom,
  removeEdgeAtom,
  FlowchartNode,
  FlowchartEdge,
} from './deps'
import { reactFlowNodesAtom, reactFlowEdgesAtom } from './atoms'
import { Toolbar } from './Toolbar'
import { useCallback } from 'react'

// Node types configuration
const nodeTypes = {
  rectangle: FlowchartNode,
  circle: FlowchartNode,
  diamond: FlowchartNode,
  subgraph: FlowchartNode,
}

// Edge types configuration
const edgeTypes = {
  default: FlowchartEdge,
}

export function GuiEditor() {
  // Get atoms
  const nodes = useAtomValue(reactFlowNodesAtom)
  const edges = useAtomValue(reactFlowEdgesAtom)
  const addEdge = useSetAtom(addEdgeAtom)
  const updateNode = useSetAtom(updateNodeAtom)
  const removeNode = useSetAtom(removeNodeAtom)
  const removeEdge = useSetAtom(removeEdgeAtom)

  // Use ReactFlow hooks for internal state management
  const [, , onNodesChange] = useNodesState(nodes)
  const [, , onEdgesChange] = useEdgesState(edges)

  // Handle node position changes
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes)

      // Update atom when node position changes
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateNode({
            id: change.id,
            position: change.position,
          })
        } else if (change.type === 'remove') {
          removeNode(change.id)
        }
      })
    },
    [onNodesChange, updateNode, removeNode],
  )

  // Handle edge changes
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes)

      // Update atom when edge is removed
      changes.forEach((change) => {
        if (change.type === 'remove') {
          removeEdge(change.id)
        }
      })
    },
    [onEdgesChange, removeEdge],
  )

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addEdge({
          source: params.source,
          target: params.target,
          type: 'normal-arrow', // Default edge type
        })
      }
    },
    [addEdge],
  )

  return (
    <div className="h-full relative">
      <Toolbar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}
