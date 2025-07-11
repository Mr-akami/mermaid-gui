import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { edgesAtom } from '@/store/flowStore'
import { diagramTypeAtom } from '@/store/diagramStore'
import { FlowchartEdge } from '@/types/diagram'

const EdgeStyleSelector = () => {
  const [selectedStyle, setSelectedStyle] = useState<FlowchartEdge['data']['style']>('solid')
  const [hasArrow, setHasArrow] = useState(true)
  const setEdges = useSetAtom(edgesAtom)
  const diagramType = useAtomValue(diagramTypeAtom)

  if (diagramType !== 'flowchart') {
    return null
  }

  const updateSelectedEdges = () => {
    setEdges((edges) =>
      edges.map((edge) =>
        edge.selected
          ? {
              ...edge,
              data: {
                ...edge.data,
                style: selectedStyle,
                hasArrow: hasArrow,
              },
            }
          : edge
      )
    )
  }

  return (
    <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
        Edge Style
      </div>
      <div className="space-y-2">
        <div>
          <label className="text-sm text-gray-700">Style:</label>
          <select
            value={selectedStyle || 'solid'}
            onChange={(e) => setSelectedStyle(e.target.value as FlowchartEdge['data']['style'])}
            className="ml-2 px-2 py-1 text-sm border rounded"
          >
            <option value="solid">Solid (→)</option>
            <option value="dotted">Dotted (-.-&gt;)</option>
            <option value="thick">Thick (==&gt;)</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-700">
            <input
              type="checkbox"
              checked={hasArrow}
              onChange={(e) => setHasArrow(e.target.checked)}
              className="mr-2"
            />
            Show Arrow
          </label>
        </div>
        <button
          onClick={updateSelectedEdges}
          className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Apply to Selected
        </button>
        <div className="text-xs text-gray-500 mt-2">
          Select edges and apply style
        </div>
      </div>
    </div>
  )
}

export default EdgeStyleSelector