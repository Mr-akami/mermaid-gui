import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow'
import { SequenceEdge as SequenceEdgeType } from '../../types/diagram'

export default function SequenceEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<SequenceEdgeType['data']>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const getStrokeStyle = () => {
    switch (data?.messageType) {
      case 'dotted':
      case 'dottedArrow':
        return { strokeDasharray: '5,5' }
      default:
        return {}
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
      </defs>
      
      <BaseEdge
        id={id}
        path={edgePath}
        style={getStrokeStyle()}
        markerEnd={getMarkerEnd()}
      />
      
      {data?.label && (
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
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}