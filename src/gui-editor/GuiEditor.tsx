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
  setNodeParentAtom,
} from './deps'
import {
  reactFlowNodesAtom,
  reactFlowEdgesAtom,
  selectedNodeTypeAtom,
} from './atoms'
import { Toolbar } from './Toolbar'
import { useCallback, useRef, useEffect, useState } from 'react'
import './GuiEditor.css'

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
  const initialNodes = useAtomValue(reactFlowNodesAtom)
  const initialEdges = useAtomValue(reactFlowEdgesAtom)
  const selectedNodeType = useAtomValue(selectedNodeTypeAtom)
  const setSelectedElement = useSetAtom(selectedElementAtom)
  const addNode = useSetAtom(addNodeAtom)
  const addEdge = useSetAtom(addEdgeAtom)
  const updateNode = useSetAtom(updateNodeAtom)
  const removeNode = useSetAtom(removeNodeAtom)
  const removeEdge = useSetAtom(removeEdgeAtom)
  const setNodeParent = useSetAtom(setNodeParentAtom)

  // Use React Flow's state management
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Ref for ReactFlow instance
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<any>(null)
  
  // State for drag-drop
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

  // Sync React Flow state changes with Jotai atoms
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // First, let React Flow handle the changes (including selection)
      onNodesChange(changes)
      
      // Then sync specific changes with our atoms
      changes.forEach((change) => {
        switch (change.type) {
          case 'position':
            // Update position even while dragging to show live updates
            if (change.position && !change.dragging) {
              updateNode({
                id: change.id,
                position: change.position,
              })
            }
            break
          case 'dimensions':
            if (change.dimensions && change.resizing === false) {
              updateNode({
                id: change.id,
                width: change.dimensions.width,
                height: change.dimensions.height,
              })
            }
            break
          case 'remove':
            removeNode(change.id)
            break
          // Other change types (like select) are handled by React Flow
        }
      })
    },
    [onNodesChange, updateNode, removeNode],
  )

  // Handle edge changes
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      // First, let React Flow handle the changes
      onEdgesChange(changes)
      
      // Then sync with our atoms
      changes.forEach((change) => {
        if (change.type === 'remove') {
          removeEdge(change.id)
        }
        // Other change types are handled automatically by React Flow
      })
    },
    [onEdgesChange, removeEdge],
  )

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const newEdge = {
          id: `edge-${Date.now()}`,
          source: params.source,
          target: params.target,
          type: 'default',
          data: {
            edgeType: 'normal-arrow',
            label: '',
          },
        }
        setEdges((eds) => [...eds, newEdge])
        addEdge({
          source: params.source,
          target: params.target,
          type: 'normal-arrow',
        })
      }
    },
    [setEdges, addEdge],
  )

  // Handle canvas click to add nodes
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      let position = { x: 0, y: 0 }
      
      if (reactFlowInstance.current?.screenToFlowPosition) {
        // Use React Flow's coordinate transformation if available
        position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })
      } else {
        // Fallback: use client coordinates directly (useful in tests)
        position = {
          x: event.clientX,
          y: event.clientY,
        }
      }

      // Generate ID consistent with our atom logic
      const typePrefix = {
        rectangle: 'Rect',
        circle: 'Circle',
        diamond: 'Diamond',
        subgraph: 'Subgraph',
      }
      
      // Count existing nodes of this type
      const existingCount = nodes.filter(n => n.type === selectedNodeType).length
      const id = `${typePrefix[selectedNodeType]}${existingCount + 1}`
      const label = `New ${selectedNodeType}`
      
      const newNode = {
        id,
        type: selectedNodeType,
        position,
        data: { label },
        width: selectedNodeType === 'subgraph' ? 600 : 150,
        height: selectedNodeType === 'subgraph' ? 200 : 50,
      }
      
      // Update React Flow state
      setNodes((nds) => [...nds, newNode])
      
      // Also update Jotai atom
      addNode({
        type: selectedNodeType,
        position,
        label,
      })
    },
    [addNode, selectedNodeType, nodes, setNodes],
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

  // Handle node drag start
  const onNodeDragStart = useCallback(
    (_event: React.MouseEvent, node: any) => {
      setDraggedNodeId(node.id)
    },
    [],
  )

  // Handle node drag
  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, node: any) => {
      if (!draggedNodeId) return

      // Find potential drop targets (subgraphs)
      const potentialTarget = nodes.find(n => {
        if (n.type !== 'subgraph' || n.id === draggedNodeId) return false
        
        // Check if the dragged node is within the bounds of the subgraph
        const subgraphBounds = {
          x: n.position.x,
          y: n.position.y,
          width: n.width || 600,
          height: n.height || 200,
        }
        
        const nodeBounds = {
          x: node.position.x,
          y: node.position.y,
          width: node.width || 150,
          height: node.height || 50,
        }
        
        // Check if node center is within subgraph bounds
        const nodeCenterX = nodeBounds.x + nodeBounds.width / 2
        const nodeCenterY = nodeBounds.y + nodeBounds.height / 2
        
        return (
          nodeCenterX >= subgraphBounds.x &&
          nodeCenterX <= subgraphBounds.x + subgraphBounds.width &&
          nodeCenterY >= subgraphBounds.y &&
          nodeCenterY <= subgraphBounds.y + subgraphBounds.height
        )
      })
      
      setDropTargetId(potentialTarget?.id || null)
      
      // Update visual feedback for drop target
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          className: n.id === potentialTarget?.id ? 'drop-target' : '',
        }))
      )
    },
    [draggedNodeId, nodes, setNodes],
  )

  // Handle drag stop to maintain selection and handle parent-child relationship
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: any) => {
      // Handle parent-child relationship
      if (draggedNodeId && dropTargetId && draggedNodeId !== dropTargetId) {
        setNodeParent({ nodeId: draggedNodeId, parentId: dropTargetId })
      } else if (draggedNodeId && !dropTargetId) {
        // Remove parent if dragged outside any subgraph
        setNodeParent({ nodeId: draggedNodeId, parentId: null })
      }
      
      // Clear drop target styling
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          className: '',
          selected: n.id === node.id ? true : n.selected,
        }))
      )
      
      // Clear drag state
      setDraggedNodeId(null)
      setDropTargetId(null)
    },
    [draggedNodeId, dropTargetId, setNodes, setNodeParent],
  )

  // Sync Jotai atom changes to React Flow state
  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  return (
    <div
      className="h-full relative"
      ref={reactFlowWrapper}
      onContextMenu={(e) => e.preventDefault()}
      data-testid="gui-editor"
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
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onInit={(instance) => {
          reactFlowInstance.current = instance
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={['Delete', 'Backspace']}
        selectionOnDrag={true}
        selectNodesOnDrag={false}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        {/* Define arrow markers for all directions */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            {/* Default/Down arrow */}
            <marker
              id="react-flow__arrow-closed"
              viewBox="0 0 20 20"
              refX="20"
              refY="10"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <path
                d="M 0 0 L 20 10 L 0 20 z"
                fill="#333"
                stroke="#333"
              />
            </marker>
            {/* Down arrow */}
            <marker
              id="react-flow__arrow-down"
              viewBox="0 0 20 20"
              refX="20"
              refY="10"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <path
                d="M 0 0 L 20 10 L 0 20 z"
                fill="#333"
                stroke="#333"
              />
            </marker>
            {/* Up arrow */}
            <marker
              id="react-flow__arrow-up"
              viewBox="0 0 20 20"
              refX="20"
              refY="10"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <path
                d="M 0 0 L 20 10 L 0 20 z"
                fill="#333"
                stroke="#333"
              />
            </marker>
            {/* Right arrow */}
            <marker
              id="react-flow__arrow-right"
              viewBox="0 0 20 20"
              refX="20"
              refY="10"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <path
                d="M 0 0 L 20 10 L 0 20 z"
                fill="#333"
                stroke="#333"
              />
            </marker>
            {/* Left arrow */}
            <marker
              id="react-flow__arrow-left"
              viewBox="0 0 20 20"
              refX="20"
              refY="10"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <path
                d="M 0 0 L 20 10 L 0 20 z"
                fill="#333"
                stroke="#333"
              />
            </marker>
          </defs>
        </svg>
      </ReactFlow>
    </div>
  )
}
