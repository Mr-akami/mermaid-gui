import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
  type Node as ReactFlowNode,
  type Edge as ReactFlowEdge,
  type Connection,
  useAtom,
  MarkerType,
  ConnectionMode,
  FlowchartNode,
} from './deps'
import { NodeToolbar } from './NodeToolbar'
import { UndoRedoButtons } from './UndoRedoButtons'
import { PropertyPanel } from './PropertyPanel'
import {
  MERMAID_NODE_TYPES,
  NODE_TYPE_CONFIG,
  nodesAtom,
  edgesAtom,
  BiDirectionalEdge,
  ResizableSubgraph,
  updateNodeAtom,
  updateEdgeAtom,
  layoutDirectionAtom,
} from '../../flowchart'
import { saveToHistoryAtom } from '../../history'
import { toCustomNodes, toReactFlowNodes, toCustomEdges, toReactFlowEdges } from './deps'
import { focusPropertyPanelAtom, selectedNodeIdAtom, selectedEdgeIdAtom } from './atoms'
import type { Edge } from '../../common/types'

// Create nodeTypes object dynamically from MERMAID_NODE_TYPES
const nodeTypes = MERMAID_NODE_TYPES.reduce(
  (acc, type) => {
    // Use ResizableSubgraph for subgraph type
    acc[type] = type === 'subgraph' ? ResizableSubgraph : FlowchartNode
    return acc
  },
  {} as Record<string, typeof FlowchartNode | typeof ResizableSubgraph>,
)

// Define edge types
const edgeTypes = {
  default: BiDirectionalEdge,
}

const initialNodes: ReactFlowNode[] = [
  {
    id: 'N0',
    type: 'rectangle',
    data: { label: NODE_TYPE_CONFIG.rectangle.defaultLabel },
    position: { x: 0, y: 50 },
  },
]

let id = 1
const getId = () => `N${id++}`
const nodeOrigin: [number, number] = [0.5, 0]

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

export function NodeEditorCore() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChangeOriginal] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null)
  const { screenToFlowPosition } = useReactFlow()

  // Connect to flowchart atoms
  const [flowchartNodes, setFlowchartNodes] = useAtom(nodesAtom)
  const [flowchartEdges, setFlowchartEdges] = useAtom(edgesAtom)
  const [layoutDirection] = useAtom(layoutDirectionAtom)
  const [, saveToHistory] = useAtom(saveToHistoryAtom)
  const [, updateNode] = useAtom(updateNodeAtom)
  const [, updateEdge] = useAtom(updateEdgeAtom)
  const [shouldFocusPropertyPanel, setShouldFocusPropertyPanel] = useAtom(focusPropertyPanelAtom)
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom)
  const [selectedEdgeId, setSelectedEdgeId] = useAtom(selectedEdgeIdAtom)
  
  // Custom onNodesChange to prevent selection reset during label editing
  const onNodesChange = useCallback((changes: any) => {
    // Filter out selection changes when we're updating nodes programmatically
    const filteredChanges = changes.filter((change: any) => {
      // Allow all changes except selection changes during updates
      if (change.type === 'select' && selectedNodeId) {
        // Check if this is trying to deselect our selected node
        if (change.id === selectedNodeId && !change.selected) {
          return false
        }
      }
      return true
    })
    onNodesChangeOriginal(filteredChanges)
  }, [onNodesChangeOriginal, selectedNodeId])

  // Track if we're in an undo/redo operation
  const isUndoRedoRef = useRef(false)
  
  // Track if we're updating from code editor to prevent infinite loops
  const isCodeUpdateRef = useRef(false)

  // Get current selection based on tracked IDs
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null
    const node = nodes.find(n => n.id === selectedNodeId)
    return node ? toCustomNodes([node])[0] : null
  }, [selectedNodeId, nodes])
  
  const selectedEdge = useMemo(() => {
    if (!selectedEdgeId) return null  
    const edge = edges.find(e => e.id === selectedEdgeId)
    return edge ? toCustomEdges([edge])[0] : null
  }, [selectedEdgeId, edges])

  // Reset focus flag after PropertyPanel has focused
  useEffect(() => {
    if (shouldFocusPropertyPanel) {
      const timeoutId = setTimeout(() => {
        setShouldFocusPropertyPanel(false)
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [shouldFocusPropertyPanel, setShouldFocusPropertyPanel])

  // Sync flowchart atoms to React Flow state (for code editor updates)
  useEffect(() => {
    if (isCodeUpdateRef.current) {
      isCodeUpdateRef.current = false
      return
    }
    
    // Skip if nodes/edges are empty (initial state)
    if (flowchartNodes.length === 0 && flowchartEdges.length === 0) {
      return
    }
    
    
    // Preserve existing node positions when syncing from code editor
    setNodes(currentNodes => {
      const reactFlowNodes = toReactFlowNodes(flowchartNodes).map(newNode => {
        const existingNode = currentNodes.find(n => n.id === newNode.id)
        if (existingNode) {
          // Preserve position and dimensions of existing node, but keep new z-index
          return {
            ...newNode,
            position: existingNode.position,
            ...(existingNode.width && { width: existingNode.width }),
            ...(existingNode.height && { height: existingNode.height }),
            // Explicitly keep the z-index from toReactFlowNodes
            zIndex: newNode.zIndex,
            style: newNode.style,
          }
        }
        return newNode
      })
      return reactFlowNodes
    })
    
    const reactFlowEdges = toReactFlowEdges(flowchartEdges)
    setEdges(reactFlowEdges)
  }, [flowchartNodes, flowchartEdges, setNodes, setEdges])

  // Initialize history with initial state
  useEffect(() => {
    const customNodes = toCustomNodes(initialNodes)
    isCodeUpdateRef.current = true  // Prevent sync loop during initialization
    setFlowchartNodes(customNodes)
    setFlowchartEdges([])
    saveToHistory({ nodes: customNodes, edges: [] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Sync changes to history (debounced to avoid too many history entries)
  useEffect(() => {
    // Skip saving to history if we're in an undo/redo operation
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false
      return
    }

    const timeoutId = setTimeout(() => {
      if (nodes.length > 0 || edges.length > 0) {
        const customNodes = toCustomNodes(nodes)
        const customEdges = toCustomEdges(edges)
        
        // Check if there are actual changes before updating
        const nodesChanged = JSON.stringify(customNodes) !== JSON.stringify(flowchartNodes)
        const edgesChanged = JSON.stringify(customEdges) !== JSON.stringify(flowchartEdges)
        
        
        if (nodesChanged || edgesChanged) {
          saveToHistory({ nodes: customNodes, edges: customEdges })
          
          // Also sync to flowchart atoms (prevent code editor loop)
          isCodeUpdateRef.current = true
          setFlowchartNodes(customNodes)
          setFlowchartEdges(customEdges)
        }
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [nodes, edges, saveToHistory, setFlowchartNodes, setFlowchartEdges, flowchartNodes, flowchartEdges])

  const onConnect = useCallback(
    (params: Connection) => {
      const handles = getHandlesForDirection(layoutDirection)
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'default',
            data: { edgeType: 'normal-arrow' },
            sourceHandle: params.sourceHandle || handles.source,
            targetHandle: params.targetHandle || handles.target,
          },
          eds,
        ),
      )
    },
    [setEdges, layoutDirection],
  )

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: any) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        const id = getId()
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event
        const newNode = {
          id,
          type: 'rectangle',
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: NODE_TYPE_CONFIG.rectangle.defaultLabel },
          origin: [0.5, 0.0] as [number, number],
          zIndex: 1000, // Regular nodes in foreground
        }

        setNodes((nds) => nds.concat(newNode))
        const handles = getHandlesForDirection(layoutDirection)
        setEdges((eds) =>
          eds.concat([
            {
              id,
              source: connectionState.fromNode.id,
              target: id,
              sourceHandle: connectionState.fromHandle?.id || handles.source,
              targetHandle: handles.target,
              type: 'default',
              data: { edgeType: 'normal-arrow' },
            },
          ]),
        )
      }
    },
    [screenToFlowPosition, setNodes, setEdges, layoutDirection],
  )

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (selectedNodeType) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        const isSubgraph = selectedNodeType === 'subgraph'
        const newNode: ReactFlowNode = {
          id: getId(),
          type: selectedNodeType,
          position,
          data: {
            label:
              NODE_TYPE_CONFIG[
                selectedNodeType as keyof typeof NODE_TYPE_CONFIG
              ]?.defaultLabel || selectedNodeType
          },
          // Set z-index based on node type
          zIndex: isSubgraph ? -1000 : 1000,
          style: {
            zIndex: isSubgraph ? -1000 : 1000,
          }
        }

        setNodes((nds) => {
          // If it's a subgraph, place it at the beginning of the array
          if (isSubgraph) {
            // Find the last subgraph index
            const lastSubgraphIndex = nds.findIndex(n => n.type !== 'subgraph' && n.type !== 'group')
            if (lastSubgraphIndex === -1) {
              // All nodes are subgraphs or no nodes exist
              return nds.concat(newNode)
            }
            // Insert before the first non-subgraph node
            return [...nds.slice(0, lastSubgraphIndex), newNode, ...nds.slice(lastSubgraphIndex)]
          }
          return nds.concat(newNode)
        })
        setSelectedNodeType(null) // Clear selection after adding
      } else {
        // Deselect all nodes and edges when clicking on empty pane
        setNodes(nds => nds.map(n => ({
          ...n,
          selected: false
        })))
        setEdges(eds => eds.map(e => ({
          ...e,
          selected: false
        })))
        setSelectedNodeId(null)
        setSelectedEdgeId(null)
      }
    },
    [selectedNodeType, screenToFlowPosition, setNodes, setEdges, setSelectedNodeId, setSelectedEdgeId],
  )

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, _node: ReactFlowNode) => {
      setShouldFocusPropertyPanel(true)
    },
    [setShouldFocusPropertyPanel],
  )

  const onEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, _edge: ReactFlowEdge) => {
      setShouldFocusPropertyPanel(true)
    },
    [setShouldFocusPropertyPanel],
  )

  // Track if we're updating programmatically
  const isUpdatingRef = useRef(false)
  
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: ReactFlowNode[]; edges: ReactFlowEdge[] }) => {
      // Don't clear selection if we're updating programmatically for nodes
      if (isUpdatingRef.current && selectedNodes.length === 0 && selectedNodeId) {
        // Re-select the node
        setTimeout(() => {
          setNodes(nds => nds.map(n => 
            n.id === selectedNodeId ? { ...n, selected: true } : n
          ))
        }, 0)
        return
      }
      
      // Don't clear selection if we're updating programmatically for edges
      if (isUpdatingRef.current && selectedEdges.length === 0 && selectedEdgeId) {
        // Re-select the edge
        setTimeout(() => {
          setEdges(eds => eds.map(e => 
            e.id === selectedEdgeId ? { ...e, selected: true } : e
          ))
        }, 0)
        return
      }
      
      if (selectedNodes.length > 0) {
        // Deselect all other nodes except the newly selected one
        setNodes(nds => nds.map(n => ({
          ...n,
          selected: selectedNodes.some(sn => sn.id === n.id)
        })))
        // Deselect all edges
        setEdges(eds => eds.map(e => ({
          ...e,
          selected: false
        })))
        setSelectedNodeId(selectedNodes[0].id)
        setSelectedEdgeId(null)
      } else if (selectedEdges.length > 0) {
        // Deselect all nodes
        setNodes(nds => nds.map(n => ({
          ...n,
          selected: false
        })))
        // Deselect all other edges except the newly selected one
        setEdges(eds => eds.map(e => ({
          ...e,
          selected: selectedEdges.some(se => se.id === e.id)
        })))
        setSelectedNodeId(null)
        setSelectedEdgeId(selectedEdges[0].id)
      } else {
        // Deselect everything
        setNodes(nds => nds.map(n => ({
          ...n,
          selected: false
        })))
        setEdges(eds => eds.map(e => ({
          ...e,
          selected: false
        })))
        setSelectedNodeId(null)
        setSelectedEdgeId(null)
      }
    },
    [setSelectedNodeId, setSelectedEdgeId, selectedNodeId, selectedEdgeId, setNodes, setEdges],
  )

  // Handle PropertyPanel updates
  const handleNodeUpdate = useCallback(
    (update: { id: string; data?: { label: string }; type?: string; parentId?: string | null }) => {
      if (update.data) {
        // Mark that we're updating programmatically
        isUpdatingRef.current = true
        
        // Update atom
        updateNode({
          id: update.id,
          data: update.data,
        })
        
        // Also update React Flow nodes immediately for label changes
        // IMPORTANT: Must preserve ALL node properties including selected state
        setNodes((nds) => {
          const updatedNodes = nds.map((node) => {
            if (node.id === update.id) {
              // Create new node object while preserving all existing properties
              const updatedNode = {
                ...node,
                data: { ...node.data, ...update.data },
                selected: true  // Force selection to stay true
              }
              return updatedNode
            }
            return node
          })
          return updatedNodes
        })
        
        // Reset flag after a short delay
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 100)
      }
      if (update.type) {
        // For type changes, we need to update the React Flow nodes directly
        // IMPORTANT: Must preserve ALL node properties including selected state
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === update.id) {
              // Create new node object while preserving all existing properties
              return {
                ...node,
                type: update.type
              }
            }
            return node
          })
        )
      }
      if (update.parentId !== undefined) {
        // Handle parent-child relationship update
        isUpdatingRef.current = true
        
        // Update in atoms first
        updateNode({
          id: update.id,
          parentId: update.parentId
        })
        
        // Update in React Flow nodes
        setNodes((nds) => {
          const targetNode = nds.find(n => n.id === update.id)
          if (!targetNode) return nds
          
          return nds.map((node) => {
            if (node.id === update.id) {
              // If setting a parent, use relative position and add extent
              if (update.parentId) {
                const parentNode = nds.find(n => n.id === update.parentId)
                if (parentNode) {
                  // Convert absolute position to relative position
                  const relativePosition = {
                    x: node.position.x - parentNode.position.x,
                    y: node.position.y - parentNode.position.y
                  }
                  return {
                    ...node,
                    parentId: update.parentId,
                    extent: 'parent' as const,
                    position: relativePosition,
                    selected: true // Keep selection
                  }
                }
              } else {
                // Removing parent - convert relative position to absolute
                const currentParentNode = node.parentId ? nds.find(n => n.id === node.parentId) : null
                const absolutePosition = currentParentNode ? {
                  x: node.position.x + currentParentNode.position.x,
                  y: node.position.y + currentParentNode.position.y
                } : node.position
                
                // Remove parentId and extent
                const { parentId, extent, ...nodeWithoutParent } = node as any
                return {
                  ...nodeWithoutParent,
                  position: absolutePosition,
                  selected: true // Keep selection
                }
              }
            }
            return node
          })
        })
        
        // Reset flag after a short delay
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 100)
      }
    },
    [updateNode, setNodes, isUpdatingRef],
  )

  const handleEdgeUpdate = useCallback(
    (update: { id: string; data?: { label: string }; type?: string }) => {
      // Mark that we're updating programmatically
      isUpdatingRef.current = true
      
      // Update edge in atoms
      const edgeUpdate: Parameters<typeof updateEdge>[0] = {
        id: update.id,
        ...(update.data && { data: update.data }),
        ...(update.type && { type: update.type as Edge['type'] }),
      }
      updateEdge(edgeUpdate)
      
      // Update React Flow edges immediately while preserving selection
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === update.id) {
            let updatedEdge = { 
              ...edge,
              selected: true  // Force selection to stay true
            }
            
            // Update label if provided
            if (update.data) {
              updatedEdge.data = { ...edge.data, ...update.data }
            }
            
            // Update type if provided
            if (update.type) {
              updatedEdge = {
                ...updatedEdge,
                data: { 
                  ...updatedEdge.data, 
                  edgeType: update.type 
                }
              }
            }
            
            return updatedEdge
          }
          return edge
        })
      )
      
      // Reset flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 100)
    },
    [updateEdge, setEdges, isUpdatingRef],
  )

  return (
    <div
      className="wrapper"
      ref={reactFlowWrapper}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: selectedNodeType ? 'crosshair' : 'default',
      }}
    >
      <UndoRedoButtons
        onUndo={(state) => {
          isUndoRedoRef.current = true
          isCodeUpdateRef.current = true
          const rfNodes = toReactFlowNodes(state.nodes)
          const rfEdges = toReactFlowEdges(state.edges)
          setNodes(rfNodes)
          setEdges(rfEdges)
        }}
        onRedo={(state) => {
          isUndoRedoRef.current = true
          isCodeUpdateRef.current = true
          const rfNodes = toReactFlowNodes(state.nodes)
          const rfEdges = toReactFlowEdges(state.edges)
          setNodes(rfNodes)
          setEdges(rfEdges)
        }}
      />
      <NodeToolbar
        onNodeTypeSelect={setSelectedNodeType}
        selectedNodeType={selectedNodeType}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onPaneClick={onPaneClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onSelectionChange={onSelectionChange}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={nodeOrigin}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        selectNodesOnDrag={false}
        multiSelectionKeyCode={null}
        defaultEdgeOptions={{
          type: 'default',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#333',
          },
        }}
      >
        <Background />
      </ReactFlow>
      <PropertyPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onNodeUpdate={handleNodeUpdate}
        onEdgeUpdate={handleEdgeUpdate}
        autoFocus={shouldFocusPropertyPanel}
      />
    </div>
  )
}
