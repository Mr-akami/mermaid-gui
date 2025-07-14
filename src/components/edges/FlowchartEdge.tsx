import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, useNodes } from 'reactflow'
import { FlowchartEdge as FlowchartEdgeType } from '../../types/diagram'
import { useState, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { drawingModeAtom } from '../../store/drawingStore'
import { getEdgeAnchors } from '../../utils/edgeUtils'

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
  source,
  target,
}: EdgeProps<FlowchartEdgeType['data']>) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data?.label || '')
  const drawingMode = useAtomValue(drawingModeAtom)
  const nodes = useNodes()

  // Calculate custom anchor points if in draw-line mode
  const [actualSourceX, actualSourceY, actualTargetX, actualTargetY] = useMemo(() => {
    if (drawingMode === 'draw-line' && source && target) {
      const sourceNode = nodes.find(n => n.id === source)
      const targetNode = nodes.find(n => n.id === target)
      
      if (sourceNode && targetNode) {
        const anchors = getEdgeAnchors(sourceNode, targetNode)
        return [anchors.source.x, anchors.source.y, anchors.target.x, anchors.target.y]
      }
    }
    return [sourceX, sourceY, targetX, targetY]
  }, [drawingMode, source, target, nodes, sourceX, sourceY, targetX, targetY])

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: actualSourceX,
    sourceY: actualSourceY,
    sourcePosition,
    targetX: actualTargetX,
    targetY: actualTargetY,
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