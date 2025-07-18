import { Handle, Position, NodeProps } from '@xyflow/react'
import { memo } from 'react'

export const FlowchartNode = memo(({ data, type }: NodeProps) => {
  const getNodeContent = () => {
    switch (type) {
      case 'rectangle':
        return (
          <div className="px-4 py-2 bg-blue-100 border-2 border-blue-500 rounded">
            <div className="text-sm font-medium text-gray-900">
              {data.label || 'Rectangle'}
            </div>
          </div>
        )
      case 'circle':
        return (
          <div className="w-20 h-20 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center">
            <div className="text-sm font-medium text-gray-900 text-center">
              {data.label || 'Circle'}
            </div>
          </div>
        )
      case 'diamond':
        return (
          <div className="w-20 h-20 bg-yellow-100 border-2 border-yellow-500 transform rotate-45 flex items-center justify-center">
            <div className="transform -rotate-45 text-sm font-medium text-gray-900 text-center">
              {data.label || 'Diamond'}
            </div>
          </div>
        )
      case 'subgraph':
        return (
          <div className="px-4 py-2 bg-purple-100 border-2 border-purple-500 border-dashed rounded-lg min-w-[200px] min-h-[100px]">
            <div className="text-sm font-medium text-gray-900">
              {data.label || 'Subgraph'}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // For circle, position handles on the circle boundary
  if (type === 'circle') {
    return (
      <>
        <div className="relative">
          {/* Top handles */}
          <Handle
            id="target-top"
            type="target"
            position={Position.Top}
            className="w-3 h-3"
            style={{ left: '50%', top: '-5px' }}
          />
          <Handle
            id="source-top"
            type="source"
            position={Position.Top}
            className="w-3 h-3"
            style={{ left: '50%', top: '-5px' }}
          />
          {/* Right handles */}
          <Handle
            id="target-right"
            type="target"
            position={Position.Right}
            className="w-3 h-3"
            style={{ right: '-5px', top: '50%' }}
          />
          <Handle
            id="source-right"
            type="source"
            position={Position.Right}
            className="w-3 h-3"
            style={{ right: '-5px', top: '50%' }}
          />
          {/* Bottom handles */}
          <Handle
            id="target-bottom"
            type="target"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ left: '50%', bottom: '-5px' }}
          />
          <Handle
            id="source-bottom"
            type="source"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ left: '50%', bottom: '-5px' }}
          />
          {/* Left handles */}
          <Handle
            id="target-left"
            type="target"
            position={Position.Left}
            className="w-3 h-3"
            style={{ left: '-5px', top: '50%' }}
          />
          <Handle
            id="source-left"
            type="source"
            position={Position.Left}
            className="w-3 h-3"
            style={{ left: '-5px', top: '50%' }}
          />
          {getNodeContent()}
        </div>
      </>
    )
  }

  if (type === 'diamond') {
    // Diamond is 80x80 rotated 45 degrees
    // Calculate positions for 8 handles (4 vertices + 4 edge midpoints)
    const size = 80
    const halfSize = size / 2
    const offset = 5 // Handle offset from edge
    
    return (
      <>
        <div className="relative">
          {/* Top vertex (actually top corner when rotated) */}
          <Handle
            id="target-top"
            type="target"
            position={Position.Top}
            className="w-3 h-3"
            style={{ left: '50%', top: `-${offset}px` }}
          />
          <Handle
            id="source-top"
            type="source"
            position={Position.Top}
            className="w-3 h-3"
            style={{ left: '50%', top: `-${offset}px` }}
          />
          
          {/* Top-right edge midpoint - offset perpendicular to edge */}
          <Handle
            id="target-topright"
            type="target"
            position={Position.Top}
            className="w-3 h-3"
            style={{ left: `${halfSize * 1.5 + offset/Math.sqrt(2)}px`, top: `${halfSize/2 - offset/Math.sqrt(2)}px` }}
          />
          <Handle
            id="source-topright"
            type="source"
            position={Position.Top}
            className="w-3 h-3"
            style={{ left: `${halfSize * 1.5 + offset/Math.sqrt(2)}px`, top: `${halfSize/2 - offset/Math.sqrt(2)}px` }}
          />
          
          {/* Right vertex */}
          <Handle
            id="target-right"
            type="target"
            position={Position.Right}
            className="w-3 h-3"
            style={{ right: `-${offset}px`, top: '50%' }}
          />
          <Handle
            id="source-right"
            type="source"
            position={Position.Right}
            className="w-3 h-3"
            style={{ right: `-${offset}px`, top: '50%' }}
          />
          
          {/* Bottom-right edge midpoint - offset perpendicular to edge */}
          <Handle
            id="target-bottomright"
            type="target"
            position={Position.Right}
            className="w-3 h-3"
            style={{ right: `${halfSize/2 - offset/Math.sqrt(2)}px`, bottom: `${halfSize/2 - offset/Math.sqrt(2)}px` }}
          />
          <Handle
            id="source-bottomright"
            type="source"
            position={Position.Right}
            className="w-3 h-3"
            style={{ right: `${halfSize/2 - offset/Math.sqrt(2)}px`, bottom: `${halfSize/2 - offset/Math.sqrt(2)}px` }}
          />
          
          {/* Bottom vertex */}
          <Handle
            id="target-bottom"
            type="target"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ left: '50%', bottom: `-${offset}px` }}
          />
          <Handle
            id="source-bottom"
            type="source"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ left: '50%', bottom: `-${offset}px` }}
          />
          
          {/* Bottom-left edge midpoint - offset perpendicular to edge */}
          <Handle
            id="target-bottomleft"
            type="target"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ left: `${halfSize/2 - offset/Math.sqrt(2)}px`, bottom: `${halfSize/2 - offset/Math.sqrt(2)}px` }}
          />
          <Handle
            id="source-bottomleft"
            type="source"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ left: `${halfSize/2 - offset/Math.sqrt(2)}px`, bottom: `${halfSize/2 - offset/Math.sqrt(2)}px` }}
          />
          
          {/* Left vertex */}
          <Handle
            id="target-left"
            type="target"
            position={Position.Left}
            className="w-3 h-3"
            style={{ left: `-${offset}px`, top: '50%' }}
          />
          <Handle
            id="source-left"
            type="source"
            position={Position.Left}
            className="w-3 h-3"
            style={{ left: `-${offset}px`, top: '50%' }}
          />
          
          {/* Top-left edge midpoint - offset perpendicular to edge */}
          <Handle
            id="target-topleft"
            type="target"
            position={Position.Left}
            className="w-3 h-3"
            style={{ left: `${halfSize/2 - offset/Math.sqrt(2)}px`, top: `${halfSize/2 - offset/Math.sqrt(2)}px` }}
          />
          <Handle
            id="source-topleft"
            type="source"
            position={Position.Left}
            className="w-3 h-3"
            style={{ left: `${halfSize/2 - offset/Math.sqrt(2)}px`, top: `${halfSize/2 - offset/Math.sqrt(2)}px` }}
          />
          
          {getNodeContent()}
        </div>
      </>
    )
  }

  // Default for rectangle - wrap in relative div for consistent structure
  return (
    <div className="relative">
      {/* Top handles */}
      <Handle
        id="target-top"
        type="target"
        position={Position.Top}
        className="w-3 h-3"
      />
      <Handle
        id="source-top"
        type="source"
        position={Position.Top}
        className="w-3 h-3"
      />
      {/* Right handles */}
      <Handle
        id="target-right"
        type="target"
        position={Position.Right}
        className="w-3 h-3"
      />
      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
        className="w-3 h-3"
      />
      {/* Bottom handles */}
      <Handle
        id="target-bottom"
        type="target"
        position={Position.Bottom}
        className="w-3 h-3"
      />
      <Handle
        id="source-bottom"
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
      />
      {/* Left handles */}
      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        className="w-3 h-3"
      />
      <Handle
        id="source-left"
        type="source"
        position={Position.Left}
        className="w-3 h-3"
      />
      {getNodeContent()}
    </div>
  )
})

FlowchartNode.displayName = 'FlowchartNode'
