import { useAtom } from './deps'
import type { Node } from './deps'
import { selectedNodeTypeAtom } from './atoms'

const nodeTypes: Array<{ type: Node['type']; label: string; icon: string }> = [
  { type: 'rectangle', label: 'Rectangle', icon: '□' },
  { type: 'circle', label: 'Circle', icon: '○' },
  { type: 'diamond', label: 'Diamond', icon: '◇' },
  { type: 'subgraph', label: 'Subgraph', icon: '▢' },
]

export function Toolbar() {
  const [selectedType, setSelectedType] = useAtom(selectedNodeTypeAtom)

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 z-10">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 font-medium mr-2">
          Click to add:
        </span>
        <div className="flex bg-gray-100 rounded p-1">
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => setSelectedType(nodeType.type)}
              className={`px-3 py-2 text-sm rounded transition-colors ${
                selectedType === nodeType.type
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              title={nodeType.label}
            >
              <span className="text-lg">{nodeType.icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
