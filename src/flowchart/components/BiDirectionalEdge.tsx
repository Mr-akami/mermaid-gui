import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  useStore,
  ReactFlowState,
} from '@xyflow/react'
import { memo } from 'react'

const getEdges = (state: ReactFlowState) => state.edges

export const BiDirectionalEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    markerEnd,
    source,
    target,
  }: EdgeProps) => {
    const edges = useStore(getEdges)
    
    // Check if there's a reverse edge
    const reverseEdge = edges.find(
      (e) => (e.source === target && e.target === source) && e.id !== id
    )
    
    // Offset the path if bidirectional
    const offset = reverseEdge ? 20 : 0
    
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: offset ? 0.5 : undefined,
    })

    const edgeType = data?.edgeType || 'normal-arrow'

    // Determine edge styling based on type
    const getEdgeStyle = () => {
      const baseStyle = { ...style }

      switch (edgeType) {
        case 'normal':
          return { ...baseStyle, strokeWidth: 2 }
        case 'normal-arrow':
          return { ...baseStyle, strokeWidth: 2 }
        case 'thick':
          return { ...baseStyle, strokeWidth: 4 }
        case 'thick-arrow':
          return { ...baseStyle, strokeWidth: 4 }
        case 'dotted':
          return { ...baseStyle, strokeWidth: 2, strokeDasharray: '5,5' }
        case 'dotted-arrow':
          return {
            ...baseStyle,
            strokeWidth: 2,
            strokeDasharray: '5,5',
          }
        default:
          return baseStyle
      }
    }

    const hasArrow = typeof edgeType === 'string' && edgeType.includes('arrow')
    const edgeStyle = getEdgeStyle()

    // Use provided markerEnd or create proper marker based on edge type
    const finalMarkerEnd = hasArrow ? (markerEnd || `url(#arrow-${id})`) : undefined

    return (
      <>
        <BaseEdge
          path={edgePath}
          style={edgeStyle}
          markerEnd={finalMarkerEnd}
        />
        {data?.label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                fontSize: 12,
                pointerEvents: 'all',
              }}
              className="px-2 py-1 bg-white border border-gray-300 rounded"
            >
              {String(data.label)}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    )
  },
)

BiDirectionalEdge.displayName = 'BiDirectionalEdge'