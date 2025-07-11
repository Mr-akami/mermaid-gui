import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { useSetAtom } from 'jotai'
import { nodesAtom } from '@/store/flowStore'

const CustomNode = memo(({ data, id }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label)
  const setNodes = useSetAtom(nodesAtom)
  const isComposingRef = useRef(false)

  // Sync label with data.label
  useEffect(() => {
    setLabel(data.label)
  }, [data.label])

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  const updateNodeLabel = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label } }
          : node
      )
    )
  }, [id, label, setNodes])

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

  const getNodeStyle = () => {
    const baseStyle = {
      backgroundColor: '#ffffff',
      border: '2px solid #374151',
      padding: '10px',
      fontSize: '14px',
      fontWeight: '500',
    }
    
    switch (data.shape) {
      case 'rectangle':
        return {
          ...baseStyle,
          borderRadius: '4px',
          minWidth: '120px',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      case 'circle':
        return {
          ...baseStyle,
          borderRadius: '50%',
          width: '100px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center' as const,
        }
      case 'diamond':
        return {
          ...baseStyle,
          transform: 'rotate(45deg)',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      default:
        return baseStyle
    }
  }

  const innerContent = isEditing ? (
    <input
      type="text"
      value={label}
      onChange={(e) => setLabel(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      className="bg-transparent border-none outline-none text-center w-full"
      style={{ transform: data.shape === 'diamond' ? 'rotate(-45deg)' : 'none' }}
      autoFocus
    />
  ) : (
    <div
      onDoubleClick={handleDoubleClick}
      style={{ transform: data.shape === 'diamond' ? 'rotate(-45deg)' : 'none' }}
    >
      {label}
    </div>
  )

  if (data.shape === 'diamond') {
    // Diamond is 80x80 and rotated 45 degrees
    // Handles need to be positioned on the diamond's vertices
    return (
      <div style={getNodeStyle()} onContextMenu={handleContextMenu}>
        {/* Top vertex */}
        <Handle 
          type="target" 
          position={Position.Top}
          style={{ 
            top: '-5px',
          }}
        />
        {innerContent}
        {/* Left vertex */}
        <Handle 
          type="source" 
          position={Position.Left}
          style={{ 
            left: '-5px',
          }}
          id="source-left"
        />
        {/* Right vertex */}
        <Handle 
          type="source" 
          position={Position.Right}
          style={{ 
            right: '-5px',
          }}
          id="source-right"
        />
      </div>
    )
  }

  return (
    <div style={getNodeStyle()} onContextMenu={handleContextMenu}>
      <Handle type="target" position={Position.Top} />
      {innerContent}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})

CustomNode.displayName = 'CustomNode'

export default CustomNode