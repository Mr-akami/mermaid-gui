import { EdgeProps, getStraightPath, EdgeLabelRenderer, BaseEdge } from 'reactflow'
import { SequenceEdge as SequenceEdgeType } from '../../types/diagram'
import { useState, useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { edgesAtom } from '@/store/flowStore'

export default function SequenceEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
}: EdgeProps<SequenceEdgeType['data']>) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data?.label || '')
  const setEdges = useSetAtom(edgesAtom)

  // Use straight path for sequence diagrams
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  const updateEdge = useCallback(() => {
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id
          ? { ...edge, data: { ...edge.data, label: label || undefined } }
          : edge
      )
    )
  }, [id, label, setEdges])

  const handleLabelDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }, [])

  const handleLabelBlur = useCallback(() => {
    setIsEditing(false)
    updateEdge()
  }, [updateEdge])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleLabelBlur()
      }
    },
    [handleLabelBlur]
  )

  const getStrokeStyle = () => {
    const baseStyle = {
      stroke: '#374151',
      strokeWidth: 2,
    }

    switch (data?.messageType) {
      case 'dotted':
      case 'dottedArrow':
        return { ...baseStyle, strokeDasharray: '5,5' }
      case 'bidirectional':
        return { ...baseStyle, strokeWidth: 3 }
      default:
        return baseStyle
    }
  }

  const getMarkerEnd = () => {
    switch (data?.messageType) {
      case 'solidArrow':
      case 'dottedArrow':
        return markerEnd
      case 'cross':
        return 'url(#cross-marker)'
      case 'async':
        return 'url(#async-marker)'
      case 'bidirectional':
        return 'url(#bidirectional-marker)'
      default:
        return undefined
    }
  }

  const getMarkerStart = () => {
    switch (data?.messageType) {
      case 'bidirectional':
        return 'url(#bidirectional-start-marker)'
      default:
        return undefined
    }
  }

  return (
    <>
      <defs>
        <marker
          id="cross-marker"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 2 2 L 8 8 M 2 8 L 8 2" stroke="currentColor" strokeWidth="1.5" />
        </marker>
        <marker
          id="async-marker"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 0 5 L 10 5" stroke="currentColor" strokeWidth="2" />
          <path d="M 5 0 L 10 5 L 5 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </marker>
        <marker
          id="bidirectional-marker"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </marker>
        <marker
          id="bidirectional-start-marker"
          viewBox="0 0 10 10"
          refX="1"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 10 0 L 0 5 L 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </marker>
      </defs>
      
      <BaseEdge
        id={id}
        path={edgePath}
        style={getStrokeStyle()}
        markerEnd={getMarkerEnd()}
        markerStart={getMarkerStart()}
      />
      
      {/* Sequence number */}
      {data?.sequence && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + 20}px,${sourceY + 10}px)`,
              background: '#3b82f6',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 'bold',
              zIndex: 10,
            }}
            className="nodrag nopan"
          >
            {data.sequence}
          </div>
        </EdgeLabelRenderer>
      )}
      
      {/* Message label */}
      {(data?.label || isEditing) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 10}px)`,
              background: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              maxWidth: '200px',
            }}
            className="nodrag nopan"
            onDoubleClick={handleLabelDoubleClick}
          >
            {isEditing ? (
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="border-none outline-none bg-transparent w-full text-center"
                placeholder="Message text"
              />
            ) : (
              data?.label || 'Double-click to edit'
            )}
          </div>
        </EdgeLabelRenderer>
      )}
      
      {/* Activation indicators */}
      {data?.activate && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetX + 10}px,${targetY}px)`,
              background: '#fbbf24',
              width: '4px',
              height: '20px',
              borderRadius: '2px',
            }}
            className="nodrag nopan"
            title="Activation"
          />
        </EdgeLabelRenderer>
      )}
    </>
  )
}