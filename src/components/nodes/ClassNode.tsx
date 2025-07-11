import { Handle, Position, NodeProps } from 'reactflow'
import { ClassNode as ClassNodeType } from '../../types/diagram'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { nodesAtom } from '@/store/flowStore'
import clsx from 'clsx'

export default function ClassNode({ data, id, selected }: NodeProps<ClassNodeType['data']>) {
  const [editingClass, setEditingClass] = useState(false)
  const [className, setClassName] = useState(data.label)
  const [newAttribute, setNewAttribute] = useState('')
  const [newMethod, setNewMethod] = useState('')
  const setNodes = useSetAtom(nodesAtom)
  const isComposingRef = useRef(false)

  useEffect(() => {
    setClassName(data.label)
  }, [data.label])

  const updateNode = useCallback((updates: Partial<ClassNodeType['data']>) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    )
  }, [id, setNodes])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setNodes((nodes) => nodes.filter((node) => node.id !== id))
    },
    [id, setNodes]
  )

  const visibilitySymbol = (visibility: string) => {
    switch (visibility) {
      case '+': return '🟢'  // public
      case '-': return '🔴'  // private  
      case '#': return '🟡'  // protected
      case '~': return '🟠'  // package
      default: return ''
    }
  }

  const parseAttribute = (text: string) => {
    // Parse format: [visibility] name: type [static] [abstract]
    const parts = text.trim().split(/\s+/)
    const visibility = parts[0].match(/[+\-#~]/) ? parts.shift()! : '+'
    const restText = parts.join(' ')
    const [nameType] = restText.split(/\s+(static|abstract)/)
    const [name, type] = nameType.split(':').map(s => s.trim())
    
    return {
      name: name || 'newAttribute',
      type: type || 'String',
      visibility: visibility as '+' | '-' | '#' | '~',
      isStatic: text.includes('static'),
      isAbstract: text.includes('abstract')
    }
  }

  const parseMethod = (text: string) => {
    // Parse format: [visibility] name(params): returnType [static] [abstract]
    const parts = text.trim().split(/\s+/)
    const visibility = parts[0].match(/[+\-#~]/) ? parts.shift()! : '+'
    const restText = parts.join(' ')
    const [nameAndParams, returnType] = restText.split(':').map(s => s.trim())
    const [name, paramsStr] = nameAndParams.split('(')
    const parameters = paramsStr?.replace(')', '').split(',').map(p => p.trim()).filter(Boolean) || []
    
    return {
      name: name || 'newMethod',
      parameters,
      returnType: returnType || 'void',
      visibility: visibility as '+' | '-' | '#' | '~',
      isStatic: text.includes('static'),
      isAbstract: text.includes('abstract')
    }
  }

  const addAttribute = () => {
    if (newAttribute.trim()) {
      const attr = parseAttribute(newAttribute)
      updateNode({ attributes: [...data.attributes, attr] })
      setNewAttribute('')
    }
  }

  const addMethod = () => {
    if (newMethod.trim()) {
      const method = parseMethod(newMethod)
      updateNode({ methods: [...data.methods, method] })
      setNewMethod('')
    }
  }

  const removeAttribute = (index: number) => {
    const newAttributes = data.attributes.filter((_, i) => i !== index)
    updateNode({ attributes: newAttributes })
  }

  const removeMethod = (index: number) => {
    const newMethods = data.methods.filter((_, i) => i !== index)
    updateNode({ methods: newMethods })
  }

  const formatMethod = (method: ClassNodeType['data']['methods'][0]) => {
    const params = method.parameters.join(', ')
    const returnType = method.returnType ? `: ${method.returnType}` : ''
    return `${method.name}(${params})${returnType}`
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isComposingRef.current) {
        e.preventDefault()
        if (editingClass) {
          updateNode({ label: className })
          setEditingClass(false)
        }
      }
    },
    [editingClass, className, updateNode]
  )

  return (
    <div
      className={clsx(
        'border-2 min-w-[220px] bg-white shadow-md',
        selected ? 'border-blue-500' : 'border-gray-800'
      )}
      onContextMenu={handleContextMenu}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />
      
      {/* Class Name Section */}
      <div className="bg-gray-100 px-3 py-2 border-b border-gray-800 text-center">
        {data.stereotype && (
          <div className="text-xs text-gray-600 italic">
            &lt;&lt;{data.stereotype}&gt;&gt;
          </div>
        )}
        {editingClass ? (
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            onBlur={() => {
              updateNode({ label: className })
              setEditingClass(false)
            }}
            onKeyDown={handleKeyDown}
            className="w-full text-center font-bold bg-transparent border-none outline-none"
            autoFocus
          />
        ) : (
          <div 
            className="font-bold cursor-pointer"
            onDoubleClick={() => setEditingClass(true)}
          >
            {data.label}
          </div>
        )}
      </div>

      {/* Attributes Section */}
      <div className="border-b border-gray-800">
        <div className="px-3 py-1 bg-gray-50 text-xs font-semibold text-gray-600">
          Attributes
        </div>
        <div className="px-3 py-2 min-h-[20px]">
          {data.attributes.map((attr, idx) => (
            <div key={idx} className="text-sm flex items-center justify-between group">
              <div className="flex items-center gap-1">
                <span className="text-xs">{visibilitySymbol(attr.visibility)}</span>
                <span className={clsx(attr.isStatic && 'underline')}>
                  {attr.name}: {attr.type}
                </span>
                {attr.isAbstract && <span className="text-xs italic">abs</span>}
              </div>
              <button
                onClick={() => removeAttribute(idx)}
                className="opacity-0 group-hover:opacity-100 text-red-500 text-xs px-1"
              >
                ×
              </button>
            </div>
          ))}
          <div className="mt-2">
            <input
              type="text"
              value={newAttribute}
              onChange={(e) => setNewAttribute(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAttribute()}
              placeholder="+ name: type"
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            />
          </div>
        </div>
      </div>

      {/* Methods Section */}
      <div>
        <div className="px-3 py-1 bg-gray-50 text-xs font-semibold text-gray-600">
          Methods
        </div>
        <div className="px-3 py-2 min-h-[20px]">
          {data.methods.map((method, idx) => (
            <div key={idx} className="text-sm flex items-center justify-between group">
              <div className="flex items-center gap-1">
                <span className="text-xs">{visibilitySymbol(method.visibility)}</span>
                <span className={clsx(
                  method.isAbstract && 'italic',
                  method.isStatic && 'underline'
                )}>
                  {formatMethod(method)}
                </span>
              </div>
              <button
                onClick={() => removeMethod(idx)}
                className="opacity-0 group-hover:opacity-100 text-red-500 text-xs px-1"
              >
                ×
              </button>
            </div>
          ))}
          <div className="mt-2">
            <input
              type="text"
              value={newMethod}
              onChange={(e) => setNewMethod(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMethod()}
              placeholder="+ method(): type"
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            />
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500"
      />
      
      {/* Side handles for better connections */}
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500"
        id="left"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500"
        id="right"
      />
    </div>
  )
}