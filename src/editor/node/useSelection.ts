import { useMemo } from 'react'
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react'
import { toCustomNode, toCustomEdge } from '../../flowchart/converters'

export function useSelection(nodes: ReactFlowNode[], edges: ReactFlowEdge[]) {
  const selectedNode = useMemo(() => {
    const selected = nodes.find((node) => node.selected)
    if (selected) {
      return toCustomNode(selected)
    }
    return null
  }, [nodes])

  const selectedEdge = useMemo(() => {
    // Only return selected edge if no node is selected (node selection takes precedence)
    if (selectedNode) {
      return null
    }
    
    const selected = edges.find((edge) => edge.selected)
    if (selected) {
      return toCustomEdge(selected)
    }
    return null
  }, [edges, selectedNode])

  return {
    selectedNode,
    selectedEdge,
  }
}