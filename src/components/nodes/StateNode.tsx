import { Handle, Position, NodeProps } from 'reactflow'
import { StateNode as StateNodeType } from '../../types/diagram'
import clsx from 'clsx'

export default function StateNode({ data, selected }: NodeProps<StateNodeType['data']>) {
  const renderNodeContent = () => {
    switch (data.type) {
      case 'start':
        return (
          <div className="w-8 h-8 bg-black rounded-full" />
        )
      case 'end':
        return (
          <div className="w-8 h-8 bg-black rounded-full ring-2 ring-black ring-offset-2" />
        )
      case 'choice':
        return (
          <div className="w-12 h-12 bg-yellow-200 transform rotate-45 border-2 border-gray-800" />
        )
      case 'fork':
      case 'join':
        return (
          <div className="w-24 h-2 bg-black" />
        )
      default:
        return (
          <div
            className={clsx(
              'px-4 py-2 rounded-lg border-2 min-w-[120px] text-center',
              selected ? 'border-blue-500' : 'border-gray-800',
              'bg-white shadow-sm'
            )}
          >
            <div className="font-medium">{data.label}</div>
            {data.isComposite && (
              <div className="text-xs text-gray-500 mt-1">
                [Composite State]
              </div>
            )}
          </div>
        )
    }
  }

  const isSpecialNode = ['start', 'end', 'choice', 'fork', 'join'].includes(data.type)

  return (
    <div className={clsx('relative', isSpecialNode && 'flex items-center justify-center')}>
      <Handle
        type="target"
        position={Position.Top}
        className={clsx(
          'w-3 h-3',
          isSpecialNode ? 'bg-transparent border-0' : 'bg-blue-500'
        )}
      />
      
      {renderNodeContent()}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className={clsx(
          'w-3 h-3',
          isSpecialNode ? 'bg-transparent border-0' : 'bg-blue-500'
        )}
      />
    </div>
  )
}