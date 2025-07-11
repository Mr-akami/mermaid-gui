import { useSetAtom, useAtomValue } from 'jotai'
import { nodesAtom, edgesAtom, sequenceBlocksAtom } from '@/store/flowStore'
import { diagramTypeAtom } from '@/store/diagramStore'
import { Node } from 'reactflow'
import {
  FlowchartNode,
  SequenceNode,
  StateNode,
  SequenceBlock
} from '@/types/diagram'

const Toolbar = () => {
  const setNodes = useSetAtom(nodesAtom)
  const setEdges = useSetAtom(edgesAtom)
  const setSequenceBlocks = useSetAtom(sequenceBlocksAtom)
  const nodes = useAtomValue(nodesAtom)
  const diagramType = useAtomValue(diagramTypeAtom)

  const getNextNodeId = (prefix: string) => {
    const existingIds = nodes.filter(n => n.id.startsWith(prefix))
    return `${prefix}${existingIds.length + 1}`
  }

  const addFlowchartNode = (shape: FlowchartNode['data']['shape']) => {
    const id = getNextNodeId(shape.charAt(0).toUpperCase())
    const labels = {
      rectangle: 'Process',
      roundedRectangle: 'Process',
      stadium: 'Terminal',
      subroutine: 'Subroutine',
      cylindrical: 'Database',
      circle: 'Start/End',
      asymmetric: 'Manual Input',
      rhombus: 'Decision',
      hexagon: 'Preparation',
      parallelogram: 'Input/Output',
      trapezoid: 'Manual Operation',
      doubleCircle: 'Stop'
    }
    
    const newNode: Node = {
      id,
      type: 'flowchart',
      position: { 
        x: 100 + (nodes.length * 150) % 600, 
        y: 100 + Math.floor(nodes.length / 4) * 150 
      },
      data: {
        label: labels[shape],
        shape,
      },
    }

    setNodes((nodes) => [...nodes, newNode])
  }

  const addSequenceNode = (type: SequenceNode['data']['type']) => {
    const id = getNextNodeId(type === 'actor' ? 'Actor' : 'P')
    
    const newNode: Node = {
      id,
      type: 'sequence',
      position: { 
        x: 100 + (nodes.length * 150) % 600, 
        y: 100
      },
      data: {
        label: `${type === 'actor' ? 'Actor' : 'Participant'} ${nodes.length + 1}`,
        type,
      },
    }

    setNodes((nodes) => [...nodes, newNode])
  }

  const addSequenceBlock = (type: SequenceBlock['type']) => {
    const id = getNextNodeId(`${type.charAt(0).toUpperCase()}${type.slice(1)}`)
    
    const newBlock: SequenceBlock = {
      id,
      type,
      label: `${type} condition`,
      children: [],
      condition: `${type} condition`
    }

    setSequenceBlocks((blocks) => [...blocks, newBlock])
  }

  const addClassNode = (stereotype?: 'interface' | 'abstract' | 'enumeration') => {
    const id = getNextNodeId(stereotype ? stereotype.charAt(0).toUpperCase() + stereotype.slice(1) : 'Class')
    
    const newNode: Node = {
      id,
      type: 'class',
      position: { 
        x: 100 + (nodes.length * 200) % 600, 
        y: 100 + Math.floor(nodes.length / 3) * 250 
      },
      data: {
        label: stereotype ? `${stereotype.charAt(0).toUpperCase() + stereotype.slice(1)}${nodes.length + 1}` : `Class${nodes.length + 1}`,
        stereotype,
        attributes: stereotype === 'enumeration' ? [
          { name: 'VALUE1', type: 'enum', visibility: '+' as const, isStatic: false, isAbstract: false },
          { name: 'VALUE2', type: 'enum', visibility: '+' as const, isStatic: false, isAbstract: false }
        ] : [],
        methods: stereotype === 'interface' ? [
          { name: 'method', parameters: [], returnType: 'void', visibility: '+' as const, isStatic: false, isAbstract: true }
        ] : [],
      },
    }

    setNodes((nodes) => [...nodes, newNode])
  }

  const addStateNode = (type: StateNode['data']['type']) => {
    const id = getNextNodeId(type === 'state' ? 'S' : type)
    
    const newNode: Node = {
      id,
      type: 'state',
      position: { 
        x: 100 + (nodes.length * 150) % 600, 
        y: 100 + Math.floor(nodes.length / 4) * 150 
      },
      data: {
        label: type === 'state' ? `State${nodes.length + 1}` : type,
        type,
      },
    }

    setNodes((nodes) => [...nodes, newNode])
  }

  const addERNode = () => {
    const id = getNextNodeId('Entity')
    
    const newNode: Node = {
      id,
      type: 'er',
      position: { 
        x: 100 + (nodes.length * 200) % 600, 
        y: 100 + Math.floor(nodes.length / 3) * 200 
      },
      data: {
        label: `Entity${nodes.length + 1}`,
        attributes: [],
      },
    }

    setNodes((nodes) => [...nodes, newNode])
  }

  const clearCanvas = () => {
    setNodes([])
    setEdges([])
  }

  const renderToolbarButtons = () => {
    switch (diagramType) {
      case 'flowchart':
        return (
          <>
            <button
              onClick={() => addFlowchartNode('rectangle')}
              className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Rectangle - Process"
            >
              □ Process
            </button>
            <button
              onClick={() => addFlowchartNode('roundedRectangle')}
              className="w-full px-3 py-2 text-sm bg-blue-400 text-white rounded hover:bg-blue-500 transition-colors"
              title="Rounded Rectangle"
            >
              ▢ Rounded Process
            </button>
            <button
              onClick={() => addFlowchartNode('stadium')}
              className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Stadium - Terminal"
            >
              ⬭ Terminal
            </button>
            <button
              onClick={() => addFlowchartNode('subroutine')}
              className="w-full px-3 py-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
              title="Subroutine"
            >
              ⎔ Subroutine
            </button>
            <button
              onClick={() => addFlowchartNode('cylindrical')}
              className="w-full px-3 py-2 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              title="Cylinder - Database"
            >
              ⊙ Database
            </button>
            <button
              onClick={() => addFlowchartNode('circle')}
              className="w-full px-3 py-2 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
              title="Circle - Start/End"
            >
              ○ Start/End
            </button>
            <button
              onClick={() => addFlowchartNode('asymmetric')}
              className="w-full px-3 py-2 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
              title="Asymmetric - Manual Input"
            >
              ⎨ Manual Input
            </button>
            <button
              onClick={() => addFlowchartNode('rhombus')}
              className="w-full px-3 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              title="Rhombus - Decision"
            >
              ◊ Decision
            </button>
            <button
              onClick={() => addFlowchartNode('hexagon')}
              className="w-full px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              title="Hexagon - Preparation"
            >
              ⬟ Preparation
            </button>
            <button
              onClick={() => addFlowchartNode('parallelogram')}
              className="w-full px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              title="Parallelogram - Input/Output"
            >
              ▱ Input/Output
            </button>
            <button
              onClick={() => addFlowchartNode('trapezoid')}
              className="w-full px-3 py-2 text-sm bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
              title="Trapezoid - Manual Operation"
            >
              ⏢ Manual Operation
            </button>
            <button
              onClick={() => addFlowchartNode('doubleCircle')}
              className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              title="Double Circle - Stop"
            >
              ◉ Stop
            </button>
          </>
        )
      
      case 'sequence':
        return (
          <>
            <button
              onClick={() => addSequenceNode('participant')}
              className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Add Participant"
            >
              👥 Participant
            </button>
            <button
              onClick={() => addSequenceNode('actor')}
              className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Add Actor"
            >
              👤 Actor
            </button>
            <button
              onClick={() => addSequenceBlock('loop')}
              className="w-full px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              title="Add Loop Block"
            >
              🔄 Loop
            </button>
            <button
              onClick={() => addSequenceBlock('alt')}
              className="w-full px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              title="Add Alternative Block"
            >
              ⚡ Alt
            </button>
            <button
              onClick={() => addSequenceBlock('opt')}
              className="w-full px-3 py-2 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              title="Add Optional Block"
            >
              ❓ Opt
            </button>
            <button
              onClick={() => addSequenceBlock('par')}
              className="w-full px-3 py-2 text-sm bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
              title="Add Parallel Block"
            >
              ⚡ Par
            </button>
          </>
        )
      
      case 'class':
        return (
          <>
            <button
              onClick={() => addClassNode()}
              className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Add Regular Class"
            >
              📋 Class
            </button>
            <button
              onClick={() => addClassNode('interface')}
              className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Add Interface"
            >
              🔌 Interface
            </button>
            <button
              onClick={() => addClassNode('abstract')}
              className="w-full px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              title="Add Abstract Class"
            >
              🎭 Abstract
            </button>
            <button
              onClick={() => addClassNode('enumeration')}
              className="w-full px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              title="Add Enumeration"
            >
              🏷️ Enum
            </button>
          </>
        )
      
      case 'state':
        return (
          <>
            <button
              onClick={() => addStateNode('state')}
              className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add State
            </button>
            <button
              onClick={() => addStateNode('start')}
              className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Add Start
            </button>
            <button
              onClick={() => addStateNode('end')}
              className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Add End
            </button>
            <button
              onClick={() => addStateNode('choice')}
              className="w-full px-3 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Add Choice
            </button>
            <button
              onClick={() => addStateNode('fork')}
              className="w-full px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Add Fork
            </button>
            <button
              onClick={() => addStateNode('join')}
              className="w-full px-3 py-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
            >
              Add Join
            </button>
          </>
        )
      
      case 'er':
        return (
          <>
            <button
              onClick={addERNode}
              className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add Entity
            </button>
          </>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2">
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-1">
          {diagramType} Tools
        </div>
        {renderToolbarButtons()}
        <hr className="my-2 border-gray-300" />
        <button
          onClick={clearCanvas}
          className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  )
}

export default Toolbar