import { useAtomValue, useSetAtom } from 'jotai'
import { diagramTypeAtom } from '@/store/diagramStore'
import { nodesAtom, edgesAtom } from '@/store/flowStore'
import { useState } from 'react'
import Tooltip from './ui/Tooltip'
import ControlPanel from './ui/ControlPanel'
import { 
  RiArrowRightLine,
  RiArrowLeftRightLine,
  RiLoginBoxLine,
  RiLogoutBoxLine,
  RiCheckLine,
  RiFolderLine
} from 'react-icons/ri'

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

  const transitionTypes = [
    { value: 'normal', label: 'Normal Transition', icon: <RiArrowRightLine className="w-4 h-4" /> },
    { value: 'internal', label: 'Internal Transition', icon: <RiArrowLeftRightLine className="w-4 h-4" /> },
    { value: 'entry', label: 'Entry Transition', icon: <RiLoginBoxLine className="w-4 h-4" /> },
    { value: 'exit', label: 'Exit Transition', icon: <RiLogoutBoxLine className="w-4 h-4" /> },
  ]

  return (
    <ControlPanel title="State Controls" size="sm">
      <div className="flex flex-col gap-2">
        {/* Transition Type Selector */}
        <div className="grid grid-cols-2 gap-1">
          {transitionTypes.map((type) => (
            <Tooltip key={type.value} content={type.label}>
              <button
                onClick={() => setSelectedTransitionType(type.value as any)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  selectedTransitionType === type.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {type.icon}
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Apply transition type */}
        <Tooltip content={`Apply transition type to selected nodes (${selectedNodes.length})`}>
          <button
            onClick={applyTransitionType}
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

        {/* Composite State Toggle */}
        <Tooltip content="Toggle composite state for selected states">
          <button
            onClick={toggleCompositeState}
            disabled={selectedNodes.length === 0 || !selectedNodes.some(node => node.type === 'state' && node.data.type === 'state')}
            className={`w-full h-8 flex items-center justify-center rounded transition-colors ${
              selectedNodes.length === 0 || !selectedNodes.some(node => node.type === 'state' && node.data.type === 'state')
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            <RiFolderLine className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </ControlPanel>
  )
}

export default StateControls