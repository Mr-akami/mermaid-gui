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
      case 'roundEdges':
        return (
          <div className="px-4 py-2 bg-blue-100 border-2 border-blue-500 rounded-lg">
            <div className="text-sm font-medium text-gray-900">
              {data?.label || 'Round Edges'}
            </div>
          </div>
        )
      case 'stadium':
        return (
          <div className="px-6 py-2 bg-green-100 border-2 border-green-500 rounded-full">
            <div className="text-sm font-medium text-gray-900">
              {data?.label || 'Stadium'}
            </div>
          </div>
        )
      case 'subroutine':
        return (
          <div className="border-4 border-blue-600 p-0.5">
            <div className="px-4 py-2 bg-blue-100 border-2 border-blue-500">
              <div className="text-sm font-medium text-gray-900">
                {data?.label || 'Subroutine'}
              </div>
            </div>
          </div>
        )
      case 'cylindrical':
        return (
          <div className="px-4 py-2 bg-indigo-100 border-2 border-indigo-500 rounded-t-full rounded-b">
            <div className="text-sm font-medium text-gray-900">
              {data?.label || 'Cylindrical'}
            </div>
          </div>
        )
      case 'parallelogram':
        return (
          <div 
            className="px-6 py-2 bg-orange-100 border-2 border-orange-500"
            style={{ transform: 'skewX(-20deg)' }}
          >
            <div className="text-sm font-medium text-gray-900" style={{ transform: 'skewX(20deg)' }}>
              {data?.label || 'Parallelogram'}
            </div>
          </div>
        )
      case 'trapezoid':
        return (
          <div 
            className="px-6 py-2 bg-teal-100 border-2 border-teal-500"
            style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
          >
            <div className="text-sm font-medium text-gray-900">
              {data?.label || 'Trapezoid'}
            </div>
          </div>
        )
      case 'hexagon':
        return (
          <div 
            className="px-6 py-2 bg-pink-100 border-2 border-pink-500"
            style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}
          >
            <div className="text-sm font-medium text-gray-900">
              {data?.label || 'Hexagon'}
            </div>
          </div>
        )
      case 'doubleCircle':
        return (
          <div className="p-1 bg-green-100 border-4 border-green-600 rounded-full">
            <div className="w-16 h-16 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center">
              <div className="text-sm font-medium text-gray-900 text-center">
                {data?.label || 'Double Circle'}
              </div>
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
