import { useState, useCallback, lazy, Suspense } from 'react'
import { BaseEditor } from './BaseEditor'
import { EditorContainerProps } from './types'
import { Resizer } from './Resizer'
import { CodeEditor } from '../code/CodeEditor'

// Lazy load diagram-specific editors
const FlowchartEditor = lazy(() => 
  import('../../flowchart/editor').then(module => ({ default: module.FlowchartEditor }))
)

// Future diagram types can be added here
// const SequenceEditor = lazy(() => import('../../sequence/editor').then(module => ({ default: module.SequenceEditor })))
// const ClassEditor = lazy(() => import('../../class/editor').then(module => ({ default: module.ClassEditor })))

export function EditorContainer({ diagramType }: EditorContainerProps) {
  const [editorWidth, setEditorWidth] = useState(50) // percentage
  
  const handleResize = useCallback((delta: number) => {
    setEditorWidth(prevWidth => {
      const newWidth = prevWidth + (delta / window.innerWidth) * 100
      // Constrain between 20% and 80%
      return Math.min(80, Math.max(20, newWidth))
    })
  }, [])

  const renderDiagramEditor = () => {
    switch (diagramType) {
      case 'flowchart':
        return <FlowchartEditor />
      // Future diagram types
      // case 'sequence':
      //   return <SequenceEditor />
      // case 'class':
      //   return <ClassEditor />
      default:
        return <div>Unsupported diagram type: {diagramType}</div>
    }
  }

  return (
    <BaseEditor diagramType={diagramType}>
      <div className="flex h-full">
        <div style={{ width: `${editorWidth}%` }}>
          <Suspense fallback={<div className="p-4">Loading editor...</div>}>
            {renderDiagramEditor()}
          </Suspense>
        </div>
        <Resizer onResize={handleResize} />
        <div style={{ width: `${100 - editorWidth}%` }}>
          <CodeEditor diagramType={diagramType} />
        </div>
      </div>
    </BaseEditor>
  )
}