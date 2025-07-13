import { Handle, Position } from 'reactflow'
import { CSSProperties, useState } from 'react'

interface EdgeHandleProps {
  type: 'source' | 'target'
  id: string
  isConnectable?: boolean
}

export const EdgeHandle = ({ type, id, isConnectable }: EdgeHandleProps) => {
  // Create handles on all four edges with margin
  const edgeMargin = 15 // pixels from edge where connection can start
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)
  
  const baseStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    pointerEvents: 'all',
    cursor: 'crosshair',
  }
  
  // Position handles based on which edge they're on
  const getEdgeStyle = (edge: 'top' | 'right' | 'bottom' | 'left'): CSSProperties => {
    switch (edge) {
      case 'top':
        return {
          ...baseStyle,
          width: '100%',
          height: `${edgeMargin}px`,
          top: `-${edgeMargin / 2}px`,
          left: '0',
        }
      case 'right':
        return {
          ...baseStyle,
          width: `${edgeMargin}px`,
          height: '100%',
          top: '0',
          right: `-${edgeMargin / 2}px`,
        }
      case 'bottom':
        return {
          ...baseStyle,
          width: '100%',
          height: `${edgeMargin}px`,
          bottom: `-${edgeMargin / 2}px`,
          left: '0',
        }
      case 'left':
        return {
          ...baseStyle,
          width: `${edgeMargin}px`,
          height: '100%',
          top: '0',
          left: `-${edgeMargin / 2}px`,
        }
    }
  }
  
  // Render handles on all edges
  return (
    <>
      <Handle
        type={type}
        position={Position.Top}
        id={`${id}-top`}
        style={{
          ...getEdgeStyle('top'),
          backgroundColor: hoveredEdge === 'top' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
        }}
        isConnectable={isConnectable}
        onMouseEnter={() => setHoveredEdge('top')}
        onMouseLeave={() => setHoveredEdge(null)}
      />
      <Handle
        type={type}
        position={Position.Right}
        id={`${id}-right`}
        style={{
          ...getEdgeStyle('right'),
          backgroundColor: hoveredEdge === 'right' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
        }}
        isConnectable={isConnectable}
        onMouseEnter={() => setHoveredEdge('right')}
        onMouseLeave={() => setHoveredEdge(null)}
      />
      <Handle
        type={type}
        position={Position.Bottom}
        id={`${id}-bottom`}
        style={{
          ...getEdgeStyle('bottom'),
          backgroundColor: hoveredEdge === 'bottom' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
        }}
        isConnectable={isConnectable}
        onMouseEnter={() => setHoveredEdge('bottom')}
        onMouseLeave={() => setHoveredEdge(null)}
      />
      <Handle
        type={type}
        position={Position.Left}
        id={`${id}-left`}
        style={{
          ...getEdgeStyle('left'),
          backgroundColor: hoveredEdge === 'left' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
        }}
        isConnectable={isConnectable}
        onMouseEnter={() => setHoveredEdge('left')}
        onMouseLeave={() => setHoveredEdge(null)}
      />
    </>
  )
}