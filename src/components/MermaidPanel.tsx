import { useAtomValue, useSetAtom } from 'jotai'
import { mermaidCodeAtom, nodesAtom, edgesAtom } from '@/store/flowStore'
import { diagramTypeAtom } from '@/store/diagramStore'
import { useState, useCallback, useEffect, useRef } from 'react'
import { MermaidImportButton } from './MermaidImportButton'
import { LayoutButton } from './LayoutButton'
import { parseFlowchartCode } from '@/core/parsers/flowchartParser'
import { layoutNodes } from '@/core/layout/layoutEngine'
import { Node, Edge } from 'reactflow'

const MermaidPanel = () => {
  const mermaidCode = useAtomValue(mermaidCodeAtom)
  const diagramType = useAtomValue(diagramTypeAtom)
  const setNodes = useSetAtom(nodesAtom)
  const setEdges = useSetAtom(edgesAtom)
  const [copied, setCopied] = useState(false)
  const [editableCode, setEditableCode] = useState(mermaidCode)
  const [parseError, setParseError] = useState<string | null>(null)
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editableCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    const blob = new Blob([editableCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mermaid-${diagramType}-${new Date().toISOString().slice(0, 10)}.mmd`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Update editable code when mermaidCode changes from graph
  useEffect(() => {
    setEditableCode(mermaidCode)
  }, [mermaidCode])

  // Parse and update graph when code changes
  const updateGraphFromCode = useCallback((code: string) => {
    if (diagramType !== 'flowchart') {
      setParseError('Only flowchart diagrams can be parsed currently')
      return
    }

    try {
      // Parse the Mermaid code
      const parsed = parseFlowchartCode(code)
      
      // Convert parsed nodes to layout engine format
      const layoutInput = parsed.nodes.map(node => ({
        id: node.id,
        width: 150,
        height: 50,
      }))

      // Convert parsed edges to layout engine format
      const layoutEdges = parsed.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      }))

      // Apply layout algorithm
      const layoutResult = layoutNodes(layoutInput, layoutEdges, {
        direction: parsed.direction,
        nodeSpacing: 50,
        rankSpacing: 100,
      })

      // Convert to React Flow nodes
      const flowNodes: Node[] = parsed.nodes.map(node => {
        const layout = layoutResult.find(l => l.id === node.id)
        return {
          id: node.id,
          type: 'flowchart',
          position: layout ? { x: layout.x, y: layout.y } : { x: 0, y: 0 },
          data: {
            label: node.label,
            shape: node.shape === 'double-circle' ? 'doubleCircle' : node.shape,
          },
        }
      })

      // Convert to React Flow edges
      const flowEdges: Edge[] = parsed.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'flowchart',
        data: {
          label: edge.label || '',
          style: edge.style,
        },
      }))

      // Update the flow
      setNodes(flowNodes)
      setEdges(flowEdges)
      setParseError(null)
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse code')
    }
  }, [diagramType, setNodes, setEdges])

  // Handle code changes with debouncing
  const handleCodeChange = useCallback((value: string) => {
    setEditableCode(value)
    
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    // Set new timeout for updating graph
    updateTimeoutRef.current = setTimeout(() => {
      updateGraphFromCode(value)
    }, 500) // 500ms debounce
  }, [updateGraphFromCode])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Mermaid Code
        </h2>
        <div className="flex space-x-2">
          {diagramType === 'flowchart' && (
            <>
              <MermaidImportButton />
              <LayoutButton />
            </>
          )}
          {mermaidCode && (
            <>
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
            </>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col p-4 bg-gray-50">
        {parseError && diagramType === 'flowchart' && (
          <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {parseError}
          </div>
        )}
        <textarea
          value={editableCode || '// No diagram created yet\n// Add shapes from the toolbar to start'}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="flex-1 bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Mermaid code here..."
          spellCheck={false}
        />
      </div>
    </div>
  )
}

export default MermaidPanel