import { useSetAtom } from './deps'
import { addNodeAtom } from './deps'
import type { Node } from './deps'
import { useState } from 'react'

const nodeTypes: Array<{ type: Node['type']; label: string; icon: string }> = [
  { type: 'rectangle', label: 'Rectangle', icon: '□' },
  { type: 'circle', label: 'Circle', icon: '○' },
  { type: 'diamond', label: 'Diamond', icon: '◇' },
  { type: 'subgraph', label: 'Subgraph', icon: '▢' },
]

export function Toolbar() {
  const addNode = useSetAtom(addNodeAtom)
  const [selectedType, setSelectedType] = useState<Node['type']>('rectangle')

  const handleAddNode = () => {
    // Add node at a random position for now
    const randomX = Math.floor(Math.random() * 500) + 100
    const randomY = Math.floor(Math.random() * 300) + 100

    addNode({
      type: selectedType,
      position: { x: randomX, y: randomY },
      label: `New ${selectedType}`,
    })
  }

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 z-10">
      <div className="flex items-center space-x-2">
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

        <div className="w-px h-8 bg-gray-300" />

        <button
          onClick={handleAddNode}
          className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
        >
          Add Node
        </button>
      </div>
    </div>
  )
}
