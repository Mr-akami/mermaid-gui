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
  const { source, target, sourceX, sourceY, targetX, targetY, data, markerEnd } = props
  const messageData = data as MessageData | undefined
  
  // Check if this is a self-loop (same source and target)
  const isSelfLoop = source === target
  
  let edgePath: string
  let labelX: number
  let labelY: number
  
  if (isSelfLoop) {
    // Create a rectangular path for self-loops
    const loopOffset = 50 // How far to extend the loop
    
    // Create a path that goes right, down/up, and back left
    edgePath = `
      M ${sourceX},${sourceY}
      L ${sourceX + loopOffset},${sourceY}
      L ${sourceX + loopOffset},${targetY}
      L ${targetX},${targetY}
    `
    
    // Position label at the rightmost point of the loop
    labelX = sourceX + loopOffset
    labelY = (sourceY + targetY) / 2
  } else {
    // Use straight path for normal messages
    const [straightPath, straightLabelX, straightLabelY] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    })
    edgePath = straightPath
    labelX = straightLabelX
    labelY = straightLabelY
  }

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