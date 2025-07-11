import { Handle, Position, NodeProps } from 'reactflow'
import { ERNode as ERNodeType } from '../../types/diagram'
import clsx from 'clsx'

export default function ERNode({ data, selected }: NodeProps<ERNodeType['data']>) {
  const getKeyIndicator = (attr: ERNodeType['data']['attributes'][0]) => {
    if (attr.isPrimaryKey) return 'PK'
    if (attr.isForeignKey) return 'FK'
    if (attr.isUnique) return 'U'
    return ''
  }

  return (
    <div
      className={clsx(
        'border-2 min-w-[180px]',
        selected ? 'border-blue-500' : 'border-gray-800',
        'bg-white shadow-md'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />
      
      {/* Entity Name */}
      <div className="bg-blue-100 px-3 py-2 border-b border-gray-800 text-center font-bold">
        {data.label}
      </div>

      {/* Attributes */}
      <div className="px-3 py-2">
        {data.attributes.length === 0 ? (
          <div className="text-sm text-gray-400 italic">No attributes</div>
        ) : (
          data.attributes.map((attr, idx) => (
            <div key={idx} className="text-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="font-medium">{attr.name}</span>
                <span className="text-gray-600">: {attr.type}</span>
              </div>
              {getKeyIndicator(attr) && (
                <span className="text-xs bg-gray-200 px-1 rounded">
                  {getKeyIndicator(attr)}
                </span>
              )}
            </div>
          ))
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