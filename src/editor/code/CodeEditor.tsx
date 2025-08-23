import { useAtomValue, useAtom } from 'jotai'
import { useState, useCallback, useEffect, useRef } from 'react'
import { DiagramType } from '../common/types'
import { rawCodeAtom, diagramTypeAtom, isEditingAtom, parseErrorAtom } from '../atoms'

interface CodeEditorProps {
  diagramType: DiagramType
}

export function CodeEditor({ diagramType }: CodeEditorProps) {
  // Generic editor atoms
  const [rawCode, setRawCode] = useAtom(rawCodeAtom)
  const [, setDiagramType] = useAtom(diagramTypeAtom)
  const [, setIsEditing] = useAtom(isEditingAtom)
  const parseError = useAtomValue(parseErrorAtom)
  
  // Local state for editable code
  const [editableCode, setEditableCode] = useState(rawCode)
  const isEditingRef = useRef(false)

  // Set diagram type on mount
  useEffect(() => {
    setDiagramType(diagramType)
  }, [diagramType, setDiagramType])

  // Update editable code when raw code changes (only if not currently editing)
  useEffect(() => {
    if (!isEditingRef.current) {
      setEditableCode(rawCode)
    }
  }, [rawCode])

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    isEditingRef.current = true
    setEditableCode(newCode)
    setIsEditing(true)
    
    // Update raw code atom - parsing will be handled by diagram-specific atoms
    setRawCode(newCode)
  }, [setRawCode, setIsEditing])

  const handleFocus = useCallback(() => {
    isEditingRef.current = true
    setIsEditing(true)
  }, [setIsEditing])

  const handleBlur = useCallback(() => {
    isEditingRef.current = false
    setIsEditing(false)
  }, [setIsEditing])

  const getPlaceholder = () => {
    switch (diagramType) {
      case 'flowchart':
        return "flowchart TD\n    A[Start] --> B[Process]\n    B --> C[End]"
      case 'sequence':
        return "sequenceDiagram\n    Alice->>Bob: Hello Bob!\n    Bob-->>Alice: Hi Alice!"
      case 'class':
        return "classDiagram\n    class Animal\n    Animal : +String name\n    Animal : +void eat()"
      case 'state':
        return "stateDiagram-v2\n    [*] --> Still\n    Still --> Moving\n    Moving --> Still"
      default:
        return "// Enter your diagram code here"
    }
  }

  const getDiagramTitle = () => {
    return diagramType.charAt(0).toUpperCase() + diagramType.slice(1) + ' Code'
  }

  return (
    <div className="h-full w-full bg-gray-50 border-l border-gray-200">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            {getDiagramTitle()}
          </h2>
          {parseError && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {parseError}
            </div>
          )}
        </div>
        <div className="flex-1 p-4">
          <textarea
            className="w-full h-full font-mono text-sm border border-gray-300 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editableCode}
            onChange={handleCodeChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={getPlaceholder()}
          />
        </div>
      </div>
    </div>
  )
}