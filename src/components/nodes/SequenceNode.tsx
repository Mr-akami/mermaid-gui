import { Handle, Position, NodeProps } from 'reactflow'
import { SequenceNode as SequenceNodeType } from '../../types/diagram'
import clsx from 'clsx'

export default function SequenceNode({ data, selected }: NodeProps<SequenceNodeType['data']>) {
  const isActor = data.type === 'actor'

  return (
    <div
      className={clsx(
        'px-4 py-2 rounded-md border-2 min-w-[120px] text-center',
        selected ? 'border-blue-500' : 'border-gray-300',
        'bg-white shadow-sm'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />
      <div className="flex flex-col items-center">
        {isActor && (
          <div className="text-2xl mb-1">👤</div>
        )}
        <div className="font-medium">{data.label}</div>
        {data.alias && (
          <div className="text-xs text-gray-500">({data.alias})</div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  )
}