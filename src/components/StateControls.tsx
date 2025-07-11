import { useAtomValue, useSetAtom } from 'jotai'
import { diagramTypeAtom } from '@/store/diagramStore'
import { nodesAtom, edgesAtom } from '@/store/flowStore'
import { useState } from 'react'

const StateControls = () => {
  const diagramType = useAtomValue(diagramTypeAtom)
  const nodes = useAtomValue(nodesAtom)
  const setNodes = useSetAtom(nodesAtom)
  const setEdges = useSetAtom(edgesAtom)
  const [selectedTransitionType, setSelectedTransitionType] = useState<'normal' | 'internal' | 'entry' | 'exit'>('normal')

  if (diagramType !== 'state') return null

  const selectedNodes = nodes.filter(node => node.selected)

  const applyTransitionType = () => {
    if (selectedNodes.length === 0) return

    setEdges((edges) =>
      edges.map((edge) => {
        const sourceSelected = selectedNodes.some(node => node.id === edge.source)
        const targetSelected = selectedNodes.some(node => node.id === edge.target)
        
        if (sourceSelected || targetSelected) {
          return {
            ...edge,
            data: {
              ...edge.data,
              transitionType: selectedTransitionType
            }
          }
        }
        return edge
      })
    )
  }

  const toggleCompositeState = () => {
    if (selectedNodes.length === 0) return

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.selected && node.type === 'state' && node.data.type === 'state') {
          return {
            ...node,
            data: {
              ...node.data,
              isComposite: !node.data.isComposite
            }
          }
        }
        return node
      })
    )
  }

  return (
    <div className="absolute top-64 right-4 z-10 bg-white rounded-lg shadow-lg p-3 space-y-3">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
        State Diagram Controls
      </div>

      {/* Transition Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Transition Type:</label>
        <select
          value={selectedTransitionType}
          onChange={(e) => setSelectedTransitionType(e.target.value as any)}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
        >
          <option value="normal">Normal</option>
          <option value="internal">Internal</option>
          <option value="entry">Entry</option>
          <option value="exit">Exit</option>
        </select>
        <button
          onClick={applyTransitionType}
          disabled={selectedNodes.length === 0}
          className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Apply to Selected ({selectedNodes.length})
        </button>
      </div>

      {/* Composite State Toggle */}
      <div className="space-y-2">
        <button
          onClick={toggleCompositeState}
          disabled={selectedNodes.length === 0 || !selectedNodes.some(node => node.type === 'state' && node.data.type === 'state')}
          className="w-full px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Toggle Composite State
        </button>
      </div>

      {/* State Information */}
      <div className="text-xs text-gray-600 border-t pt-2">
        <div>Selected: {selectedNodes.length} nodes</div>
        <div>
          States: {selectedNodes.filter(n => n.type === 'state' && n.data.type === 'state').length}
        </div>
        <div>
          Special: {selectedNodes.filter(n => n.type === 'state' && n.data.type !== 'state').length}
        </div>
      </div>
    </div>
  )
}

export default StateControls