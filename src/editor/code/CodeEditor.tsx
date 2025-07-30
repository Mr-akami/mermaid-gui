import { useAtomValue, useAtom } from 'jotai'
import { useState, useCallback, useEffect, useRef } from 'react'
import { mermaidCodeAtom, nodesAtom, edgesAtom } from '../../flowchart'
import { parseFlowchart } from '../../core/mermaid-parser/flowchartParser'

export function CodeEditor() {
  const mermaidCode = useAtomValue(mermaidCodeAtom)
  const [, setNodes] = useAtom(nodesAtom)
  const [, setEdges] = useAtom(edgesAtom)
  const [editableCode, setEditableCode] = useState(mermaidCode)
  const [error, setError] = useState<string | null>(null)
  const isEditingRef = useRef(false)

  // Update editable code when mermaid code changes (only if not currently editing)
  useEffect(() => {
    if (!isEditingRef.current) {
      setEditableCode(mermaidCode)
    }
  }, [mermaidCode])

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    isEditingRef.current = true
    setEditableCode(newCode)
    
    // Try to parse and update the flowchart
    const result = parseFlowchart(newCode)
    if (result.success && result.data) {
      setNodes(result.data.nodes)
      setEdges(result.data.edges)
      setError(null)
    } else {
      setError(result.error || 'Failed to parse mermaid code')
    }
  }, [setNodes, setEdges])

  const handleFocus = useCallback(() => {
    isEditingRef.current = true
  }, [])

  const handleBlur = useCallback(() => {
    isEditingRef.current = false
  }, [])

  return (
    <div className="h-full w-full bg-gray-50 border-l border-gray-200">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Mermaid Code</h2>
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
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
            placeholder="flowchart TD
    A[Start] --> B[Process]
    B --> C[End]"
          />
        </div>
      </div>
    </div>
  )
}