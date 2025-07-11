import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { edgesAtom, nodesAtom } from '@/store/flowStore'
import { diagramTypeAtom } from '@/store/diagramStore'
import { ClassEdge, ClassNode } from '@/types/diagram'

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
    { value: 'inheritance', label: 'Inheritance (--|>)', icon: '◁', description: 'Is-a relationship' },
    { value: 'composition', label: 'Composition (*--)', icon: '♦', description: 'Strong has-a' },
    { value: 'aggregation', label: 'Aggregation (o--)', icon: '◇', description: 'Weak has-a' },
    { value: 'association', label: 'Association (-->)', icon: '→', description: 'Uses-a' },
    { value: 'dependency', label: 'Dependency (..>)', icon: '⋯→', description: 'Depends-on' },
    { value: 'realization', label: 'Realization (..|>)', icon: '⋯◁', description: 'Implements' },
  ]

  const stereotypes = [
    { value: undefined, label: 'None' },
    { value: 'interface', label: 'Interface' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'enumeration', label: 'Enumeration' },
  ]

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
        Class Diagram Controls
      </div>
      
      <div className="space-y-4">
        {/* Relationship Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship Type:
          </label>
          <select
            value={selectedRelationType || 'association'}
            onChange={(e) => setSelectedRelationType(e.target.value as ClassEdge['data']['relationType'])}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {relationshipTypes.map((type) => (
              <option key={type.value} value={type.value} title={type.description}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          <button
            onClick={updateSelectedEdges}
            className="w-full mt-2 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Apply to Selected Relations
          </button>
        </div>

        {/* Stereotypes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Stereotype:
          </label>
          <select
            value={selectedStereotype || ''}
            onChange={(e) => setSelectedStereotype(e.target.value as ClassNode['data']['stereotype'] || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {stereotypes.map((stereotype) => (
              <option key={stereotype.value || 'none'} value={stereotype.value || ''}>
                {stereotype.label}
              </option>
            ))}
          </select>
          <button
            onClick={updateSelectedNodes}
            className="w-full mt-2 px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Apply to Selected Classes
          </button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div><strong>Usage:</strong></div>
          <div>• Select edges and apply relationship types</div>
          <div>• Select classes and apply stereotypes</div>
          <div>• Double-click class names to edit</div>
          <div>• Add attributes/methods with input fields</div>
          <div>• Format: [+/-/#/~] name: type [static]</div>
        </div>
      </div>
    </div>
  )
}

export default ClassControls