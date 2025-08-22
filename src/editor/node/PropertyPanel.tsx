import { useState, useEffect, useRef } from 'react'
import { Node, Edge } from '../../flowchart/types'
import { MERMAID_NODE_TYPES, MERMAID_EDGE_TYPES } from '../../flowchart'
import { useAtomValue } from 'jotai'
import { nodesAtom } from '../../flowchart/atoms'

interface PropertyPanelProps {
  selectedNode: Node | null
  selectedEdge: Edge | null
  onNodeUpdate: (update: { id: string; data?: { label: string }; type?: string; parentId?: string | null }) => void
  onEdgeUpdate: (update: { id: string; data?: { label: string }; type?: Edge['type'] }) => void
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
  const [parentId, setParentId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const labelInputRef = useRef<HTMLTextAreaElement>(null)
  
  // Get all nodes to find potential parent nodes (subgraphs)
  const allNodes = useAtomValue(nodesAtom)

  // Update local state when selection changes (node ID changes)
  useEffect(() => {
    // Skip state updates while editing to prevent losing focus
    if (isEditing) {
      return
    }
    
    if (selectedNode) {
      console.log('Selected node:', selectedNode.id, 'Parent:', selectedNode.parentId)
      setLabel(selectedNode.data.label || '')
      setNodeType(selectedNode.type)
      setParentId(selectedNode.parentId || null)
    } else if (selectedEdge) {
      setLabel(selectedEdge.data?.label || '')
      setEdgeType(selectedEdge.type)
      setParentId(null)
    }
  }, [selectedNode?.id, selectedEdge?.id, isEditing, selectedNode?.type, selectedEdge?.type, selectedNode?.parentId])

  // Handle auto-focus
  useEffect(() => {
    if (autoFocus && labelInputRef.current) {
      labelInputRef.current.focus()
      labelInputRef.current.select()
    }
  }, [autoFocus])

  // Auto-resize textarea based on content
  useEffect(() => {
    if (labelInputRef.current) {
      const textarea = labelInputRef.current
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [label])

  const handleLabelChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newLabel = e.target.value
    setLabel(newLabel)
    setIsEditing(true)  // Mark as editing
    
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

  const handleLabelBlur = () => {
    setIsEditing(false)  // Mark editing as complete
  }

  const handleLabelFocus = () => {
    setIsEditing(true)  // Mark as editing when input is focused
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

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParentId = e.target.value || null
    setParentId(newParentId)
    if (selectedNode) {
      onNodeUpdate({
        id: selectedNode.id,
        parentId: newParentId,
      })
    }
  }

  // Get available parent nodes (subgraphs that are not the selected node itself or its descendants)
  const availableParents = allNodes.filter(node => {
    if (node.type !== 'subgraph' || node.id === selectedNode?.id) return false
    
    // Check if this node is a descendant of the selected node
    if (selectedNode?.type === 'subgraph') {
      let parent = node.parentId
      while (parent) {
        if (parent === selectedNode.id) return false // This node is a descendant
        parent = allNodes.find(n => n.id === parent)?.parentId
      }
    }
    
    return true
  })

  // Don't render if nothing is selected
  if (!selectedNode && !selectedEdge) {
    return null
  }

  return (
    <div
      data-testid="property-panel"
      className="property-panel fixed left-4 top-20 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10"
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
          <textarea
            ref={labelInputRef}
            id="label-input"
            value={label}
            onChange={handleLabelChange}
            onFocus={handleLabelFocus}
            onBlur={handleLabelBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
            style={{ minHeight: '2.5rem', maxHeight: '10rem' }}
            placeholder="Enter label (supports line breaks)"
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
            disabled={selectedNode && selectedNode.type === 'subgraph'}
          >
            {selectedNode
              ? MERMAID_NODE_TYPES
                  .filter(type => {
                    // If current node is subgraph, only show subgraph
                    if (selectedNode.type === 'subgraph') return type === 'subgraph'
                    // If current node is not subgraph, exclude subgraph from options
                    return type !== 'subgraph'
                  })
                  .map((type) => (
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

        {/* Parent selector - show for all nodes */}
        {selectedNode && (
          <div>
            <label htmlFor="parent-select" className="block text-sm font-medium text-gray-700 mb-1">
              Parent Subgraph
            </label>
            <select
              id="parent-select"
              value={parentId || ''}
              onChange={handleParentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {availableParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}