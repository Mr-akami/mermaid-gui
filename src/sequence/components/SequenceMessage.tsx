import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react'
import { ArrowType } from '../types'

interface MessageData {
  label: string
  arrowType: ArrowType | string
  activate?: boolean
  deactivate?: boolean
}

export const SequenceMessage = memo((props: EdgeProps) => {
  const { sourceX, sourceY, targetX, targetY, data, markerEnd } = props
  const messageData = data as MessageData | undefined
  
  // Use straight path for sequence diagrams
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  // Determine line style based on arrow type
  const isDotted = messageData?.arrowType && (
    messageData.arrowType === ArrowType.DOTTED ||
    messageData.arrowType === ArrowType.DOTTED_ARROW ||
    messageData.arrowType === ArrowType.DOTTED_CROSS ||
    messageData.arrowType === ArrowType.DOTTED_ASYNC ||
    messageData.arrowType.includes('--')
  )

  const strokeDasharray = isDotted ? '5,5' : undefined

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeDasharray,
          stroke: '#333',
          strokeWidth: 2
        }}
      />
      {messageData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              background: '#fff',
              padding: '2px 5px',
              borderRadius: '3px',
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {messageData.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

SequenceMessage.displayName = 'SequenceMessage'