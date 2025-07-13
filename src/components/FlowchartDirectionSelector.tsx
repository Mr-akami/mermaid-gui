import { useAtom, useAtomValue } from 'jotai'
import { flowchartDirectionAtom, diagramTypeAtom, FlowchartDirection } from '@/store/diagramStore'
import Tooltip from './ui/Tooltip'
import ControlPanel from './ui/ControlPanel'
import { 
  RiArrowDownLine, 
  RiArrowUpLine, 
  RiArrowRightLine, 
  RiArrowLeftLine 
} from 'react-icons/ri'

const FlowchartDirectionSelector = () => {
  const [direction, setDirection] = useAtom(flowchartDirectionAtom)
  const diagramType = useAtomValue(diagramTypeAtom)

  if (diagramType !== 'flowchart') {
    return null
  }

  const directions: { 
    value: FlowchartDirection
    label: string
    icon: JSX.Element
  }[] = [
    { value: 'TD', label: 'Top to Bottom', icon: <RiArrowDownLine className="w-4 h-4" /> },
    { value: 'BT', label: 'Bottom to Top', icon: <RiArrowUpLine className="w-4 h-4" /> },
    { value: 'LR', label: 'Left to Right', icon: <RiArrowRightLine className="w-4 h-4" /> },
    { value: 'RL', label: 'Right to Left', icon: <RiArrowLeftLine className="w-4 h-4" /> },
  ]

  return (
    <ControlPanel title="Direction" size="sm">
      <div className="grid grid-cols-2 gap-1">
        {directions.map((dir) => (
          <Tooltip key={dir.value} content={dir.label}>
            <button
              onClick={() => setDirection(dir.value)}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                direction === dir.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {dir.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    </ControlPanel>
  )
}

export default FlowchartDirectionSelector