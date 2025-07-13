import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { edgesAtom } from '@/store/flowStore'
import { diagramTypeAtom } from '@/store/diagramStore'
import { SequenceEdge } from '@/types/diagram'
import Tooltip from './ui/Tooltip'
import ControlPanel from './ui/ControlPanel'
import { 
  RiArrowRightLine, 
  RiMoreLine, 
  RiArrowLeftRightLine,
  RiCloseLine,
  RiCheckLine,
  RiHashtag,
  RiPlayFill
} from 'react-icons/ri'

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
    { value: 'solid', label: 'Solid Line (→)', icon: <RiArrowRightLine className="w-4 h-4" /> },
    { value: 'dotted', label: 'Dotted Line (⋯)', icon: <RiMoreLine className="w-4 h-4" /> },
    { value: 'solidArrow', label: 'Solid Arrow (→)', icon: <RiArrowRightLine className="w-4 h-4" /> },
    { value: 'dottedArrow', label: 'Dotted Arrow (⋯→)', icon: <RiMoreLine className="w-4 h-4" /> },
    { value: 'cross', label: 'Cross End (×)', icon: <RiCloseLine className="w-4 h-4" /> },
    { value: 'async', label: 'Async (↗)', icon: <RiArrowRightLine className="w-4 h-4 transform rotate-45" /> },
    { value: 'bidirectional', label: 'Bidirectional (↔)', icon: <RiArrowLeftRightLine className="w-4 h-4" /> },
  ]


  return (
    <ControlPanel title="Sequence Controls" size="md">
      <div className="flex flex-col gap-2">
        {/* Message type selection grid */}
        <div className="grid grid-cols-4 gap-1">
          {messageTypes.slice(0, 4).map((type) => (
            <Tooltip key={type.value} content={type.label}>
              <button
                onClick={() => setSelectedMessageType(type.value as SequenceEdge['data']['messageType'])}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  selectedMessageType === type.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {type.icon}
              </button>
            </Tooltip>
          ))}
        </div>
        
        {/* Second row of message types */}
        <div className="grid grid-cols-3 gap-1">
          {messageTypes.slice(4).map((type) => (
            <Tooltip key={type.value} content={type.label}>
              <button
                onClick={() => setSelectedMessageType(type.value as SequenceEdge['data']['messageType'])}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  selectedMessageType === type.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {type.icon}
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Toggle buttons */}
        <div className="flex gap-1">
          <Tooltip content={addSequenceNumbers ? "Remove Sequence Numbers" : "Add Sequence Numbers"}>
            <button
              onClick={() => setAddSequenceNumbers(!addSequenceNumbers)}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                addSequenceNumbers
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <RiHashtag className="w-4 h-4" />
            </button>
          </Tooltip>
          
          <Tooltip content={addActivation ? "Remove Activation Box" : "Add Activation Box"}>
            <button
              onClick={() => setAddActivation(!addActivation)}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                addActivation
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <RiPlayFill className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* Apply button */}
        <Tooltip content="Apply settings to selected messages">
          <button
            onClick={updateSelectedEdges}
            className="w-full h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <RiCheckLine className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </ControlPanel>
  )
}

export default SequenceControls