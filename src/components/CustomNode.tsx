import { memo, useState, useCallback, useRef } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { useSetAtom } from 'jotai'
import { nodesAtom } from '@/store/flowStore'

const CustomNode = memo(({ data, id }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label)
  const setNodes = useSetAtom(nodesAtom)
  const isComposingRef = useRef(false)
  
  // Reset label when not editing and data changes
  if (!isEditing && label !== data.label) {
    setLabel(data.label)
  }


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

  const renderShape = () => {
    const commonStyle = {
      backgroundColor: '#ffffff',
      border: '2px solid #374151',
      fontSize: '14px',
      fontWeight: '500' as const,
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
        autoFocus
      />
    ) : (
      <div onDoubleClick={handleDoubleClick}>
        {label}
      </div>
    )

    switch (data.shape) {
      case 'rectangle':
        return (
          <div
            style={{
              ...commonStyle,
              borderRadius: '4px',
              minWidth: '120px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            }}
            onContextMenu={handleContextMenu}
          >
            <Handle type="target" position={Position.Top} />
            {innerContent}
            <Handle type="source" position={Position.Bottom} />
          </div>
        )

      case 'roundedRectangle':
        return (
          <div
            style={{
              ...commonStyle,
              borderRadius: '20px',
              minWidth: '120px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            }}
            onContextMenu={handleContextMenu}
          >
            <Handle type="target" position={Position.Top} />
            {innerContent}
            <Handle type="source" position={Position.Bottom} />
          </div>
        )

      case 'stadium':
        return (
          <div
            style={{
              ...commonStyle,
              borderRadius: '25px',
              minWidth: '140px',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 20px',
            }}
            onContextMenu={handleContextMenu}
          >
            <Handle type="target" position={Position.Top} />
            {innerContent}
            <Handle type="source" position={Position.Bottom} />
          </div>
        )

      case 'subroutine':
        return (
          <div
            style={{
              ...commonStyle,
              minWidth: '120px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              position: 'relative',
            }}
            onContextMenu={handleContextMenu}
          >
            <div
              style={{
                position: 'absolute',
                left: '8px',
                top: '0',
                bottom: '0',
                width: '2px',
                backgroundColor: '#374151',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '8px',
                top: '0',
                bottom: '0',
                width: '2px',
                backgroundColor: '#374151',
              }}
            />
            <Handle type="target" position={Position.Top} />
            {innerContent}
            <Handle type="source" position={Position.Bottom} />
          </div>
        )

      case 'cylindrical':
        return (
          <div
            style={{
              ...commonStyle,
              borderRadius: '50%/20%',
              minWidth: '120px',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              position: 'relative',
            }}
            onContextMenu={handleContextMenu}
          >
            <Handle type="target" position={Position.Top} />
            {innerContent}
            <Handle type="source" position={Position.Bottom} />
          </div>
        )

      case 'circle':
        return (
          <div
            style={{
              ...commonStyle,
              borderRadius: '50%',
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
            onContextMenu={handleContextMenu}
          >
            <Handle type="target" position={Position.Top} />
            {innerContent}
            <Handle type="source" position={Position.Bottom} />
          </div>
        )

      case 'asymmetric':
        return (
          <div
            style={{
              ...commonStyle,
              borderRadius: '20px 0',
              minWidth: '120px',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            }}
            onContextMenu={handleContextMenu}
          >
            <Handle type="target" position={Position.Top} />
            {innerContent}
            <Handle type="source" position={Position.Bottom} />
          </div>
        )

      case 'rhombus':
        return (
          <div
            style={{
              ...commonStyle,
              transform: 'rotate(45deg)',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onContextMenu={handleContextMenu}
          >
            <Handle 
              type="target" 
              position={Position.Top}
              style={{ top: '-5px' }}
            />
            <div style={{ transform: 'rotate(-45deg)' }}>
              {innerContent}
            </div>
            <Handle 
              type="source" 
              position={Position.Left}
              style={{ left: '-5px' }}
              id="source-left"
            />
            <Handle 
              type="source" 
              position={Position.Right}
              style={{ right: '-5px' }}
              id="source-right"
            />
          </div>
        )

      case 'hexagon':
        return (
          <div
            style={{
              ...commonStyle,
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              minWidth: '140px',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            }}
            onContextMenu={handleContextMenu}
          >
            <Handle type="target" position={Position.Top} />
            {innerContent}
            <Handle type="source" position={Position.Bottom} />
          </div>
        )

      case 'parallelogram':
        return (
          <div
            style={{
              ...commonStyle,
              transform: 'skewX(-20deg)',
              minWidth: '140px',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            }}
            onContextMenu={handleContextMenu}
          >
            <Handle type="target" position={Position.Top} />
            <div style={{ transform: 'skewX(20deg)' }}>
              {innerContent}
            </div>
            <Handle type="source" position={Position.Bottom} />
          </div>
        )

      case 'trapezoid':
        return (
          <div
            style={{
              ...commonStyle,
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
              minWidth: '140px',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            }}
            onContextMenu={handleContextMenu}
          >
            <Handle type="target" position={Position.Top} />
            {innerContent}
            <Handle type="source" position={Position.Bottom} />
          </div>
        )

      case 'doubleCircle':
        return (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '2px solid #374151',
              borderRadius: '50%',
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            onContextMenu={handleContextMenu}
          >
            <div
              style={{
                position: 'absolute',
                border: '2px solid #374151',
                borderRadius: '50%',
                width: '90px',
                height: '90px',
              }}
            />
            <Handle type="target" position={Position.Top} />
            <div style={{ fontSize: '14px', fontWeight: '500', zIndex: 1 }}>
              {innerContent}
            </div>
            <Handle type="source" position={Position.Bottom} />
          </div>
        )

      default:
        return (
          <div
            style={{
              ...commonStyle,
              minWidth: '120px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            }}
            onContextMenu={handleContextMenu}
          >
            <Handle type="target" position={Position.Top} />
            {innerContent}
            <Handle type="source" position={Position.Bottom} />
          </div>
        )
    }
  }

  return renderShape()
})

CustomNode.displayName = 'CustomNode'

export default CustomNode