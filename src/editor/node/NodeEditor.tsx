import { ReactFlowProvider } from './deps'
import { Provider as JotaiProvider } from 'jotai'
import { NodeEditorCore } from './NodeEditorCore'
import { CodeEditor } from '../code'
import { Resizer } from './Resizer'
import { useState, useCallback } from 'react'

export function NodeEditor() {
  const [editorWidth, setEditorWidth] = useState(50) // percentage
  
  const handleResize = useCallback((delta: number) => {
    setEditorWidth(prevWidth => {
      const newWidth = prevWidth + (delta / window.innerWidth) * 100
      // Constrain between 20% and 80%
      return Math.min(80, Math.max(20, newWidth))
    })
  }, [])

  return (
    <JotaiProvider>
      <ReactFlowProvider>
        <div className="flex h-screen">
          <div style={{ width: `${editorWidth}%` }}>
            <NodeEditorCore />
          </div>
          <Resizer onResize={handleResize} />
          <div style={{ width: `${100 - editorWidth}%` }}>
            <CodeEditor />
          </div>
        </div>
      </ReactFlowProvider>
    </JotaiProvider>
  )
}