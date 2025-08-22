import { NodeProps, NodeResizer } from '@xyflow/react'
import { memo } from 'react'

export const GroupNode = memo(({ data, selected, id }: NodeProps) => {
  return (
    <div
      style={{ 
        width: '100%', 
        height: '100%',
        zIndex: -1 // Groups appear behind regular nodes
      }}
    >
      <NodeResizer
        isVisible={selected}
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
      <div 
        className="px-4 py-2 bg-purple-50 border-2 border-purple-500 border-dashed rounded-lg"
        style={{ width: '100%', height: '100%' }}
      >
        <div className="text-sm font-medium text-purple-700">
          {String(data?.label || 'Group')}
        </div>
      </div>
    </div>
  )
})

GroupNode.displayName = 'GroupNode'