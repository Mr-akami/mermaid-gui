import { Handle, Position, NodeProps, NodeResizer } from 'reactflow'
import { memo } from 'react'

export const ResizableSubgraph = memo(({ data, selected }: NodeProps) => {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={100}
        handleStyle={{
          width: '10px',
          height: '10px',
          borderRadius: '2px',
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-green-500 !border-green-700"
        title="Input"
      />
      <div className="px-4 py-2 bg-purple-100 border-2 border-purple-500 border-dashed rounded-lg w-full h-full">
        <div className="text-sm font-medium text-gray-900">
          {data.label || 'Subgraph'}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-red-500 !border-red-700"
        title="Output"
      />
    </>
  )
})

ResizableSubgraph.displayName = 'ResizableSubgraph'

