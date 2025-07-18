import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  editorCodeAtom,
  parseErrorAtom,
  applyCodeToFlowchartAtom,
  mermaidCodeAtom,
} from './atoms'
import { useEffect, useRef } from 'react'

export function CodeEditor() {
  const [editorCode, setEditorCode] = useAtom(editorCodeAtom)
  const mermaidCode = useAtomValue(mermaidCodeAtom)
  const parseError = useAtomValue(parseErrorAtom)
  const applyCode = useSetAtom(applyCodeToFlowchartAtom)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const isUserTyping = useRef(false)

  // Sync from GUI to code when GUI changes
  useEffect(() => {
    if (!isUserTyping.current) {
      setEditorCode(mermaidCode)
    }
  }, [mermaidCode, setEditorCode])

  // Handle code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    isUserTyping.current = true
    setEditorCode(e.target.value)

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Debounce parsing
    timerRef.current = setTimeout(() => {
      applyCode()
      isUserTyping.current = false
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
    </div>
  )
}
