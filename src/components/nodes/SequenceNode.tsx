import { Handle, Position, NodeProps } from 'reactflow'
import { SequenceNode as SequenceNodeType } from '../../types/diagram'
import { useState, useCallback, useRef } from 'react'
import { useSetAtom } from 'jotai'
import { nodesAtom } from '@/store/flowStore'
import clsx from 'clsx'

export default function SequenceNode({ data, id, selected }: NodeProps<SequenceNodeType['data']>) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label)
  const [alias, setAlias] = useState(data.alias || '')
  const setNodes = useSetAtom(nodesAtom)
  const isComposingRef = useRef(false)
  const isActor = data.type === 'actor'

  // Reset label and alias when not editing and data changes
  if (!isEditing && (label !== data.label || alias !== (data.alias || ''))) {
    setLabel(data.label)
    setAlias(data.alias || '')
  }

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  const updateNode = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                label: label || `${isActor ? 'Actor' : 'Participant'} ${id}`,
                alias: alias || undefined
              }
            }
          : node
      )
    )
  }, [id, label, alias, setNodes, isActor])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    updateNode()
  }, [updateNode])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isComposingRef.current) {
        handleBlur()
      }
    },
    [handleBlur]
  )

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true
  }, [])

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false
    updateNode()
  }, [updateNode])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setNodes((nodes) => nodes.filter((node) => node.id !== id))
    },
    [id, setNodes]
  )

  return (
    <div
      className={clsx(
        'px-4 py-3 rounded-md border-2 min-w-[140px] text-center relative',
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white',
        'shadow-sm hover:shadow-md transition-shadow'
      )}
      onContextMenu={handleContextMenu}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />
      
      <div className="flex flex-col items-center space-y-2">
        {isActor && (
          <div className="text-2xl">👤</div>
        )}
        
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              className="w-full px-2 py-1 text-sm border rounded text-center"
              placeholder={isActor ? 'Actor name' : 'Participant name'}
              autoFocus
            />
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              className="w-full px-2 py-1 text-xs border rounded text-center"
              placeholder="Alias (optional)"
            />
          </div>
        ) : (
          <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
            <div className="font-medium text-sm">{label}</div>
            {alias && (
              <div className="text-xs text-gray-500 mt-1">({alias})</div>
            )}
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500"
      />
      
      {/* Add activation indicator */}
      <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-yellow-400 rounded-sm opacity-0 hover:opacity-100 transition-opacity" 
           title="Activation box" />
    </div>
  )
}