import { ReactFlowProvider } from './deps'
import { NodeEditorCore } from './NodeEditorCore'

export function NodeEditor() {
  return (
    <ReactFlowProvider>
      <NodeEditorCore />
    </ReactFlowProvider>
  )
}