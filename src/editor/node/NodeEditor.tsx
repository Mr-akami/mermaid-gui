import { ReactFlowProvider } from './deps'
import { Provider as JotaiProvider } from 'jotai'
import { NodeEditorCore } from './NodeEditorCore'
import { CodeEditor } from '../code'

export function NodeEditor() {
  return (
    <JotaiProvider>
      <ReactFlowProvider>
        <div className="flex h-screen">
          <div className="flex-1">
            <NodeEditorCore />
          </div>
          <div className="w-1/2">
            <CodeEditor />
          </div>
        </div>
      </ReactFlowProvider>
    </JotaiProvider>
  )
}