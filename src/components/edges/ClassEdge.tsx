import { EdgeProps, getStraightPath, EdgeLabelRenderer, BaseEdge } from 'reactflow'
import { ClassEdge as ClassEdgeType } from '../../types/diagram'

export default function ClassEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<ClassEdgeType['data']>) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  const getMarkerStart = () => {
    switch (data?.relationType) {
      case 'composition':
        return 'url(#diamond-filled)'
      case 'aggregation':
        return 'url(#diamond-empty)'
      default:
        return undefined
    }
  }

  const getMarkerEnd = () => {
    switch (data?.relationType) {
      case 'inheritance':
      case 'realization':
        return 'url(#triangle-empty)'
      case 'association':
        return 'url(#arrow)'
      default:
        return undefined
    }
  }

  const getStrokeStyle = () => {
    switch (data?.relationType) {
      case 'dependency':
      case 'realization':
        return { strokeDasharray: '5,5' }
      default:
        return {}
    }
  }

  return (
    <>
      <defs>
        <marker
          id="diamond-filled"
          viewBox="0 0 10 10"
          refX="0"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill="currentColor" />
        </marker>
        <marker
          id="diamond-empty"
          viewBox="0 0 10 10"
          refX="0"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill="white" stroke="currentColor" strokeWidth="1" />
        </marker>
        <marker
          id="triangle-empty"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="white" stroke="currentColor" strokeWidth="1" />
        </marker>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </marker>
      </defs>
      
      <BaseEdge
        id={id}
        path={edgePath}
        style={getStrokeStyle()}
        markerStart={getMarkerStart()}
        markerEnd={getMarkerEnd()}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: '12px',
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {data?.sourceCardinality && (
            <div
              style={{
                position: 'absolute',
                transform: 'translate(-100%, -20px)',
                background: 'white',
                padding: '2px 4px',
                borderRadius: '2px',
                fontSize: '10px',
              }}
            >
              {data.sourceCardinality}
            </div>
          )}
          
          {data?.label && (
            <div
              style={{
                background: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
              }}
            >
              {data.label}
            </div>
          )}
          
          {data?.targetCardinality && (
            <div
              style={{
                position: 'absolute',
                transform: 'translate(0%, -20px)',
                background: 'white',
                padding: '2px 4px',
                borderRadius: '2px',
                fontSize: '10px',
              }}
            >
              {data.targetCardinality}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}