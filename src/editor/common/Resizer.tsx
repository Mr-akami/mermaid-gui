import { useCallback, useRef } from 'react'

interface ResizerProps {
  onResize: (delta: number) => void
}

export function Resizer({ onResize }: ResizerProps) {
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    startXRef.current = e.clientX
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      
      const delta = e.clientX - startXRef.current
      startXRef.current = e.clientX
      onResize(delta)
    }
    
    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.body.style.userSelect = ''
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [onResize])

  return (
    <div
      data-testid="resizer-handle"
      className="w-2 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex-shrink-0 transition-colors"
      onMouseDown={handleMouseDown}
    />
  )
}