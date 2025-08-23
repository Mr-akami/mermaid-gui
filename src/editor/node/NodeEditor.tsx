import { EditorContainer } from '../common/EditorContainer'

export function NodeEditor() {
  // Default to sequence diagram
  return <EditorContainer diagramType="sequence" />
}