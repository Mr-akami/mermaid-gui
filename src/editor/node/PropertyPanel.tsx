import { useState, useEffect, useRef } from 'react'
import { Node, Edge } from '../../common/types'
import { MERMAID_NODE_TYPES, MERMAID_EDGE_TYPES } from '../../flowchart'

interface PropertyPanelProps {
  selectedNode: Node | null
  selectedEdge: Edge | null
  onNodeUpdate: (update: { id: string; data?: { label: string }; type?: string }) => void
  onEdgeUpdate: (update: { id: string; data?: { label: string }; type?: string }) => void
  autoFocus?: boolean
}

export function PropertyPanel({
  selectedNode,
  selectedEdge,
  onNodeUpdate,
  onEdgeUpdate,
  autoFocus = false,
}: PropertyPanelProps) {
  const [label, setLabel] = useState('')
  const [nodeType, setNodeType] = useState<string>('')
  const [edgeType, setEdgeType] = useState<string>('')
  const labelInputRef = useRef<HTMLInputElement>(null)

  // Update local state when selection changes
  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || '')
      setNodeType(selectedNode.type)
    } else if (selectedEdge) {
      setLabel(selectedEdge.data?.label || '')
      setEdgeType(selectedEdge.type)
    }
  }, [selectedNode, selectedEdge])

  // Handle auto-focus
  useEffect(() => {
    if (autoFocus && labelInputRef.current) {
      labelInputRef.current.focus()
      labelInputRef.current.select()
    }
  }, [autoFocus])

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value
    setLabel(newLabel)
    
    // Update immediately on change
    if (selectedNode) {
      onNodeUpdate({
        id: selectedNode.id,
        data: { label: newLabel },
      })
    } else if (selectedEdge) {
      onEdgeUpdate({
        id: selectedEdge.id,
        data: { label: newLabel },
      })
    }
  }

  const handleNodeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value
    setNodeType(newType)
    if (selectedNode) {
      onNodeUpdate({
        id: selectedNode.id,
        type: newType,
      })
    }
  }

  const handleEdgeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value
    setEdgeType(newType)
    if (selectedEdge) {
      onEdgeUpdate({
        id: selectedEdge.id,
        type: newType,
      })
    }
  }

  // Don't render if nothing is selected
  if (!selectedNode && !selectedEdge) {
    return null
  }

  return (
    <div
      data-testid="property-panel"
      className="property-panel fixed right-4 top-20 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10"
    >
      <h3 className="text-lg font-semibold mb-4">
        {selectedNode ? 'Node Properties' : 'Edge Properties'}
      </h3>

      <div className="space-y-4">
        {/* Label input */}
        <div>
          <label htmlFor="label-input" className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            ref={labelInputRef}
            id="label-input"
            type="text"
            value={label}
            onChange={handleLabelChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type selector */}
        <div>
          <label htmlFor="type-select" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="type-select"
            value={selectedNode ? nodeType : edgeType}
            onChange={selectedNode ? handleNodeTypeChange : handleEdgeTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {selectedNode
              ? MERMAID_NODE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))
              : MERMAID_EDGE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
          </select>
        </div>
      </div>
    </div>
  )
}