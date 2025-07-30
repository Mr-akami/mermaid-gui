import { ReactFlowProvider } from './deps'
import { Provider as JotaiProvider } from 'jotai'
import { NodeEditorCore } from './NodeEditorCore'

export function NodeEditor() {
  return (
    <JotaiProvider>
      <ReactFlowProvider>
        <NodeEditorCore />
      </ReactFlowProvider>
    </JotaiProvider>
  )
}