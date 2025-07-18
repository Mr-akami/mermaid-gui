import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  editorCodeAtom,
  parseErrorAtom,
  applyCodeToFlowchartAtom,
  syncWithFlowchartAtom,
} from './atoms'
import { autoSyncEnabledAtom } from './atoms'
import { useEffect, useRef } from 'react'

export function CodeEditor() {
  const [editorCode, setEditorCode] = useAtom(editorCodeAtom)
  const parseError = useAtomValue(parseErrorAtom)
  const applyCode = useSetAtom(applyCodeToFlowchartAtom)
  const syncWithFlowchart = useSetAtom(syncWithFlowchartAtom)
  const autoSyncEnabled = useAtomValue(autoSyncEnabledAtom)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<NodeJS.Timeout>()

  // Initial sync on mount
  useEffect(() => {
    syncWithFlowchart()

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // Handle code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorCode(e.target.value)

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Debounce parsing
    timerRef.current = setTimeout(() => {
      applyCode()
    }, 500)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
        <h2 className="text-sm font-medium text-gray-200">Mermaid Code</h2>
      </div>

      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={editorCode}
          onChange={handleCodeChange}
          className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
          placeholder="flowchart TD
    A[Start]
    B[Process]
    C[End]
    A --> B
    B --> C"
        />

        {parseError && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-red-900/90 text-red-100 text-sm">
            <div className="font-medium mb-1">Parse Error:</div>
            <div>{parseError}</div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
        <button
          onClick={() => applyCode()}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Apply Changes
        </button>
        <button
          onClick={() => syncWithFlowchart()}
          className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600 transition-colors"
        >
          Sync from Diagram
        </button>
      </div>
    </div>
  )
}
