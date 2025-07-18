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
  addNodeAtom,
  FlowchartNode,
  FlowchartEdge,
  ResizableSubgraph,
  selectedElementAtom,
} from './deps'
import {
  reactFlowNodesAtom,
  reactFlowEdgesAtom,
  selectedNodeTypeAtom,
} from './atoms'
import { Toolbar } from './Toolbar'
import { useCallback, useRef } from 'react'

// Node types configuration
const nodeTypes = {
  rectangle: FlowchartNode,
  circle: FlowchartNode,
  diamond: FlowchartNode,
  subgraph: ResizableSubgraph,
}

// Edge types configuration
const edgeTypes = {
  default: FlowchartEdge,
}

export function GuiEditor() {
  // Get atoms
  const nodes = useAtomValue(reactFlowNodesAtom)
  const edges = useAtomValue(reactFlowEdgesAtom)
  const selectedNodeType = useAtomValue(selectedNodeTypeAtom)
  const setSelectedElement = useSetAtom(selectedElementAtom)
  const addNode = useSetAtom(addNodeAtom)
  const addEdge = useSetAtom(addEdgeAtom)
  const updateNode = useSetAtom(updateNodeAtom)
  const removeNode = useSetAtom(removeNodeAtom)
  const removeEdge = useSetAtom(removeEdgeAtom)

  // Use ReactFlow hooks for internal state management
  const [, , onNodesChange] = useNodesState(nodes)
  const [, , onEdgesChange] = useEdgesState(edges)

  // Ref for ReactFlow instance
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<any>(null)

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

  // Handle canvas click to add nodes
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!reactFlowInstance.current) return

      // Get the position relative to the ReactFlow canvas
      const bounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!bounds) return

      const position = reactFlowInstance.current.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })

      addNode({
        type: selectedNodeType,
        position,
        label: `New ${selectedNodeType}`,
      })
    },
    [addNode, selectedNodeType],
  )

  // Handle node click for selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      setSelectedElement({ id: node.id, type: 'node' })
    },
    [setSelectedElement],
  )

  // Handle edge click for selection
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: any) => {
      setSelectedElement({ id: edge.id, type: 'edge' })
    },
    [setSelectedElement],
  )

  // Handle right click on nodes
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault()
      setSelectedElement({ id: node.id, type: 'node' })
      // TODO: Show context menu for z-order
    },
    [setSelectedElement],
  )

  return (
    <div
      className="h-full relative"
      ref={reactFlowWrapper}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Toolbar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeContextMenu={onNodeContextMenu}
        onInit={(instance) => {
          reactFlowInstance.current = instance
        }}
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
