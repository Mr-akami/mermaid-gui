import { useAtomValue, useSetAtom } from 'jotai'
import { diagramTypeAtom } from '@/store/diagramStore'
import { nodesAtom, edgesAtom } from '@/store/flowStore'
import { useState } from 'react'

const ERControls = () => {
  const diagramType = useAtomValue(diagramTypeAtom)
  const nodes = useAtomValue(nodesAtom)
  const setEdges = useSetAtom(edgesAtom)
  const [selectedRelationType, setSelectedRelationType] = useState<'identifying' | 'non-identifying'>('identifying')
  const [selectedSourceCardinality, setSelectedSourceCardinality] = useState<'0..1' | '1..1' | '0..*' | '1..*'>('1..1')
  const [selectedTargetCardinality, setSelectedTargetCardinality] = useState<'0..1' | '1..1' | '0..*' | '1..*'>('1..1')

  if (diagramType !== 'er') return null

  const selectedNodes = nodes.filter(node => node.selected)

  const applyRelationSettings = () => {
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
              relationshipType: selectedRelationType,
              sourceCardinality: selectedSourceCardinality,
              targetCardinality: selectedTargetCardinality
            }
          }
        }
        return edge
      })
    )
  }

  const cardinalityOptions = [
    { value: '0..1', label: 'Zero or One (|o)' },
    { value: '1..1', label: 'Exactly One (||)' },
    { value: '0..*', label: 'Zero or More (}o)' },
    { value: '1..*', label: 'One or More (}|)' }
  ]

  return (
    <div className="absolute top-80 right-4 z-10 bg-white rounded-lg shadow-lg p-3 space-y-3">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
        ER Diagram Controls
      </div>

      {/* Relationship Type */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Relationship Type:</label>
        <select
          value={selectedRelationType}
          onChange={(e) => setSelectedRelationType(e.target.value as any)}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
        >
          <option value="identifying">Identifying (--)</option>
          <option value="non-identifying">Non-identifying (..)</option>
        </select>
      </div>

      {/* Source Cardinality */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Source Cardinality:</label>
        <select
          value={selectedSourceCardinality}
          onChange={(e) => setSelectedSourceCardinality(e.target.value as any)}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
        >
          {cardinalityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Target Cardinality */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Target Cardinality:</label>
        <select
          value={selectedTargetCardinality}
          onChange={(e) => setSelectedTargetCardinality(e.target.value as any)}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
        >
          {cardinalityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyRelationSettings}
        disabled={selectedNodes.length === 0}
        className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Apply to Selected ({selectedNodes.length})
      </button>

      {/* Entity Information */}
      <div className="text-xs text-gray-600 border-t pt-2">
        <div>Selected: {selectedNodes.length} entities</div>
        <div>
          Entities: {selectedNodes.filter(n => n.type === 'er').length}
        </div>
      </div>

      {/* Quick Add Templates */}
      <div className="space-y-2 border-t pt-2">
        <div className="text-xs font-medium text-gray-700">Quick Attributes:</div>
        <div className="grid grid-cols-1 gap-1">
          <button
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            onClick={() => {
              // This would be implemented to add common patterns to selected entities
            }}
          >
            + Standard ID (id int PK)
          </button>
          <button
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            onClick={() => {
              // Add timestamps
            }}
          >
            + Timestamps
          </button>
        </div>
      </div>
    </div>
  )
}

export default ERControls