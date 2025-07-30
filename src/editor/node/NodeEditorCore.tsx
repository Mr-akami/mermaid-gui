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
  type Node as ReactFlowNode,
  type Edge as ReactFlowEdge,
  type Connection,
  FlowchartNode,
  useAtom,
  MarkerType,
  ConnectionMode,
} from './deps'
import { NodeToolbar } from './NodeToolbar'
import { UndoRedoButtons } from './UndoRedoButtons'
import { PropertyPanel } from './PropertyPanel'
import { useSelection } from './useSelection'
import {
  MERMAID_NODE_TYPES,
  NODE_TYPE_CONFIG,
  nodesAtom,
  edgesAtom,
  BiDirectionalEdge,
  updateNodeAtom,
  updateEdgeAtom,
  layoutDirectionAtom,
} from '../../flowchart'
import { saveToHistoryAtom } from '../../history'
import { toCustomNodes, toReactFlowNodes, toCustomEdges, toReactFlowEdges } from './deps'
import { focusPropertyPanelAtom } from './atoms'
import type { Edge } from '../../common/types'

// Create nodeTypes object dynamically from MERMAID_NODE_TYPES
const nodeTypes = MERMAID_NODE_TYPES.reduce(
  (acc, type) => {
    acc[type] = FlowchartNode
    return acc
  },
  {} as Record<string, typeof FlowchartNode>,
)

// Define edge types
const edgeTypes = {
  default: BiDirectionalEdge,
}

const initialNodes: ReactFlowNode[] = [
  {
    id: '0',
    type: 'rectangle',
    data: { label: NODE_TYPE_CONFIG.rectangle.defaultLabel },
    position: { x: 0, y: 50 },
  },
]

let id = 1
const getId = () => `${id++}`
const nodeOrigin: [number, number] = [0.5, 0]

// Helper function to get appropriate handles based on layout direction
const getHandlesForDirection = (direction: 'TB' | 'LR') => {
  if (direction === 'TB') {
    return { source: 'bottom', target: 'top' }
  } else {
    return { source: 'right', target: 'left' }
  }
}

export function NodeEditorCore() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<ReactFlowEdge[]>([])
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

  // Track if we're in an undo/redo operation
  const isUndoRedoRef = useRef(false)
  
  // Track if we're updating from code editor to prevent infinite loops
  const isCodeUpdateRef = useRef(false)

  // Get current selection
  const { selectedNode, selectedEdge } = useSelection(nodes, edges)

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
    
    // Preserve existing node positions when syncing from code editor
    setNodes(currentNodes => {
      const reactFlowNodes = toReactFlowNodes(flowchartNodes).map(newNode => {
        const existingNode = currentNodes.find(n => n.id === newNode.id)
        if (existingNode) {
          // Preserve position and dimensions of existing node
          return {
            ...newNode,
            position: existingNode.position,
            ...(existingNode.width && { width: existingNode.width }),
            ...(existingNode.height && { height: existingNode.height }),
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
  }, [saveToHistory, setFlowchartNodes, setFlowchartEdges])

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
        saveToHistory({ nodes: customNodes, edges: customEdges })
        
        // Also sync to flowchart atoms (prevent code editor loop)
        isCodeUpdateRef.current = true
        setFlowchartNodes(customNodes)
        setFlowchartEdges(customEdges)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [nodes, edges, saveToHistory, setFlowchartNodes, setFlowchartEdges])

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

        const newNode: ReactFlowNode = {
          id: getId(),
          type: selectedNodeType,
          position,
          data: {
            label:
              NODE_TYPE_CONFIG[
                selectedNodeType as keyof typeof NODE_TYPE_CONFIG
              ]?.defaultLabel || selectedNodeType,
          },
        }

        setNodes((nds) => nds.concat(newNode))
        setSelectedNodeType(null) // Clear selection after adding
      }
    },
    [selectedNodeType, screenToFlowPosition, setNodes],
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

  const onSelectionChange = useCallback(
    ({ nodes: _selectedNodes, edges: _selectedEdges }: { nodes: ReactFlowNode[]; edges: ReactFlowEdge[] }) => {
      // React Flow calls this with arrays of selected items
      // Don't reset focus flag here as it interferes with double-click
    },
    [],
  )

  // Handle PropertyPanel updates
  const handleNodeUpdate = useCallback(
    (update: { id: string; data?: { label: string }; type?: string }) => {
      if (update.data) {
        // Update atom
        updateNode({
          id: update.id,
          data: update.data,
        })
        
        // Also update React Flow nodes immediately for label changes
        setNodes((nds) =>
          nds.map((node) =>
            node.id === update.id
              ? { ...node, data: { ...node.data, ...update.data } }
              : node
          )
        )
      }
      if (update.type) {
        // For type changes, we need to update the React Flow nodes directly
        setNodes((nds) =>
          nds.map((node) =>
            node.id === update.id
              ? { ...node, type: update.type }
              : node
          )
        )
      }
    },
    [updateNode, setNodes],
  )

  const handleEdgeUpdate = useCallback(
    (update: { id: string; data?: { label: string }; type?: string }) => {
      // Update edge in atoms
      const edgeUpdate: Parameters<typeof updateEdge>[0] = {
        id: update.id,
        ...(update.data && { data: update.data }),
        ...(update.type && { type: update.type as Edge['type'] }),
      }
      updateEdge(edgeUpdate)
      
      // Update React Flow edges immediately
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === update.id) {
            let updatedEdge = { ...edge }
            
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
    },
    [updateEdge, setEdges],
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
