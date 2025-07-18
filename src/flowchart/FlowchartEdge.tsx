import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from '@xyflow/react'
import { memo } from 'react'

interface FlowchartEdgeData {
  edgeType:
    | 'normal'
    | 'normal-arrow'
    | 'thick'
    | 'thick-arrow'
    | 'dotted'
    | 'dotted-arrow'
  label?: string
}

export const FlowchartEdge = memo(
  ({
    id: _id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    markerEnd: _markerEnd,
  }: EdgeProps<FlowchartEdgeData>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
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

    const hasArrow = edgeType.includes('arrow')
    const edgeStyle = getEdgeStyle()

    return (
      <>
        <BaseEdge
          path={edgePath}
          style={edgeStyle}
          markerEnd={hasArrow ? 'url(#react-flow__arrowclosed)' : undefined}
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
              {data.label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    )
  },
)

FlowchartEdge.displayName = 'FlowchartEdge'
