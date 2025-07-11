import { Handle, Position, NodeProps } from 'reactflow'
import { ERNode as ERNodeType } from '../../types/diagram'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { nodesAtom } from '@/store/flowStore'
import clsx from 'clsx'

export default function ERNode({ data, id, selected }: NodeProps<ERNodeType['data']>) {
  const [editingEntity, setEditingEntity] = useState(false)
  const [entityName, setEntityName] = useState(data.label)
  const [newAttribute, setNewAttribute] = useState('')
  const setNodes = useSetAtom(nodesAtom)
  const isComposingRef = useRef(false)

  useEffect(() => {
    setEntityName(data.label)
  }, [data.label])

  const updateNode = useCallback((updates: Partial<ERNodeType['data']>) => {
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

  const getKeyIndicators = (attr: ERNodeType['data']['attributes'][0]) => {
    const indicators: string[] = []
    if (attr.isPrimaryKey) indicators.push('PK')
    if (attr.isForeignKey) indicators.push('FK')
    if (attr.isUnique) indicators.push('UK')
    return indicators
  }

  const parseAttribute = (text: string) => {
    // Parse format: name type [PK] [FK] [UK] [NULL]
    const parts = text.trim().split(/\s+/)
    const name = parts[0] || 'newAttribute'
    const type = parts[1] || 'string'
    const constraints = parts.slice(2).join(' ').toUpperCase()
    
    return {
      name,
      type,
      isPrimaryKey: constraints.includes('PK'),
      isForeignKey: constraints.includes('FK'),
      isUnique: constraints.includes('UK'),
      isNullable: constraints.includes('NULL')
    }
  }

  const addAttribute = () => {
    if (newAttribute.trim()) {
      const attr = parseAttribute(newAttribute)
      updateNode({ attributes: [...data.attributes, attr] })
      setNewAttribute('')
    }
  }

  const removeAttribute = (index: number) => {
    const newAttributes = data.attributes.filter((_, i) => i !== index)
    updateNode({ attributes: newAttributes })
  }


  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isComposingRef.current) {
        e.preventDefault()
        if (editingEntity) {
          updateNode({ label: entityName })
          setEditingEntity(false)
        }
      }
    },
    [editingEntity, entityName, updateNode]
  )

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true
  }, [])

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false
    updateNode({ label: entityName })
  }, [entityName, updateNode])

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
      
      {/* Entity Name */}
      <div className="bg-blue-100 px-3 py-2 border-b border-gray-800 text-center">
        {editingEntity ? (
          <input
            type="text"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            onBlur={() => {
              updateNode({ label: entityName })
              setEditingEntity(false)
            }}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            className="w-full text-center font-bold bg-transparent border-none outline-none"
            autoFocus
          />
        ) : (
          <div 
            className="font-bold cursor-pointer"
            onDoubleClick={() => setEditingEntity(true)}
          >
            {data.label}
          </div>
        )}
      </div>

      {/* Attributes Section */}
      <div className="px-3 py-2 min-h-[60px]">
        {data.attributes.length === 0 ? (
          <div className="text-sm text-gray-400 italic text-center">
            No attributes - double click to add
          </div>
        ) : (
          data.attributes.map((attr, idx) => (
            <div key={idx} className="text-sm flex items-center justify-between group mb-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className={clsx(
                    'font-medium',
                    attr.isPrimaryKey && 'text-blue-600 font-bold'
                  )}>
                    {attr.isPrimaryKey ? '🔑' : '📝'} {attr.name}
                  </span>
                  <span className="text-gray-600">: {attr.type}</span>
                  {attr.isNullable && <span className="text-xs text-gray-500">NULL</span>}
                </div>
                <div className="flex gap-1">
                  {getKeyIndicators(attr).map((indicator, i) => (
                    <span key={i} className={clsx(
                      'text-xs px-1 rounded text-white',
                      indicator === 'PK' ? 'bg-blue-500' :
                      indicator === 'FK' ? 'bg-green-500' :
                      indicator === 'UK' ? 'bg-purple-500' : 'bg-gray-400'
                    )}>
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => removeAttribute(idx)}
                className="opacity-0 group-hover:opacity-100 text-red-500 text-xs px-1"
              >
                ×
              </button>
            </div>
          ))
        )}
        
        {/* Add Attribute Input */}
        <div className="mt-2 border-t pt-2">
          <input
            type="text"
            value={newAttribute}
            onChange={(e) => setNewAttribute(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAttribute()}
            placeholder="name type [PK] [FK] [UK] [NULL]"
            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
          />
          <div className="text-xs text-gray-500 mt-1">
            Examples: "id int PK", "email string UK", "user_id int FK"
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