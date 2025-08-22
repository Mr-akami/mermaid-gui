import { ReactNode } from 'react'
import { Provider as JotaiProvider } from 'jotai'
import { ReactFlowProvider } from '@xyflow/react'
import { BaseEditorProps } from './types'

interface BaseEditorWrapperProps extends BaseEditorProps {
  children: ReactNode
}

export function BaseEditor({ diagramType, children }: BaseEditorWrapperProps) {
  return (
    <JotaiProvider>
      <ReactFlowProvider>
        <div className="h-screen w-full" data-diagram-type={diagramType}>
          {children}
        </div>
      </ReactFlowProvider>
    </JotaiProvider>
  )
}