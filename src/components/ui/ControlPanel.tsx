import { ReactNode } from 'react'

interface ControlPanelProps {
  title?: string
  children: ReactNode
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const ControlPanel = ({ 
  title, 
  children, 
  position = 'top-left', 
  size = 'md',
  className = '' 
}: ControlPanelProps) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  }

  const sizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md'
  }

  return (
    <div 
      className={`absolute z-10 bg-white rounded-lg shadow-lg p-3 ${positionClasses[position]} ${sizeClasses[size]} ${className}`}
    >
      {title && (
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 text-center">
          {title}
        </div>
      )}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

export default ControlPanel