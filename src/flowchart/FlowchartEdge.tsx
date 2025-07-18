import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow'
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
          return { ...baseStyle, strokeWidth: 2, markerEnd: 'url(#arrowhead)' }
        case 'thick':
          return { ...baseStyle, strokeWidth: 4 }
        case 'thick-arrow':
          return { ...baseStyle, strokeWidth: 4, markerEnd: 'url(#arrowhead)' }
        case 'dotted':
          return { ...baseStyle, strokeWidth: 2, strokeDasharray: '5,5' }
        case 'dotted-arrow':
          return {
            ...baseStyle,
            strokeWidth: 2,
            strokeDasharray: '5,5',
            markerEnd: 'url(#arrowhead)',
          }
        default:
          return baseStyle
      }
    }

    return (
      <>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#b1b1b7" />
          </marker>
        </defs>
        <BaseEdge path={edgePath} style={getEdgeStyle()} />
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
