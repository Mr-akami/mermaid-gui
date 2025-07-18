import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react'
import { memo, useState } from 'react'

export const ResizableSubgraph = memo(({ data, selected, id }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  
  return (
    <div
      onMouseEnter={() => !isResizing && setIsHovered(true)}
      onMouseLeave={() => !isResizing && setIsHovered(false)}
      style={{ width: '100%', height: '100%' }}
    >
      <NodeResizer
        isVisible={selected || isHovered}
        minWidth={200}
        minHeight={100}
        handleStyle={{
          width: '10px',
          height: '10px',
          borderRadius: '2px',
          backgroundColor: '#3b82f6',
          border: '1px solid #2563eb',
        }}
        handleClassName="nodrag"
        keepAspectRatio={false}
        nodeId={id}
        lineStyle={{
          border: '1px dashed #3b82f6',
        }}
        shouldResize={() => true}
        onResizeStart={() => {
          setIsResizing(true)
          setIsHovered(true) // Keep hover state during resize
        }}
        onResizeEnd={() => {
          setIsResizing(false)
        }}
      />
      {/* Bidirectional connection handles on all sides */}
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
      <div 
        className="px-4 py-2 bg-purple-100/20 border-2 border-purple-500 border-dashed rounded-lg"
        style={{ width: '100%', height: '100%' }}
      >
        <div className="text-sm font-medium text-gray-900">
          {data.label || 'Subgraph'}
        </div>
      </div>
    </div>
  )
})

ResizableSubgraph.displayName = 'ResizableSubgraph'

