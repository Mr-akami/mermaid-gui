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
import Tooltip from './ui/Tooltip'
import {
  RiRectangleLine,
  RiCircleLine,
  RiStopCircleLine,
  RiDatabase2Line,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiStopLine,
  RiPlayCircleLine,
  RiUser3Line,
  RiTeamLine,
  RiLoopLeftLine,
  RiFlaskLine,
  RiQuestionLine,
  RiSplitCellsHorizontal,
  RiFileList3Line,
  RiPlugLine,
  RiTaskLine,
  RiPriceTag3Line,
  RiCheckboxBlankLine,
  RiStopCircleFill,
  RiGitBranchLine,
  RiDeleteBin6Line,
  RiShapeLine,
  RiCodeBoxLine,
  RiInputMethodLine,
  RiTapeLine
} from 'react-icons/ri'

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
            <Tooltip content="Rectangle - Process">
              <button
                onClick={() => addFlowchartNode('rectangle')}
                className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <RiRectangleLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Rounded Rectangle">
              <button
                onClick={() => addFlowchartNode('roundedRectangle')}
                className="w-8 h-8 flex items-center justify-center bg-blue-400 text-white rounded hover:bg-blue-500 transition-colors"
              >
                <RiShapeLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Stadium - Terminal">
              <button
                onClick={() => addFlowchartNode('stadium')}
                className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <RiStopLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Subroutine">
              <button
                onClick={() => addFlowchartNode('subroutine')}
                className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
              >
                <RiCodeBoxLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Cylinder - Database">
              <button
                onClick={() => addFlowchartNode('cylindrical')}
                className="w-8 h-8 flex items-center justify-center bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              >
                <RiDatabase2Line className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Circle - Start/End">
              <button
                onClick={() => addFlowchartNode('circle')}
                className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
              >
                <RiCircleLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Asymmetric - Manual Input">
              <button
                onClick={() => addFlowchartNode('asymmetric')}
                className="w-8 h-8 flex items-center justify-center bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
              >
                <RiInputMethodLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Rhombus - Decision">
              <button
                onClick={() => addFlowchartNode('rhombus')}
                className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                <RiGitBranchLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Hexagon - Preparation">
              <button
                onClick={() => addFlowchartNode('hexagon')}
                className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              >
                <RiStopCircleLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Parallelogram - Input/Output">
              <button
                onClick={() => addFlowchartNode('parallelogram')}
                className="w-8 h-8 flex items-center justify-center bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                <RiSplitCellsHorizontal className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Trapezoid - Manual Operation">
              <button
                onClick={() => addFlowchartNode('trapezoid')}
                className="w-8 h-8 flex items-center justify-center bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
              >
                <RiTapeLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Double Circle - Stop">
              <button
                onClick={() => addFlowchartNode('doubleCircle')}
                className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <RiStopCircleFill className="w-4 h-4" />
              </button>
            </Tooltip>
          </>
        )
      
      case 'sequence':
        return (
          <>
            <Tooltip content="Add Participant">
              <button
                onClick={() => addSequenceNode('participant')}
                className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <RiTeamLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Actor">
              <button
                onClick={() => addSequenceNode('actor')}
                className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <RiUser3Line className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Loop Block">
              <button
                onClick={() => addSequenceBlock('loop')}
                className="w-8 h-8 flex items-center justify-center bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                <RiLoopLeftLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Alternative Block">
              <button
                onClick={() => addSequenceBlock('alt')}
                className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              >
                <RiFlaskLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Optional Block">
              <button
                onClick={() => addSequenceBlock('opt')}
                className="w-8 h-8 flex items-center justify-center bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              >
                <RiQuestionLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Parallel Block">
              <button
                onClick={() => addSequenceBlock('par')}
                className="w-8 h-8 flex items-center justify-center bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
              >
                <RiSplitCellsHorizontal className="w-4 h-4" />
              </button>
            </Tooltip>
          </>
        )
      
      case 'class':
        return (
          <>
            <Tooltip content="Add Regular Class">
              <button
                onClick={() => addClassNode()}
                className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <RiFileList3Line className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Interface">
              <button
                onClick={() => addClassNode('interface')}
                className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <RiPlugLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Abstract Class">
              <button
                onClick={() => addClassNode('abstract')}
                className="w-8 h-8 flex items-center justify-center bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                <RiTaskLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Enumeration">
              <button
                onClick={() => addClassNode('enumeration')}
                className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              >
                <RiPriceTag3Line className="w-4 h-4" />
              </button>
            </Tooltip>
          </>
        )
      
      case 'state':
        return (
          <>
            <Tooltip content="Add State">
              <button
                onClick={() => addStateNode('state')}
                className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <RiCheckboxBlankLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Start State">
              <button
                onClick={() => addStateNode('start')}
                className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <RiPlayCircleLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add End State">
              <button
                onClick={() => addStateNode('end')}
                className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <RiStopCircleFill className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Choice State">
              <button
                onClick={() => addStateNode('choice')}
                className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                <RiGitBranchLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Fork State">
              <button
                onClick={() => addStateNode('fork')}
                className="w-8 h-8 flex items-center justify-center bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                <RiArrowUpSLine className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Join State">
              <button
                onClick={() => addStateNode('join')}
                className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
              >
                <RiArrowDownSLine className="w-4 h-4" />
              </button>
            </Tooltip>
          </>
        )
      
      case 'er':
        return (
          <>
            <Tooltip content="Add Entity">
              <button
                onClick={addERNode}
                className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <RiDatabase2Line className="w-4 h-4" />
              </button>
            </Tooltip>
          </>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
          {diagramType}
        </div>
        <div className="grid grid-cols-3 gap-1">
          {renderToolbarButtons()}
        </div>
        <hr className="border-gray-300" />
        <Tooltip content="Clear Canvas">
          <button
            onClick={clearCanvas}
            className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition-colors mx-auto"
          >
            <RiDeleteBin6Line className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default Toolbar