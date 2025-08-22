import { EditorContainer } from '../common/EditorContainer'

export function NodeEditor() {
  // Default to flowchart for now, can be made configurable later
  return <EditorContainer diagramType="flowchart" />
}