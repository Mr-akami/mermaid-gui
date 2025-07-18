import { useAtom } from './deps'
import type { Node } from './deps'
import { selectedNodeTypeAtom } from './atoms'
import { useUndoRedo } from './deps'

const nodeTypes: Array<{ type: Node['type']; label: string; icon: string }> = [
  { type: 'rectangle', label: 'Rectangle', icon: '□' },
  { type: 'circle', label: 'Circle', icon: '○' },
  { type: 'diamond', label: 'Diamond', icon: '◇' },
  { type: 'subgraph', label: 'Subgraph', icon: '▢' },
]

export function Toolbar() {
  const [selectedType, setSelectedType] = useAtom(selectedNodeTypeAtom)
  const { undo, redo, canUndo, canRedo } = useUndoRedo()

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 z-10">
      <div className="flex items-center space-x-2">
        {/* Undo/Redo buttons */}
        <div className="flex bg-gray-100 rounded p-1">
          <button
            onClick={() => undo()}
            disabled={!canUndo}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              canUndo
                ? 'text-gray-700 hover:bg-gray-200'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={() => redo()}
            disabled={!canRedo}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              canRedo
                ? 'text-gray-700 hover:bg-gray-200'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Shift+Z)"
          >
            ↷
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

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
