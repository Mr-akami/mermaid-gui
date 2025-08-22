import { memo, useState, useCallback, useRef } from 'react'
import React from 'react'
import { Handle, Position, type NodeProps, useEdges, useReactFlow } from '@xyflow/react'
import { useAtom } from 'jotai'
import { edgeCreationAtom } from '../atoms'

interface ParticipantLifelineData {
  type: 'participant' | 'actor'
  label: string
  alias?: string
  onHandleClick?: (nodeId: string, handleId: string) => void
}

export const ParticipantLifeline = memo((props: NodeProps) => {
  const { data, selected, id, positionAbsolute } = props
  const participantData = ((data as unknown) || { type: 'participant', label: 'Participant' }) as ParticipantLifelineData
  const isActor = participantData.type === 'actor'
  
  const [hoveredY, setHoveredY] = useState<number | null>(null)
  const [handles, setHandles] = useState<Array<{ id: string; y: number }>>([])
  const [draggedHandle, setDraggedHandle] = useState<{ id: string; startY: number; currentY: number } | null>(null)
  const lifelineRef = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()
  
  // Get edges from React Flow to track connections
  const edges = useEdges()
  
  // Edge creation state
  const [edgeCreation] = useAtom(edgeCreationAtom)
  
  // Check if a handle is connected (check both source and target variants)
  const isHandleConnected = useCallback((handleId: string) => {
    return edges.some(edge => 
      edge.sourceHandle === `${handleId}-source` || 
      edge.targetHandle === `${handleId}-target` ||
      edge.sourceHandle === `${handleId}-target` || 
      edge.targetHandle === `${handleId}-source`
    )
  }, [edges])

  const handleLifelineMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!lifelineRef.current) return
    
    // Don't show + if target is not the lifeline itself (e.g., it's a Handle)
    if (e.target !== e.currentTarget) {
      setHoveredY(null)
      return
    }
    
    // Use offsetY which is already relative to the lifeline element
    const y = e.nativeEvent.offsetY
    
    // Check if mouse is over an existing handler
    const isOverHandler = handles.some(handle => 
      Math.abs(handle.y - y) < 15 // Within 15px of a handler
    )
    
    // Only show + indicator if not over a handler
    if (!isOverHandler) {
      setHoveredY(y)
    } else {
      setHoveredY(null)
    }
  }, [handles])

  const handleLifelineMouseLeave = useCallback(() => {
    setHoveredY(null)
  }, [])

  const handleAddHandle = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (hoveredY === null) return
    
    // Don't add if clicking near an existing handler
    const isNearHandler = handles.some(handle => 
      Math.abs(handle.y - hoveredY) < 15
    )
    
    if (!isNearHandler) {
      const newHandleId = `handle-${Date.now()}`
      setHandles(prev => [...prev, { id: newHandleId, y: hoveredY }])
      setHoveredY(null)
    }
  }, [hoveredY, handles])

  const handleHandleClick = useCallback((handleId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Check if this handle is already connected
    if (isHandleConnected(handleId)) return
    
    // Call the parent's handler if provided
    if (participantData.onHandleClick) {
      participantData.onHandleClick(id, handleId)
    }
  }, [id, participantData, isHandleConnected])

  const handleMouseDown = useCallback((handleId: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Don't allow dragging connected handles
    if (isHandleConnected(handleId)) return
    
    const handle = handles.find(h => h.id === handleId)
    if (!handle) return
    
    setDraggedHandle({
      id: handleId,
      startY: 0,
      currentY: handle.y
    })
  }, [handles, isHandleConnected])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedHandle || !lifelineRef.current) return
    
    // Get the lifeline element's bounding rect
    const lifelineRect = lifelineRef.current.getBoundingClientRect()
    
    // Convert screen coordinates to flow coordinates
    const flowPosition = screenToFlowPosition({
      x: e.clientX,
      y: e.clientY
    })
    
    // Also convert the lifeline's top position to flow coordinates
    const lifelineTopFlow = screenToFlowPosition({
      x: lifelineRect.left,
      y: lifelineRect.top
    })
    
    // Calculate position relative to lifeline
    const mouseY = flowPosition.y - lifelineTopFlow.y
    
    // Constrain to lifeline bounds
    const minY = 10
    const maxY = 390 // lifeline height (400px) - 10px margin
    const constrainedY = Math.max(minY, Math.min(maxY, mouseY))
    
    setHandles(prev => prev.map(h => 
      h.id === draggedHandle.id 
        ? { ...h, y: constrainedY }
        : h
    ))
  }, [draggedHandle, handles, screenToFlowPosition])

  const handleMouseUp = useCallback(() => {
    setDraggedHandle(null)
  }, [])

  // Add global mouse event listeners for dragging
  React.useEffect(() => {
    if (draggedHandle) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedHandle, handleMouseMove, handleMouseUp])

  return (
    <div
      className="participant-lifeline nodrag"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '120px',
        position: 'relative'
      }}
    >
      {/* Header box - only this part is draggable */}
      <div
        className={`participant-header ${selected ? 'selected' : ''}`}
        style={{
          padding: '10px 20px',
          border: isActor ? '2px dashed #666' : '2px solid #333',
          borderRadius: isActor ? '50%' : '4px',
          background: selected ? '#e6f3ff' : '#fff',
          minWidth: '100px',
          textAlign: 'center',
          cursor: 'move',
          zIndex: 2
        }}
      >
        <div style={{ fontWeight: 'bold' }}>{participantData.label}</div>
      </div>
      
      {/* Lifeline - not draggable */}
      <div
        ref={lifelineRef}
        className="lifeline nodrag"
        style={{
          width: '2px',
          height: '400px',
          background: '#333',
          borderStyle: 'dashed',
          marginTop: '0',
          position: 'relative',
          cursor: 'pointer'
        }}
        onMouseMove={handleLifelineMouseMove}
        onMouseLeave={handleLifelineMouseLeave}
        onClick={handleAddHandle}
      >
        {/* Show + indicator on hover */}
        {hoveredY !== null && (
          <div
            style={{
              position: 'absolute',
              top: `${hoveredY - 10}px`,
              left: '-9px',
              width: '20px',
              height: '20px',
              background: '#4CAF50',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            +
          </div>
        )}
        
        {/* Dynamic handles - single handle that can be both source and target */}
        {handles.map((handle) => {
          const isConnected = isHandleConnected(handle.id)
          const isSelected = edgeCreation?.sourceNode === id && 
                            edgeCreation?.sourceHandle === `${handle.id}-source`
          
          return (
            <React.Fragment key={handle.id}>
              {/* Clickable and draggable wrapper for handle */}
              <div
                onClick={(e) => handleHandleClick(handle.id, e)}
                onMouseDown={(e) => handleMouseDown(handle.id, e)}
                style={{
                  position: 'absolute',
                  top: `${handle.y - 10}px`, // Center the 20px height div on handle.y
                  left: '-9px', // Center the 20px width div on lifeline (2px width)
                  width: '20px',
                  height: '20px',
                  cursor: isConnected ? 'not-allowed' : (draggedHandle?.id === handle.id ? 'grabbing' : 'grab'),
                  zIndex: 10
                }}
              >
                {/* Visual handle */}
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: isSelected ? '#4CAF50' : (isConnected ? '#999' : '#555'),
                    border: isSelected ? '2px solid #2E7D32' : '2px solid #333',
                    opacity: isConnected ? 0.5 : 1,
                    pointerEvents: 'none'
                  }}
                />
              </div>
              
              {/* Hidden React Flow handles for edge connection */}
              <Handle
                type="source"
                position={Position.Left}
                id={`${handle.id}-source`}
                style={{ 
                  visibility: 'hidden',
                  top: `${handle.y}px`,
                  left: '1px'
                }}
                isConnectable={false}
              />
              <Handle
                type="target"
                position={Position.Left}
                id={`${handle.id}-target`}
                style={{ 
                  visibility: 'hidden',
                  top: `${handle.y}px`,
                  left: '1px'
                }}
                isConnectable={false}
              />
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
})

ParticipantLifeline.displayName = 'ParticipantLifeline'