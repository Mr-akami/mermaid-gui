import { memo } from 'react'
import { MERMAID_NODE_TYPES, type MermaidNodeType } from '../../flowchart'

interface NodeToolbarProps {
  onNodeTypeSelect: (nodeType: string) => void
  selectedNodeType: string | null
}

// Icon mapping for each node type - UI concern stays in editor
const NODE_ICONS: Record<MermaidNodeType, { icon: string; title: string }> = {
  rectangle: { icon: '□', title: 'Rectangle' },
  circle: { icon: '○', title: 'Circle' },
  diamond: { icon: '◇', title: 'Diamond' },
  roundEdges: { icon: '▢', title: 'Round Edges' },
  stadium: { icon: '⬭', title: 'Stadium' },
  subroutine: { icon: '▣', title: 'Subroutine' },
  cylindrical: { icon: '⬮', title: 'Cylinder' },
  parallelogram: { icon: '▱', title: 'Parallelogram' },
  trapezoid: { icon: '⏢', title: 'Trapezoid' },
  hexagon: { icon: '⬡', title: 'Hexagon' },
  doubleCircle: { icon: '◉', title: 'Double Circle' },
  subgraph: { icon: '▦', title: 'Subgraph' },
}

export const NodeToolbar = memo(({ onNodeTypeSelect, selectedNodeType }: NodeToolbarProps) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex gap-1 z-10">
      {MERMAID_NODE_TYPES.filter(type => type !== 'subgraph').map((type) => {
        const { icon, title } = NODE_ICONS[type]
        return (
          <button
            key={type}
            onClick={() => onNodeTypeSelect(type)}
            title={title}
            className={`
              w-10 h-10 flex items-center justify-center rounded
              text-lg font-bold transition-all
              ${
                selectedNodeType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            {icon}
          </button>
        )
      })}
    </div>
  )
})

NodeToolbar.displayName = 'NodeToolbar'