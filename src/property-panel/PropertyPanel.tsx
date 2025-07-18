import { useAtomValue, useSetAtom, atom } from './deps'
import { selectedElementAtom } from './atoms'
import { nodesAtom, edgesAtom, updateNodeAtom } from './deps'

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

  // Derive label from selected element
  const label = selectedNode?.data.label || selectedEdge?.data?.label || ''

  // Handle label update directly
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value
    if (selectedNode) {
      updateNode({
        id: selectedNode.id,
        data: { label: newLabel },
      })
    }
    // TODO: Add edge update functionality
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
                value={label}
                onChange={handleLabelChange}
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
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">
                Edge Type
              </h3>
              <p className="text-sm text-gray-900">{selectedEdge.type}</p>
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
                value={label}
                onChange={handleLabelChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Edge label editing coming soon
              </p>
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
