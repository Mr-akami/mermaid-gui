import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { edgesAtom } from '@/store/flowStore'
import { diagramTypeAtom } from '@/store/diagramStore'
import { SequenceEdge } from '@/types/diagram'

const SequenceControls = () => {
  const [selectedMessageType, setSelectedMessageType] = useState<SequenceEdge['data']['messageType']>('solid')
  const [addSequenceNumbers, setAddSequenceNumbers] = useState(false)
  const [addActivation, setAddActivation] = useState(false)
  const setEdges = useSetAtom(edgesAtom)
  const diagramType = useAtomValue(diagramTypeAtom)

  if (diagramType !== 'sequence') {
    return null
  }

  const updateSelectedEdges = () => {
    let sequenceCounter = 1
    
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.selected) {
          const updatedData = {
            ...edge.data,
            messageType: selectedMessageType,
            activate: addActivation,
            sequence: addSequenceNumbers ? sequenceCounter++ : undefined,
          }
          return { ...edge, data: updatedData }
        }
        return edge
      })
    )
  }

  const messageTypes = [
    { value: 'solid', label: 'Solid Line (→)', icon: '→' },
    { value: 'dotted', label: 'Dotted Line (-.)', icon: '⋯' },
    { value: 'solidArrow', label: 'Solid Arrow (→)', icon: '→' },
    { value: 'dottedArrow', label: 'Dotted Arrow (-→)', icon: '⋯→' },
    { value: 'cross', label: 'Cross End (-x)', icon: '×' },
    { value: 'async', label: 'Async (→)', icon: '⤴' },
    { value: 'bidirectional', label: 'Bidirectional (↔)', icon: '↔' },
  ]

  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
        Sequence Controls
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Type:
          </label>
          <select
            value={selectedMessageType || 'solid'}
            onChange={(e) => setSelectedMessageType(e.target.value as SequenceEdge['data']['messageType'])}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {messageTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={addSequenceNumbers}
              onChange={(e) => setAddSequenceNumbers(e.target.checked)}
              className="mr-2"
            />
            Add Sequence Numbers
          </label>
          
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={addActivation}
              onChange={(e) => setAddActivation(e.target.checked)}
              className="mr-2"
            />
            Add Activation Box
          </label>
        </div>

        <button
          onClick={updateSelectedEdges}
          className="w-full px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Apply to Selected Messages
        </button>
        
        <div className="text-xs text-gray-500 mt-2">
          Select message arrows and apply settings
        </div>
      </div>
    </div>
  )
}

export default SequenceControls