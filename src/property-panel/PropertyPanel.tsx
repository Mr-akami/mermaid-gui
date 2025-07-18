import { useAtomValue, useSetAtom, atom } from './deps'
import { selectedElementAtom } from './atoms'
import { nodesAtom, edgesAtom, updateNodeAtom, updateEdgeAtom } from './deps'

// Computed atom for selected node
const selectedNodeAtom = atom((get) => {
  const selectedElement = get(selectedElementAtom)
  const nodes = get(nodesAtom)

  if (selectedElement?.type === 'node') {
    return nodes.find((n) => n.id === selectedElement.id) || null
  }
  return null
})

// Computed atom for selected edge
const selectedEdgeAtom = atom((get) => {
  const selectedElement = get(selectedElementAtom)
  const edges = get(edgesAtom)

  if (selectedElement?.type === 'edge') {
    return edges.find((e) => e.id === selectedElement.id) || null
  }
  return null
})

export function PropertyPanel() {
  const selectedNode = useAtomValue(selectedNodeAtom)
  const selectedEdge = useAtomValue(selectedEdgeAtom)
  const updateNode = useSetAtom(updateNodeAtom)
  const updateEdge = useSetAtom(updateEdgeAtom)

  // Handle node label change
  const handleNodeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value
    if (selectedNode) {
      updateNode({
        id: selectedNode.id,
        data: { label: newLabel },
      })
    }
  }

  // Handle edge label change
  const handleEdgeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value
    if (selectedEdge) {
      updateEdge({
        id: selectedEdge.id,
        data: { label: newLabel },
      })
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-800">Properties</h2>
      </div>

      <div className="flex-1 p-4">
        {selectedNode ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">
                Node Type
              </h3>
              <p className="text-sm text-gray-900 capitalize">
                {selectedNode.type}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">
                Node ID
              </h3>
              <p className="text-sm text-gray-900 font-mono">
                {selectedNode.id}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Label
              </label>
              <input
                type="text"
                value={selectedNode.data.label || ''}
                onChange={handleNodeLabelChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedNode.parentId && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">
                  Parent
                </h3>
                <p className="text-sm text-gray-900 font-mono">
                  {selectedNode.parentId}
                </p>
              </div>
            )}

            {selectedNode.childIds.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">
                  Children
                </h3>
                <p className="text-sm text-gray-900 font-mono">
                  {selectedNode.childIds.join(', ')}
                </p>
              </div>
            )}
          </div>
        ) : selectedEdge ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Edge Type
              </label>
              <select
                value={selectedEdge.type}
                onChange={(e) =>
                  updateEdge({
                    id: selectedEdge.id,
                    type: e.target.value as any,
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="normal-arrow">Normal with Arrow</option>
                <option value="thick">Thick</option>
                <option value="thick-arrow">Thick with Arrow</option>
                <option value="dotted">Dotted</option>
                <option value="dotted-arrow">Dotted with Arrow</option>
              </select>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">
                Source → Target
              </h3>
              <p className="text-sm text-gray-900 font-mono">
                {selectedEdge.source} → {selectedEdge.target}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Label
              </label>
              <input
                type="text"
                value={selectedEdge.data?.label || ''}
                onChange={handleEdgeLabelChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Select a node or edge to view properties
          </div>
        )}
      </div>
    </div>
  )
}
