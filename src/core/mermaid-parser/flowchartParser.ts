import type { FlowchartData, Node, Edge, MermaidParseResult } from './deps'
import { nanoid } from './deps'
import { parseNode } from './nodeParser'
import { parseEdge } from './edgeParser'

export function parseFlowchart(code: string): MermaidParseResult {
  try {
    const lines = code
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length === 0 || !lines[0].startsWith('flowchart')) {
      return {
        success: false,
        error:
          'Invalid syntax: Flowchart must start with "flowchart" directive',
      }
    }

    const nodes: Node[] = []
    const edges: Edge[] = []
    const nodeMap = new Map<string, Node>()
    const subgraphStack: Node[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]

      // Handle end of subgraph
      if (line === 'end') {
        subgraphStack.pop()
        continue
      }

      // Try to parse as node
      try {
        const parsedNode = parseNode(line)
        if (parsedNode) {
          const node: Node = {
            id: parsedNode.id,
            type: parsedNode.type,
            parentId:
              subgraphStack.length > 0
                ? subgraphStack[subgraphStack.length - 1].id
                : undefined,
            childIds: [],
            position: { x: 0, y: 0 }, // Position will be determined by layout engine
            data: { label: parsedNode.label },
          }

          nodes.push(node)
          nodeMap.set(node.id, node)

          // Update parent's childIds
          if (node.parentId) {
            const parent = nodeMap.get(node.parentId)
            if (parent) {
              parent.childIds.push(node.id)
            }
          }

          // If it's a subgraph, add to stack
          if (node.type === 'subgraph') {
            subgraphStack.push(node)
          }

          continue
        }
      } catch (error) {
        // Node parsing error, rethrow to be caught by outer try-catch
        throw error
      }

      // Try to parse as edge
      const parsedEdge = parseEdge(line)
      if (parsedEdge) {
        const edge: Edge = {
          id: nanoid(),
          source: parsedEdge.source,
          target: parsedEdge.target,
          type: parsedEdge.type,
          data: parsedEdge.label ? { label: parsedEdge.label } : undefined,
        }

        edges.push(edge)
        continue
      }

      // If neither node nor edge, skip (could be comments or empty lines)
    }

    return {
      success: true,
      data: { nodes, edges },
    }
  } catch (error) {
    return {
      success: false,
      error: `Invalid syntax: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}
