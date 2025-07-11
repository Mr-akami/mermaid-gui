import { EdgeProps, getStraightPath, EdgeLabelRenderer, BaseEdge } from 'reactflow'
import { EREdge as EREdgeType } from '../../types/diagram'

export default function EREdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<EREdgeType['data']>) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  const getStrokeStyle = () => {
    return data?.relationshipType === 'non-identifying'
      ? { strokeDasharray: '5,5' }
      : {}
  }


  return (
    <>
      <defs>
        <marker
          id="crow-zero-one"
          viewBox="0 0 20 20"
          refX="19"
          refY="10"
          markerWidth="20"
          markerHeight="20"
          orient="auto"
        >
          <circle cx="10" cy="10" r="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M 15 10 L 20 10" stroke="currentColor" strokeWidth="2" />
        </marker>
        <marker
          id="crow-one-one"
          viewBox="0 0 20 20"
          refX="19"
          refY="10"
          markerWidth="20"
          markerHeight="20"
          orient="auto"
        >
          <path d="M 10 10 L 15 10 M 15 10 L 20 10" stroke="currentColor" strokeWidth="2" />
        </marker>
        <marker
          id="crow-zero-many"
          viewBox="0 0 20 20"
          refX="19"
          refY="10"
          markerWidth="20"
          markerHeight="20"
          orient="auto"
        >
          <circle cx="10" cy="10" r="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M 15 5 L 20 10 L 15 15" stroke="currentColor" strokeWidth="2" fill="none" />
        </marker>
        <marker
          id="crow-one-many"
          viewBox="0 0 20 20"
          refX="19"
          refY="10"
          markerWidth="20"
          markerHeight="20"
          orient="auto"
        >
          <path d="M 10 10 L 15 10" stroke="currentColor" strokeWidth="2" />
          <path d="M 15 5 L 20 10 L 15 15" stroke="currentColor" strokeWidth="2" fill="none" />
        </marker>
      </defs>
      
      <BaseEdge
        id={id}
        path={edgePath}
        style={getStrokeStyle()}
        markerEnd={`url(#crow-${data?.targetCardinality?.replace('..', '-').replace('*', 'many')})`}
        markerStart={`url(#crow-${data?.sourceCardinality?.replace('..', '-').replace('*', 'many')})`}
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