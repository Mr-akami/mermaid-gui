import { useAtom, useAtomValue } from 'jotai'
import { flowchartDirectionAtom, diagramTypeAtom, FlowchartDirection } from '@/store/diagramStore'

const FlowchartDirectionSelector = () => {
  const [direction, setDirection] = useAtom(flowchartDirectionAtom)
  const diagramType = useAtomValue(diagramTypeAtom)

  if (diagramType !== 'flowchart') {
    return null
  }

  const directions: { value: FlowchartDirection; label: string; icon: string }[] = [
    { value: 'TD', label: 'Top to Bottom', icon: '↓' },
    { value: 'BT', label: 'Bottom to Top', icon: '↑' },
    { value: 'LR', label: 'Left to Right', icon: '→' },
    { value: 'RL', label: 'Right to Left', icon: '←' },
  ]

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
        Flow Direction
      </div>
      <div className="flex gap-1">
        {directions.map((dir) => (
          <button
            key={dir.value}
            onClick={() => setDirection(dir.value)}
            className={`px-3 py-2 text-sm rounded transition-colors ${
              direction === dir.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={dir.label}
          >
            <span className="text-lg mr-1">{dir.icon}</span>
            {dir.value}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FlowchartDirectionSelector