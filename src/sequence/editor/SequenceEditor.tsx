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
  ReactFlowProvider,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAtom, useSetAtom } from 'jotai'
import { participantsAtom, placementModeAtom, addParticipantAtom, edgeCreationAtom, syncSequenceToRawCodeAtom, messagesAtom, addMessageAtom } from '../atoms'
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
  const [messages] = useAtom(messagesAtom)
  const [placementMode, setPlacementMode] = useAtom(placementModeAtom)
  const addParticipant = useSetAtom(addParticipantAtom)
  const addMessage = useSetAtom(addMessageAtom)
  const [edgeCreation, setEdgeCreation] = useAtom(edgeCreationAtom)
  const { screenToFlowPosition } = useReactFlow()
  
  // Initialize nodes state directly without useMemo to allow position updates
  const initialNodes: Node[] = []
  const [nodesState, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edgesState, setEdges, onEdgesChange] = useEdgesState([] as Edge[])
  
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

  // Check if a handle is already connected
  const isHandleConnected = useCallback((nodeId: string, handleId: string) => {
    return (edgesState as Edge[]).some(edge => 
      (edge.source === nodeId && edge.sourceHandle === `${handleId}-source`) ||
      (edge.target === nodeId && edge.targetHandle === `${handleId}-target`) ||
      (edge.source === nodeId && edge.sourceHandle === `${handleId}-target`) ||
      (edge.target === nodeId && edge.targetHandle === `${handleId}-source`)
    )
  }, [edgesState])

  // Handle edge creation from handle clicks
  const handleEdgeCreation = useCallback((nodeId: string, handleId: string) => {
    // Check if this handle is already connected
    const handleConnected = isHandleConnected(nodeId, handleId)
    
    if (!edgeCreation) {
      // First click - only allow if not connected
      if (!handleConnected) {
        setEdgeCreation({
          sourceNode: nodeId,
          sourceHandle: `${handleId}-source`
        })
      }
    } else {
      // Check if clicking on a different handle
      if (edgeCreation.sourceNode !== nodeId || !edgeCreation.sourceHandle?.includes(handleId)) {
        // Second click on different handle - only create edge if target not connected
        if (!handleConnected) {
          const newEdge: Edge = {
            id: nanoid(),
            source: edgeCreation.sourceNode!,
            target: nodeId,
            sourceHandle: edgeCreation.sourceHandle!,
            targetHandle: `${handleId}-target`,
            type: 'sequenceMessage',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#333'
            },
            data: {
              label: 'Message',
              arrowType: '->>'
            }
          }
          
          // Immediately add the edge
          setEdges((prev) => [...(prev as Edge[]), newEdge])
          
          // Add to messages atom for Mermaid code generation
          addMessage({
            id: newEdge.id,
            from: edgeCreation.sourceNode!,
            to: nodeId,
            type: '->' as any, // Will be properly typed as ArrowType.SOLID
            label: 'Message',
            sequenceNumber: messages.length
          })
        }
      }
      // Clear edge creation state whether edge was created or not
      setEdgeCreation(null)
    }
  }, [edgeCreation, setEdgeCreation, setEdges, isHandleConnected, addMessage, messages.length])

  // Initialize and update nodes when participants change
  useEffect(() => {
    setNodes(currentNodes => {
      // Create a map of existing node positions
      const existingPositions = new Map<string, number>()
      currentNodes.forEach(node => {
        existingPositions.set(node.id, node.position.x)
      })
      
      // Update nodes preserving existing X positions
      return participants.map((p, index) => ({
        id: p.id,
        type: 'participantLifeline',
        // Use existing X position if available, otherwise calculate default
        position: { 
          x: existingPositions.get(p.id) ?? (index * 200 + 100), 
          y: 50 
        },
        data: {
          type: p.type,
          label: p.label || p.alias || p.id,
          alias: p.alias,
          onHandleClick: handleEdgeCreation
        },
        // Explicitly set draggable
        draggable: true
      }))
    })
  }, [participants, handleEdgeCreation, setNodes])

  // Add sync effects for GUI -> Code
  const syncSequenceToRawCode = useSetAtom(syncSequenceToRawCodeAtom)
  
  useEffect(() => {
    syncSequenceToRawCode()
  }, [participants, messages, syncSequenceToRawCode])

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
        position: { x: position.x, y: 50 },  // Force Y to 50
        data: {
          type: newParticipant.type,
          label: newParticipant.label,
          onHandleClick: handleEdgeCreation
        },
        draggable: true
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
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#333'
      },
      data: {
        label: 'Message',
        arrowType: '->>'
      }
    }
    
    setEdges((edges) => [...(edges as Edge[]), newEdge])
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