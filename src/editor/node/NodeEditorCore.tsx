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
  type Connection,
  FlowchartNode,
  useAtom,
} from './deps'
import { NodeToolbar } from './NodeToolbar'
import { UndoRedoButtons } from './UndoRedoButtons'
import { MERMAID_NODE_TYPES, NODE_TYPE_CONFIG, nodesAtom, edgesAtom } from '../../flowchart'
import { saveToHistoryAtom } from '../../history'

// Create nodeTypes object dynamically from MERMAID_NODE_TYPES
const nodeTypes = MERMAID_NODE_TYPES.reduce((acc, type) => {
  acc[type] = FlowchartNode
  return acc
}, {} as Record<string, typeof FlowchartNode>)

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
  const [flowchartNodes, setFlowchartNodes] = useAtom(nodesAtom)
  const [flowchartEdges, setFlowchartEdges] = useAtom(edgesAtom)
  const [, saveToHistory] = useAtom(saveToHistoryAtom)
  
  // Track if we're in an undo/redo operation
  const isUndoRedoRef = useRef(false)
  
  // Initialize history with initial state
  useEffect(() => {
    setFlowchartNodes(initialNodes)
    setFlowchartEdges([])
    saveToHistory({ nodes: initialNodes, edges: [] })
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
        saveToHistory({ nodes, edges })
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [nodes, edges, saveToHistory])
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
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
          eds.concat([{ id, source: connectionState.fromNode.id, target: id }]),
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
          data: { label: NODE_TYPE_CONFIG[selectedNodeType as keyof typeof NODE_TYPE_CONFIG]?.defaultLabel || selectedNodeType },
        }
        
        setNodes((nds) => nds.concat(newNode))
        setSelectedNodeType(null) // Clear selection after adding
      }
    },
    [selectedNodeType, screenToFlowPosition, setNodes],
  )

  return (
    <div className="wrapper" ref={reactFlowWrapper} style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      cursor: selectedNodeType ? 'crosshair' : 'default'
    }}>
      <UndoRedoButtons 
        onUndo={(state) => {
          isUndoRedoRef.current = true
          setNodes(state.nodes)
          setEdges(state.edges)
        }}
        onRedo={(state) => {
          isUndoRedoRef.current = true
          setNodes(state.nodes)
          setEdges(state.edges)
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
      >
        <Background />
      </ReactFlow>
    </div>
  )
}