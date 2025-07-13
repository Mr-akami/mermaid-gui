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
import {
  Square,
  RectangleHorizontal,
  Circle,
  Diamond,
  Hexagon,
  Database,
  Cpu,
  FileInput,
  StopCircle,
  Users,
  User,
  RotateCw,
  Zap,
  HelpCircle,
  GitBranch,
  FileText,
  Plug,
  Shapes,
  Tag,
  Play,
  XCircle,
  GitPullRequest,
  GitMerge,
  Trash2,
  Workflow,
  Tablet
} from 'lucide-react'

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
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Process (Rectangle)"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => addFlowchartNode('roundedRectangle')}
              className="p-2 bg-blue-400 text-white rounded hover:bg-blue-500 transition-colors"
              title="Rounded Process"
            >
              <RectangleHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => addFlowchartNode('stadium')}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Terminal (Stadium)"
            >
              <Tablet className="w-4 h-4 rotate-90" />
            </button>
            <button
              onClick={() => addFlowchartNode('subroutine')}
              className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
              title="Subroutine"
            >
              <Cpu className="w-4 h-4" />
            </button>
            <button
              onClick={() => addFlowchartNode('cylindrical')}
              className="p-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              title="Database (Cylinder)"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => addFlowchartNode('circle')}
              className="p-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
              title="Start/End (Circle)"
            >
              <Circle className="w-4 h-4" />
            </button>
            <button
              onClick={() => addFlowchartNode('asymmetric')}
              className="p-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
              title="Manual Input (Asymmetric)"
            >
              <FileInput className="w-4 h-4" />
            </button>
            <button
              onClick={() => addFlowchartNode('rhombus')}
              className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              title="Decision (Rhombus)"
            >
              <Diamond className="w-4 h-4" />
            </button>
            <button
              onClick={() => addFlowchartNode('hexagon')}
              className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              title="Preparation (Hexagon)"
            >
              <Hexagon className="w-4 h-4" />
            </button>
            <button
              onClick={() => addFlowchartNode('parallelogram')}
              className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              title="Input/Output (Parallelogram)"
            >
              <Workflow className="w-4 h-4" />
            </button>
            <button
              onClick={() => addFlowchartNode('trapezoid')}
              className="p-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
              title="Manual Operation (Trapezoid)"
            >
              <Shapes className="w-4 h-4" />
            </button>
            <button
              onClick={() => addFlowchartNode('doubleCircle')}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              title="Stop (Double Circle)"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          </>
        )
      
      case 'sequence':
        return (
          <>
            <button
              onClick={() => addSequenceNode('participant')}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Add Participant"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => addSequenceNode('actor')}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Add Actor"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={() => addSequenceBlock('loop')}
              className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              title="Add Loop Block"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => addSequenceBlock('alt')}
              className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              title="Add Alternative Block"
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => addSequenceBlock('opt')}
              className="p-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              title="Add Optional Block"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => addSequenceBlock('par')}
              className="p-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
              title="Add Parallel Block"
            >
              <GitBranch className="w-4 h-4" />
            </button>
          </>
        )
      
      case 'class':
        return (
          <>
            <button
              onClick={() => addClassNode()}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Add Regular Class"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => addClassNode('interface')}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Add Interface"
            >
              <Plug className="w-4 h-4" />
            </button>
            <button
              onClick={() => addClassNode('abstract')}
              className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              title="Add Abstract Class"
            >
              <Shapes className="w-4 h-4" />
            </button>
            <button
              onClick={() => addClassNode('enumeration')}
              className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              title="Add Enumeration"
            >
              <Tag className="w-4 h-4" />
            </button>
          </>
        )
      
      case 'state':
        return (
          <>
            <button
              onClick={() => addStateNode('state')}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Add State"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => addStateNode('start')}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Add Start"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              onClick={() => addStateNode('end')}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              title="Add End"
            >
              <XCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => addStateNode('choice')}
              className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              title="Add Choice"
            >
              <Diamond className="w-4 h-4" />
            </button>
            <button
              onClick={() => addStateNode('fork')}
              className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              title="Add Fork"
            >
              <GitPullRequest className="w-4 h-4" />
            </button>
            <button
              onClick={() => addStateNode('join')}
              className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
              title="Add Join"
            >
              <GitMerge className="w-4 h-4" />
            </button>
          </>
        )
      
      case 'er':
        return (
          <>
            <button
              onClick={addERNode}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Add Entity"
            >
              <Database className="w-4 h-4" />
            </button>
          </>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
      <div className="space-y-3">
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {diagramType} Tools
        </div>
        <div className="grid grid-cols-3 gap-1">
          {renderToolbarButtons()}
        </div>
        <hr className="border-gray-300" />
        <div className="flex justify-center">
          <button
            onClick={clearCanvas}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toolbar