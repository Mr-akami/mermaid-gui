import { useAtomValue } from 'jotai'
import { mermaidCodeAtom } from '@/store/flowStore'
import { diagramTypeAtom } from '@/store/diagramStore'
import { useState } from 'react'

const MermaidPanel = () => {
  const mermaidCode = useAtomValue(mermaidCodeAtom)
  const diagramType = useAtomValue(diagramTypeAtom)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mermaidCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    const blob = new Blob([mermaidCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mermaid-${diagramType}-${new Date().toISOString().slice(0, 10)}.mmd`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Mermaid Code
        </h2>
        {mermaidCode && (
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 p-4 overflow-auto bg-gray-50">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg h-full overflow-auto font-mono text-sm">
          <code>{mermaidCode || '// No diagram created yet\n// Add shapes from the toolbar to start'}</code>
        </pre>
      </div>
    </div>
  )
}

export default MermaidPanel