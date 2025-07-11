import { useAtom, useAtomValue } from 'jotai'
import { diagramTypeAtom, diagramTypeClearEffectAtom, diagramTypes } from '@/store/diagramStore'

const DiagramTypeSelector = () => {
  const diagramType = useAtomValue(diagramTypeAtom)
  const [, setDiagramType] = useAtom(diagramTypeClearEffectAtom)

  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border-b border-gray-200">
      <span className="text-sm font-medium text-gray-700">Diagram Type:</span>
      <select
        value={diagramType}
        onChange={(e) => setDiagramType(e.target.value as any)}
        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {diagramTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.icon} {type.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default DiagramTypeSelector