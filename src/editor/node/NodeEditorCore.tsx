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
  type Node,
  type Edge,
  type Connection,
  FlowchartNode,
  useAtom,
  MarkerType,
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
  FlowchartEdge,
  updateNodeAtom,
  updateEdgeAtom,
} from '../../flowchart'
import { saveToHistoryAtom } from '../../history'
import { toCustomNodes, toReactFlowNodes, toCustomEdges, toReactFlowEdges } from './nodeTypeUtils'
import { focusPropertyPanelAtom } from './atoms'

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
  default: FlowchartEdge,
}

const initialNodes: Node[] = [
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

export function NodeEditorCore() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null)
  const { screenToFlowPosition } = useReactFlow()

  // Connect to flowchart atoms
  const [, setFlowchartNodes] = useAtom(nodesAtom)
  const [, setFlowchartEdges] = useAtom(edgesAtom)
  const [, saveToHistory] = useAtom(saveToHistoryAtom)
  const [, updateNode] = useAtom(updateNodeAtom)
  const [, updateEdge] = useAtom(updateEdgeAtom)
  const [shouldFocusPropertyPanel, setShouldFocusPropertyPanel] = useAtom(focusPropertyPanelAtom)

  // Track if we're in an undo/redo operation
  const isUndoRedoRef = useRef(false)

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

  // Initialize history with initial state
  useEffect(() => {
    const customNodes = toCustomNodes(initialNodes)
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
        
        // Also sync to flowchart atoms
        setFlowchartNodes(customNodes)
        setFlowchartEdges(customEdges)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [nodes, edges, saveToHistory, setFlowchartNodes, setFlowchartEdges])

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'default',
            data: { edgeType: 'normal-arrow' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#333',
            },
          },
          eds,
        ),
      ),
    [setEdges],
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
        setEdges((eds) =>
          eds.concat([
            {
              id,
              source: connectionState.fromNode.id,
              target: id,
              type: 'default',
              data: { edgeType: 'normal-arrow' },
              markerEnd: {
                type: 'arrowclosed',
                width: 20,
                height: 20,
                color: '#333',
              },
            },
          ]),
        )
      }
    },
    [screenToFlowPosition, setNodes, setEdges],
  )

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (selectedNodeType) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        const newNode: Node = {
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
    (_event: React.MouseEvent, node: Node) => {
      setShouldFocusPropertyPanel(true)
    },
    [setShouldFocusPropertyPanel],
  )

  const onEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setShouldFocusPropertyPanel(true)
    },
    [setShouldFocusPropertyPanel],
  )

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[]; edges: Edge[] }) => {
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
      updateEdge(update)
      
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
              updatedEdge.data = { 
                ...updatedEdge.data, 
                edgeType: update.type 
              }
              // Update markerEnd based on whether the type has an arrow
              updatedEdge.markerEnd = update.type.includes('arrow')
                ? {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: '#333',
                  }
                : undefined
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
          const rfNodes = toReactFlowNodes(state.nodes)
          const rfEdges = toReactFlowEdges(state.edges)
          setNodes(rfNodes)
          setEdges(rfEdges)
        }}
        onRedo={(state) => {
          isUndoRedoRef.current = true
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
