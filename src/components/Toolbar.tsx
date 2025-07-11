import { useSetAtom, useAtomValue } from 'jotai'
import { nodesAtom, edgesAtom } from '@/store/flowStore'
import { Node } from 'reactflow'

const Toolbar = () => {
  const setNodes = useSetAtom(nodesAtom)
  const setEdges = useSetAtom(edgesAtom)
  const nodes = useAtomValue(nodesAtom)

  const addNode = (type: string, shape: string) => {
    const nodeCount = nodes.length
    const id = shape === 'rectangle' ? `A${nodeCount + 1}` : 
                shape === 'circle' ? `B${nodeCount + 1}` : 
                `C${nodeCount + 1}`
    
    const newNode: Node = {
      id,
      type: 'custom',
      position: { 
        x: 100 + (nodeCount * 150) % 600, 
        y: 100 + Math.floor(nodeCount / 4) * 150 
      },
      data: {
        label: `${type}`,
        type,
        shape,
      },
    }

    setNodes((nodes) => [...nodes, newNode])
  }

  const clearCanvas = () => {
    setNodes([])
    setEdges([])
  }

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2">
      <div className="space-y-2">
        <button
          onClick={() => addNode('Process', 'rectangle')}
          className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Add Rectangle
        </button>
        <button
          onClick={() => addNode('Start/End', 'circle')}
          className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Add Circle
        </button>
        <button
          onClick={() => addNode('Decision', 'diamond')}
          className="w-full px-3 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Add Diamond
        </button>
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