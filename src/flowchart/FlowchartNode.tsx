import { Handle, Position, NodeProps } from '@xyflow/react'
import { memo } from 'react'

export const FlowchartNode = memo(({ data, type }: NodeProps) => {
  const getNodeContent = () => {
    switch (type) {
      case 'rectangle':
        return (
          <div className="px-4 py-2 bg-blue-100 border-2 border-blue-500 rounded">
            <div className="text-sm font-medium text-gray-900">
              {data?.label || 'Rectangle'}
            </div>
          </div>
        )
      case 'circle':
        return (
          <div className="w-20 h-20 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center">
            <div className="text-sm font-medium text-gray-900 text-center">
              {data?.label || 'Circle'}
            </div>
          </div>
        )
      case 'diamond':
        return (
          <div className="w-20 h-20 bg-yellow-100 border-2 border-yellow-500 transform rotate-45 flex items-center justify-center">
            <div className="transform -rotate-45 text-sm font-medium text-gray-900 text-center">
              {data?.label || 'Diamond'}
            </div>
          </div>
        )
      case 'subgraph':
        return (
          <div className="px-4 py-2 bg-purple-100 border-2 border-purple-500 border-dashed rounded-lg min-w-[200px] min-h-[100px]">
            <div className="text-sm font-medium text-gray-900">
              {data?.label || 'Subgraph'}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
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
      {getNodeContent()}
    </>
  )
})

FlowchartNode.displayName = 'FlowchartNode'
