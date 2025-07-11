import { useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useAtom, useAtomValue } from 'jotai'
import { nodesAtom, edgesAtom } from '@/store/flowStore'
import { diagramTypeAtom } from '@/store/diagramStore'
import Toolbar from './Toolbar'
import CustomNode from './CustomNode'
import DiagramTypeSelector from './DiagramTypeSelector'
import UndoRedoButtons from './UndoRedoButtons'
import EdgeStyleSelector from './EdgeStyleSelector'
import FlowchartDirectionSelector from './FlowchartDirectionSelector'
import { useHistory } from '@/hooks/useHistory'

// Import custom nodes
import SequenceNode from './nodes/SequenceNode'
import ClassNode from './nodes/ClassNode'
import StateNode from './nodes/StateNode'
import ERNode from './nodes/ERNode'

// Import custom edges
import FlowchartEdge from './edges/FlowchartEdge'
import SequenceEdge from './edges/SequenceEdge'
import ClassEdge from './edges/ClassEdge'
import EREdge from './edges/EREdge'

const FlowCanvas = () => {
  const [nodes, setNodes] = useAtom(nodesAtom)
  const [edges, setEdges] = useAtom(edgesAtom)
  const diagramType = useAtomValue(diagramTypeAtom)
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes)
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges)

  // Sync nodes from atom to local state
  useEffect(() => {
    setLocalNodes(nodes)
  }, [nodes, setLocalNodes])

  // Sync edges from atom to local state
  useEffect(() => {
    setLocalEdges(edges)
  }, [edges, setLocalEdges])

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
    flowchart: CustomNode, // Reuse CustomNode for flowchart
    sequence: SequenceNode,
    class: ClassNode,
    state: StateNode,
    er: ERNode,
  }), [])

  const edgeTypes = useMemo(() => ({
    flowchart: FlowchartEdge,
    sequence: SequenceEdge,
    class: ClassEdge,
    er: EREdge,
    // Default edge type will be used for state
  }), [])

  const onConnect = useCallback(
    (params: Connection) => {
      // Add custom edge type based on diagram type
      const edgeType = ['flowchart', 'sequence', 'class', 'er'].includes(diagramType) ? diagramType : undefined
      const edgeData = diagramType === 'flowchart' ? { style: 'solid', hasArrow: true } :
                      diagramType === 'sequence' ? { messageType: 'solid' } : 
                      diagramType === 'class' ? { relationType: 'association' } :
                      diagramType === 'er' ? { 
                        relationshipType: 'identifying', 
                        sourceCardinality: '1..1',
                        targetCardinality: '1..1'
                      } : undefined

      const newEdge = {
        ...params,
        type: edgeType,
        data: edgeData,
      }
      
      const newEdges = addEdge(newEdge, localEdges)
      setLocalEdges(newEdges)
      setEdges(newEdges)
    },
    [localEdges, setLocalEdges, setEdges, diagramType],
  )

  const onNodesChangeHandler = useCallback(
    (changes: any) => {
      onNodesChange(changes)
      setNodes(localNodes)
    },
    [localNodes, onNodesChange, setNodes],
  )

  const onEdgesChangeHandler = useCallback(
    (changes: any) => {
      onEdgesChange(changes)
      setEdges(localEdges)
    },
    [localEdges, onEdgesChange, setEdges],
  )

  // Custom delete handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = localNodes.filter((node) => node.selected)
        const selectedEdges = localEdges.filter((edge) => edge.selected)
        
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          event.preventDefault()
          const newNodes = localNodes.filter((node) => !node.selected)
          const newEdges = localEdges.filter((edge) => !edge.selected)
          setNodes(newNodes)
          setEdges(newEdges)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [localNodes, localEdges, setNodes, setEdges])

  // Clear canvas when diagram type changes
  useEffect(() => {
    setNodes([])
    setEdges([])
  }, [diagramType, setNodes, setEdges])

  return (
    <ReactFlow
      nodes={localNodes}
      edges={localEdges}
      onNodesChange={onNodesChangeHandler}
      onEdgesChange={onEdgesChangeHandler}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      multiSelectionKeyCode="Shift"
      deleteKeyCode={null} // Disable default delete handling
      fitView
    >
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      <Controls />
      <MiniMap />
    </ReactFlow>
  )
}

const FlowEditor = () => {
  useHistory() // Initialize history tracking
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 bg-white px-4 py-2">
        <h2 className="text-lg font-semibold text-gray-800">Flow Editor</h2>
      </div>
      <DiagramTypeSelector />
      <div className="flex-1 relative">
        <Toolbar />
        <UndoRedoButtons />
        <EdgeStyleSelector />
        <FlowchartDirectionSelector />
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default FlowEditor