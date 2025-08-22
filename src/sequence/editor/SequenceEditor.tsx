import { memo, useCallback, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  ReactFlowProvider
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAtom, useSetAtom } from 'jotai'
import { participantsAtom, placementModeAtom, addParticipantAtom, edgeCreationAtom } from '../atoms'
import { ParticipantLifeline } from '../components/ParticipantLifeline'
import { SequenceMessage } from '../components/SequenceMessage'
import { SequenceToolbar } from './SequenceToolbar'
import { nanoid } from 'nanoid'

const nodeTypes = {
  participantLifeline: ParticipantLifeline as any,
}

const edgeTypes = {
  sequenceMessage: SequenceMessage as any
}

function SequenceEditorContent() {
  const [participants] = useAtom(participantsAtom)
  const [placementMode, setPlacementMode] = useAtom(placementModeAtom)
  const addParticipant = useSetAtom(addParticipantAtom)
  const [edgeCreation, setEdgeCreation] = useAtom(edgeCreationAtom)
  const { screenToFlowPosition } = useReactFlow()
  
  // Convert participants to nodes with lifelines
  const nodes: Node[] = useMemo(() => {
    return participants.map((p, index) => ({
      id: p.id,
      type: 'participantLifeline',
      position: { x: index * 200 + 100, y: 50 },
      data: {
        type: p.type,
        label: p.label || p.alias || p.id,
        alias: p.alias,
        // Pass edge creation handler to each node
        onHandleClick: (nodeId: string, handleId: string) => {
          handleEdgeCreation(nodeId, handleId)
        }
      }
    }))
  }, [participants])

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes)
  const [edgesState, setEdges, onEdgesChange] = useEdgesState([])
  
  // Custom node change handler to restrict Y movement
  const handleNodesChange = useCallback((changes: any[]) => {
    // Filter out Y position changes
    const filteredChanges = changes.map(change => {
      if (change.type === 'position' && change.position) {
        // Keep the Y position fixed at 50
        return {
          ...change,
          position: {
            ...change.position,
            y: 50
          }
        }
      }
      return change
    })
    onNodesChange(filteredChanges)
  }, [onNodesChange])

  // Handle edge creation from handle clicks
  const handleEdgeCreation = useCallback((nodeId: string, handleId: string) => {
    if (!edgeCreation) {
      // First click - set as source
      setEdgeCreation({
        sourceNode: nodeId,
        sourceHandle: `${handleId}-source`
      })
    } else if (edgeCreation.sourceNode !== nodeId || !edgeCreation.sourceHandle?.includes(handleId)) {
      // Second click on different handle - create edge
      const newEdge: Edge = {
        id: nanoid(),
        source: edgeCreation.sourceNode!,
        target: nodeId,
        sourceHandle: edgeCreation.sourceHandle!,
        targetHandle: `${handleId}-target`,
        type: 'sequenceMessage',
        data: {
          label: 'Message',
          arrowType: '->>'
        }
      }
      
      // Immediately add the edge
      setEdges((prev: Edge[]) => [...prev, newEdge])
      setEdgeCreation(null)
    } else {
      // Clicked same handle - cancel
      setEdgeCreation(null)
    }
  }, [edgeCreation, setEdgeCreation, setEdges])

  // Update nodes when participants change
  useEffect(() => {
    // Pass the handler to nodes
    const updatedNodes = participants.map((p, index) => ({
      id: p.id,
      type: 'participantLifeline',
      position: { x: index * 200 + 100, y: 50 },
      data: {
        type: p.type,
        label: p.label || p.alias || p.id,
        alias: p.alias,
        onHandleClick: handleEdgeCreation
      }
    }))
    setNodes(updatedNodes)
  }, [participants, handleEdgeCreation, setNodes])

  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    if (!placementMode) return

    // Get the position where the user clicked
    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const position = screenToFlowPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    })

    if (placementMode === 'participant' || placementMode === 'actor') {
      const newParticipant = {
        id: nanoid(),
        type: placementMode as 'participant' | 'actor',
        label: placementMode === 'participant' ? 'Participant' : 'Actor',
        order: participants.length,
        x: position.x
      }
      
      addParticipant(newParticipant)
      
      // Add the node immediately to the flow
      const newNode: Node = {
        id: newParticipant.id,
        type: 'participantLifeline',
        position: position,
        data: {
          type: newParticipant.type,
          label: newParticipant.label,
        }
      }
      
      setNodes((nodes) => [...nodes, newNode])
      setPlacementMode(null)
    }
  }, [placementMode, participants.length, addParticipant, screenToFlowPosition, setNodes, setPlacementMode])

  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return
    
    const newEdge: Edge = {
      id: nanoid(),
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle || undefined,
      targetHandle: params.targetHandle || undefined,
      type: 'sequenceMessage',
      data: {
        label: 'Message',
        arrowType: '->>'
      }
    }
    
    setEdges((edges: Edge[]) => [...edges, newEdge])
  }, [setEdges])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SequenceToolbar />
      <div style={{ flex: 1, cursor: placementMode ? 'crosshair' : 'default' }}>
        <ReactFlow
          nodes={nodesState}
          edges={edgesState}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          deleteKeyCode={['Delete', 'Backspace']}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}

export const SequenceEditor = memo(() => {
  return (
    <ReactFlowProvider>
      <SequenceEditorContent />
    </ReactFlowProvider>
  )
})

SequenceEditor.displayName = 'SequenceEditor'