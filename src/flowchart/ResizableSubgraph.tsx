import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react'
import { memo, useState } from 'react'

export const ResizableSubgraph = memo(({ data, selected, id }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      />
      {/* Connection handles on all sides */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 h-2 !bg-transparent !border-0"
        style={{ top: -1 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-16 !bg-transparent !border-0"
        style={{ left: -1 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 h-2 !bg-transparent !border-0"
        style={{ bottom: -1 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-16 !bg-transparent !border-0"
        style={{ right: -1 }}
      />
      <div 
        className="px-4 py-2 bg-purple-100 border-2 border-purple-500 border-dashed rounded-lg"
        style={{ width: '100%', height: '100%' }}
      >
        <div className="text-sm font-medium text-gray-900">
          {data?.label || 'Subgraph'}
        </div>
      </div>
    </div>
  )
})

ResizableSubgraph.displayName = 'ResizableSubgraph'

