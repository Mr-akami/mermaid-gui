import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { edgesAtom } from '@/store/flowStore'
import { diagramTypeAtom } from '@/store/diagramStore'
import { FlowchartEdge } from '@/types/diagram'
import Tooltip from './ui/Tooltip'
import ControlPanel from './ui/ControlPanel'
import { 
  RiArrowRightLine, 
  RiMoreLine, 
  RiSubtractLine,
  RiCheckLine 
} from 'react-icons/ri'

const EdgeStyleSelector = () => {
  const [selectedStyle, setSelectedStyle] = useState<FlowchartEdge['data']['style']>('solid')
  const [hasArrow, setHasArrow] = useState(true)
  const setEdges = useSetAtom(edgesAtom)
  const diagramType = useAtomValue(diagramTypeAtom)

  if (diagramType !== 'flowchart') {
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
                style: selectedStyle,
                hasArrow: hasArrow,
              },
            }
          : edge
      )
    )
  }

  const getStyleIcon = (style: FlowchartEdge['data']['style']) => {
    switch (style) {
      case 'solid':
        return <RiArrowRightLine className="w-4 h-4" />
      case 'dotted':
        return <RiMoreLine className="w-4 h-4" />
      case 'thick':
        return <RiSubtractLine className="w-4 h-4" />
      default:
        return <RiArrowRightLine className="w-4 h-4" />
    }
  }

  const getStyleLabel = (style: FlowchartEdge['data']['style']) => {
    switch (style) {
      case 'solid':
        return 'Solid Line (→)'
      case 'dotted':
        return 'Dotted Line (-.-›)'
      case 'thick':
        return 'Thick Line (==›)'
      default:
        return 'Solid Line'
    }
  }

  return (
    <ControlPanel title="Edge Style" size="sm">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-1">
          {(['solid', 'dotted', 'thick'] as const).map((style) => (
            <Tooltip key={style} content={getStyleLabel(style)}>
              <button
                onClick={() => setSelectedStyle(style)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  selectedStyle === style
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {getStyleIcon(style)}
              </button>
            </Tooltip>
          ))}
        </div>
        
        <Tooltip content={hasArrow ? 'Hide Arrow' : 'Show Arrow'}>
          <button
            onClick={() => setHasArrow(!hasArrow)}
            className={`w-full h-8 flex items-center justify-center rounded transition-colors ${
              hasArrow
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <RiArrowRightLine className="w-4 h-4" />
            {!hasArrow && <span className="ml-1 text-xs">No</span>}
          </button>
        </Tooltip>
        
        <Tooltip content="Apply style to selected edges">
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

export default EdgeStyleSelector