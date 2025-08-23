export type DiagramType = 'flowchart' | 'sequence' | 'class' | 'state'

export interface BaseEditorProps {
  diagramType: DiagramType
}

export interface EditorContainerProps {
  diagramType: DiagramType
}