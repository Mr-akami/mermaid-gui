import { useAtomValue, useAtom, useSetAtom } from 'jotai'
import { useState, useCallback, useEffect, useRef } from 'react'
import { mermaidCodeAtom, nodesAtom, edgesAtom, layoutDirectionAtom, updateLayoutDirectionAtom, parseFlowchartCode } from '../../flowchart'

export function CodeEditor() {
  const mermaidCode = useAtomValue(mermaidCodeAtom)
  const layoutDirection = useAtomValue(layoutDirectionAtom)
  const [, setNodes] = useAtom(nodesAtom)
  const [, setEdges] = useAtom(edgesAtom)
  const setLayoutDirection = useSetAtom(layoutDirectionAtom)
  const updateLayoutDirection = useSetAtom(updateLayoutDirectionAtom)
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
    try {
      const result = parseFlowchartCode(newCode)
      if (result && result.nodes && result.edges) {
        // Update layout direction from parsed code and normalize TB to TD, DT to BT
        const parsedDirection = result.direction || 'TD'
        const normalizedDirection = parsedDirection === 'TB' ? 'TD' : 
                                   parsedDirection === 'DT' ? 'BT' : 
                                   parsedDirection as 'TD' | 'LR' | 'RL' | 'BT'
        
        // Set nodes and edges first
        setNodes(result.nodes)
        setEdges(result.edges)
        setError(null)
        
        // Then update layout direction which will also update edge handles
        updateLayoutDirection(normalizedDirection)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse mermaid code')
    }
  }, [setNodes, setEdges, updateLayoutDirection])

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