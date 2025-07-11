import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow'
import { FlowchartEdge as FlowchartEdgeType } from '../../types/diagram'
import { useState } from 'react'

export default function FlowchartEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<FlowchartEdgeType['data']>) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data?.label || '')

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const getEdgeStyle = () => {
    const baseStyle: React.CSSProperties = {
      stroke: '#374151',
      strokeWidth: 2,
    }

    switch (data?.style) {
      case 'dotted':
        return { ...baseStyle, strokeDasharray: '5,5' }
      case 'thick':
        return { ...baseStyle, strokeWidth: 4 }
      default:
        return baseStyle
    }
  }

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleLabelBlur = () => {
    setIsEditing(false)
    // Here you would update the edge label in the parent component
    // For now, we'll just close the editor
  }

  const hasArrow = data?.hasArrow !== false

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={getEdgeStyle()}
        markerEnd={hasArrow ? markerEnd : undefined}
      />
      
      {(data?.label || isEditing) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
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
                autoFocus
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100px',
                }}
              />
            ) : (
              data?.label || 'Double-click to edit'
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}