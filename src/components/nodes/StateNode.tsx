import { Handle, Position, NodeProps } from 'reactflow'
import { StateNode as StateNodeType } from '../../types/diagram'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { nodesAtom } from '@/store/flowStore'
import clsx from 'clsx'

export default function StateNode({ data, id, selected }: NodeProps<StateNodeType['data']>) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label)
  const setNodes = useSetAtom(nodesAtom)
  const isComposingRef = useRef(false)

  useEffect(() => {
    setLabel(data.label)
  }, [data.label])

  const updateNodeLabel = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label } }
          : node
      )
    )
  }, [id, label, setNodes])

  const handleDoubleClick = useCallback(() => {
    if (data.type === 'state') {
      setIsEditing(true)
    }
  }, [data.type])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    updateNodeLabel()
  }, [updateNodeLabel])

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
    updateNodeLabel()
  }, [updateNodeLabel])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setNodes((nodes) => nodes.filter((node) => node.id !== id))
    },
    [id, setNodes]
  )

  const renderNodeContent = () => {
    switch (data.type) {
      case 'start':
        return (
          <div 
            className="w-8 h-8 bg-black rounded-full cursor-pointer"
            title="Start State"
            onContextMenu={handleContextMenu}
          />
        )
      case 'end':
        return (
          <div 
            className="w-8 h-8 bg-black rounded-full ring-2 ring-black ring-offset-2 cursor-pointer"
            title="End State" 
            onContextMenu={handleContextMenu}
          />
        )
      case 'choice':
        return (
          <div 
            className="w-12 h-12 bg-yellow-200 transform rotate-45 border-2 border-gray-800 cursor-pointer flex items-center justify-center"
            title="Choice State"
            onContextMenu={handleContextMenu}
          >
            <div className="transform -rotate-45 text-xs font-bold">?</div>
          </div>
        )
      case 'fork':
        return (
          <div 
            className="w-24 h-3 bg-black cursor-pointer relative"
            title="Fork State - splits into parallel states"
            onContextMenu={handleContextMenu}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
              Fork
            </div>
          </div>
        )
      case 'join':
        return (
          <div 
            className="w-24 h-3 bg-black cursor-pointer relative"
            title="Join State - merges parallel states"
            onContextMenu={handleContextMenu}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
              Join
            </div>
          </div>
        )
      default:
        return (
          <div
            className={clsx(
              'px-4 py-3 rounded-lg border-2 min-w-[120px] text-center relative',
              selected ? 'border-blue-500 bg-blue-50' : 'border-gray-800 bg-white',
              'shadow-sm hover:shadow-md transition-shadow cursor-pointer'
            )}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
          >
            {isEditing ? (
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                className="w-full text-center font-medium bg-transparent border-none outline-none"
                autoFocus
              />
            ) : (
              <div className="font-medium">{data.label}</div>
            )}
            
            {data.isComposite && (
              <div className="text-xs text-gray-500 mt-1 italic">
                [Composite State]
              </div>
            )}

            {/* State description */}
            {data.type === 'state' && data.label && (
              <div className="text-xs text-gray-600 mt-1">
                State: {data.label}
              </div>
            )}
          </div>
        )
    }
  }

  const isSpecialNode = ['start', 'end', 'choice', 'fork', 'join'].includes(data.type)
  const isHorizontalNode = ['fork', 'join'].includes(data.type)

  return (
    <div className={clsx('relative', isSpecialNode && 'flex items-center justify-center')}>
      {/* Special handle positioning for fork/join states */}
      {isHorizontalNode ? (
        <>
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-blue-500"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-blue-500"
          />
          {/* Additional handles for parallel branches */}
          <Handle
            type="source"
            position={Position.Top}
            className="w-3 h-3 bg-blue-500"
            id="top"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 bg-blue-500"
            id="bottom"
          />
        </>
      ) : (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className={clsx(
              'w-3 h-3',
              isSpecialNode ? 'bg-blue-500' : 'bg-blue-500'
            )}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className={clsx(
              'w-3 h-3',
              isSpecialNode ? 'bg-blue-500' : 'bg-blue-500'
            )}
          />
          {/* Additional side handles for better connections */}
          {!isSpecialNode && (
            <>
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
            </>
          )}
        </>
      )}
      
      {renderNodeContent()}
    </div>
  )
}