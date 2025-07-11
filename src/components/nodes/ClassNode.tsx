import { Handle, Position, NodeProps } from 'reactflow'
import { ClassNode as ClassNodeType } from '../../types/diagram'
import clsx from 'clsx'

export default function ClassNode({ data, selected }: NodeProps<ClassNodeType['data']>) {
  const visibilitySymbol = (visibility: string) => {
    switch (visibility) {
      case '+': return '🟢'  // public
      case '-': return '🔴'  // private
      case '#': return '🟡'  // protected
      case '~': return '🟠'  // package
      default: return ''
    }
  }

  const formatMethod = (method: ClassNodeType['data']['methods'][0]) => {
    const params = method.parameters.join(', ')
    const returnType = method.returnType ? `: ${method.returnType}` : ''
    return `${method.name}(${params})${returnType}`
  }

  return (
    <div
      className={clsx(
        'border-2 min-w-[200px]',
        selected ? 'border-blue-500' : 'border-gray-800',
        'bg-white shadow-md'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />
      
      {/* Class Name Section */}
      <div className="bg-gray-100 px-3 py-2 border-b border-gray-800 text-center font-bold">
        {data.stereotype && (
          <div className="text-xs text-gray-600">
            &lt;&lt;{data.stereotype}&gt;&gt;
          </div>
        )}
        <div>{data.label}</div>
      </div>

      {/* Attributes Section */}
      {data.attributes.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-800">
          {data.attributes.map((attr, idx) => (
            <div key={idx} className="text-sm flex items-center gap-1">
              <span className="text-xs">{visibilitySymbol(attr.visibility)}</span>
              <span>{attr.name}: {attr.type}</span>
              {attr.isStatic && <span className="underline">S</span>}
            </div>
          ))}
        </div>
      )}

      {/* Methods Section */}
      {data.methods.length > 0 && (
        <div className="px-3 py-2">
          {data.methods.map((method, idx) => (
            <div key={idx} className="text-sm flex items-center gap-1">
              <span className="text-xs">{visibilitySymbol(method.visibility)}</span>
              <span className={clsx(method.isAbstract && 'italic')}>
                {formatMethod(method)}
              </span>
              {method.isStatic && <span className="underline">S</span>}
            </div>
          ))}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  )
}