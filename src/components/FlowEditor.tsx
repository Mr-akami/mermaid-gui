import { useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Connection,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useAtom, useAtomValue } from 'jotai'
import { nodesAtom, edgesAtom } from '@/store/flowStore'
import { diagramTypeAtom } from '@/store/diagramStore'
import CustomNode from './CustomNode'
import DiagramTypeSelector from './DiagramTypeSelector'
import ControlsContainer from './ControlsContainer'
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
      
      setEdges(prevEdges => addEdge(newEdge, prevEdges))
    },
    [setEdges, diagramType],
  )

  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes(prevNodes => {
        // Apply React Flow changes directly to the atom
        return changes.reduce((acc: any, change: any) => {
          if (change.type === 'remove') {
            return acc.filter((node: any) => node.id !== change.id)
          }
          if (change.type === 'position' && change.position) {
            return acc.map((node: any) => 
              node.id === change.id ? { ...node, position: change.position } : node
            )
          }
          if (change.type === 'select') {
            return acc.map((node: any) => 
              node.id === change.id ? { ...node, selected: change.selected } : node
            )
          }
          return acc
        }, prevNodes)
      })
    },
    [setNodes],
  )

  const onEdgesChange = useCallback(
    (changes: any) => {
      setEdges(prevEdges => {
        // Apply React Flow changes directly to the atom
        return changes.reduce((acc: any, change: any) => {
          if (change.type === 'remove') {
            return acc.filter((edge: any) => edge.id !== change.id)
          }
          if (change.type === 'select') {
            return acc.map((edge: any) => 
              edge.id === change.id ? { ...edge, selected: change.selected } : edge
            )
          }
          return acc
        }, prevEdges)
      })
    },
    [setEdges],
  )

  // Custom delete handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter((node) => node.selected)
        const selectedEdges = edges.filter((edge) => edge.selected)
        
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          event.preventDefault()
          setNodes(prevNodes => prevNodes.filter((node) => !node.selected))
          setEdges(prevEdges => prevEdges.filter((edge) => !edge.selected))
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [nodes, edges, setNodes, setEdges])


  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
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
        <ControlsContainer />
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default FlowEditor