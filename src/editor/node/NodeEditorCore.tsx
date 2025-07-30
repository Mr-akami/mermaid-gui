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
import {
  MERMAID_NODE_TYPES,
  NODE_TYPE_CONFIG,
  nodesAtom,
  edgesAtom,
  FlowchartEdge,
} from '../../flowchart'
import { saveToHistoryAtom } from '../../history'
import { toCustomNodes, toReactFlowNodes, toCustomEdges, toReactFlowEdges } from './nodeTypeUtils'

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

  // Track if we're in an undo/redo operation
  const isUndoRedoRef = useRef(false)

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
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [nodes, edges, saveToHistory])

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
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={nodeOrigin}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <Background />
      </ReactFlow>
    </div>
  )
}
