import { useAtomValue, useSetAtom } from 'jotai'
import { diagramTypeAtom } from '@/store/diagramStore'
import { nodesAtom, edgesAtom } from '@/store/flowStore'
import { useState } from 'react'
import Tooltip from './ui/Tooltip'
import ControlPanel from './ui/ControlPanel'
import { 
  RiSubtractLine,
  RiMoreLine,
  RiStopLine,
  RiCheckboxLine,
  RiStopCircleLine,
  RiContrastLine,
  RiCheckLine
} from 'react-icons/ri'

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

  const relationshipTypes = [
    { value: 'identifying', label: 'Identifying Relationship (--)', icon: <RiSubtractLine className="w-4 h-4" /> },
    { value: 'non-identifying', label: 'Non-identifying Relationship (..)', icon: <RiMoreLine className="w-4 h-4" /> },
  ]

  const cardinalityOptions = [
    { value: '0..1', label: 'Zero or One (|o)', icon: <RiStopLine className="w-4 h-4" /> },
    { value: '1..1', label: 'Exactly One (||)', icon: <RiCheckboxLine className="w-4 h-4" /> },
    { value: '0..*', label: 'Zero or More (}o)', icon: <RiStopCircleLine className="w-4 h-4" /> },
    { value: '1..*', label: 'One or More (}|)', icon: <RiContrastLine className="w-4 h-4" /> }
  ]

  return (
    <ControlPanel title="ER Controls" size="md">
      <div className="flex flex-col gap-2">
        {/* Relationship Type Selector */}
        <div className="grid grid-cols-2 gap-1">
          {relationshipTypes.map((type) => (
            <Tooltip key={type.value} content={type.label}>
              <button
                onClick={() => setSelectedRelationType(type.value as any)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  selectedRelationType === type.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {type.icon}
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Source Cardinality */}
        <div className="grid grid-cols-4 gap-1">
          {cardinalityOptions.map((option) => (
            <Tooltip key={`source-${option.value}`} content={`Source: ${option.label}`}>
              <button
                onClick={() => setSelectedSourceCardinality(option.value as any)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  selectedSourceCardinality === option.value
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {option.icon}
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Target Cardinality */}
        <div className="grid grid-cols-4 gap-1">
          {cardinalityOptions.map((option) => (
            <Tooltip key={`target-${option.value}`} content={`Target: ${option.label}`}>
              <button
                onClick={() => setSelectedTargetCardinality(option.value as any)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  selectedTargetCardinality === option.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {option.icon}
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Apply Button */}
        <Tooltip content={`Apply relationship settings to selected entities (${selectedNodes.length})`}>
          <button
            onClick={applyRelationSettings}
            disabled={selectedNodes.length === 0}
            className={`w-full h-8 flex items-center justify-center rounded transition-colors ${
              selectedNodes.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <RiCheckLine className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </ControlPanel>
  )
}

export default ERControls