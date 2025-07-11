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
import { useAtom } from 'jotai'
import { nodesAtom, edgesAtom } from '@/store/flowStore'
import Toolbar from './Toolbar'
import CustomNode from './CustomNode'
import DiagramTypeSelector from './DiagramTypeSelector'
import UndoRedoButtons from './UndoRedoButtons'
import { useHistory } from '@/hooks/useHistory'

const FlowCanvas = () => {
  const [nodes, setNodes] = useAtom(nodesAtom)
  const [edges, setEdges] = useAtom(edgesAtom)
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
  }), [])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, localEdges)
      setLocalEdges(newEdges)
      setEdges(newEdges)
    },
    [localEdges, setLocalEdges, setEdges],
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

  return (
    <ReactFlow
      nodes={localNodes}
      edges={localEdges}
      onNodesChange={onNodesChangeHandler}
      onEdgesChange={onEdgesChangeHandler}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
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
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default FlowEditor