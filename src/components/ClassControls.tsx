import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { edgesAtom, nodesAtom } from '@/store/flowStore'
import { diagramTypeAtom } from '@/store/diagramStore'
import { ClassEdge, ClassNode } from '@/types/diagram'
import Tooltip from './ui/Tooltip'
import ControlPanel from './ui/ControlPanel'
import { 
  RiArrowRightLine,
  RiMoreLine,
  RiShapeLine,
  RiContrastLine,
  RiArrowUpLine,
  RiCheckLine,
  RiCodeBoxLine,
  RiFileList3Line,
  RiHashtag,
  RiStopLine
} from 'react-icons/ri'

const ClassControls = () => {
  const [selectedRelationType, setSelectedRelationType] = useState<ClassEdge['data']['relationType']>('association')
  const [selectedStereotype, setSelectedStereotype] = useState<ClassNode['data']['stereotype']>()
  const setEdges = useSetAtom(edgesAtom)
  const setNodes = useSetAtom(nodesAtom)
  const diagramType = useAtomValue(diagramTypeAtom)

  if (diagramType !== 'class') {
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
                relationType: selectedRelationType,
              },
            }
          : edge
      )
    )
  }

  const updateSelectedNodes = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.selected
          ? {
              ...node,
              data: {
                ...node.data,
                stereotype: selectedStereotype,
              },
            }
          : node
      )
    )
  }

  const relationshipTypes = [
    { value: 'inheritance', label: 'Inheritance (--|>)', icon: <RiArrowUpLine className="w-4 h-4" /> },
    { value: 'composition', label: 'Composition (*--)', icon: <RiContrastLine className="w-4 h-4" /> },
    { value: 'aggregation', label: 'Aggregation (o--)', icon: <RiStopLine className="w-4 h-4" /> },
    { value: 'association', label: 'Association (-->)', icon: <RiArrowRightLine className="w-4 h-4" /> },
    { value: 'dependency', label: 'Dependency (..>)', icon: <RiMoreLine className="w-4 h-4" /> },
    { value: 'realization', label: 'Realization (..|>)', icon: <RiShapeLine className="w-4 h-4" /> },
  ]

  const stereotypes = [
    { value: undefined, label: 'None', icon: <RiStopLine className="w-4 h-4" /> },
    { value: 'interface', label: 'Interface', icon: <RiCodeBoxLine className="w-4 h-4" /> },
    { value: 'abstract', label: 'Abstract', icon: <RiFileList3Line className="w-4 h-4" /> },
    { value: 'enumeration', label: 'Enumeration', icon: <RiHashtag className="w-4 h-4" /> },
  ]

  return (
    <ControlPanel title="Class Controls" size="md">
      <div className="flex flex-col gap-2">
        {/* Relationship Type Selector */}
        <div className="grid grid-cols-3 gap-1">
          {relationshipTypes.map((type) => (
            <Tooltip key={type.value} content={type.label}>
              <button
                onClick={() => setSelectedRelationType(type.value as ClassEdge['data']['relationType'])}
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

        {/* Apply button for relationships */}
        <Tooltip content="Apply relationship type to selected edges">
          <button
            onClick={updateSelectedEdges}
            className="w-full h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <RiCheckLine className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Stereotype Selector */}
        <div className="grid grid-cols-2 gap-1">
          {stereotypes.map((stereotype) => (
            <Tooltip key={stereotype.value || 'none'} content={stereotype.label}>
              <button
                onClick={() => setSelectedStereotype(stereotype.value as ClassNode['data']['stereotype'])}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  selectedStereotype === stereotype.value
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {stereotype.icon}
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Apply button for stereotypes */}
        <Tooltip content="Apply stereotype to selected classes">
          <button
            onClick={updateSelectedNodes}
            className="w-full h-8 flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <RiCheckLine className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </ControlPanel>
  )
}

export default ClassControls