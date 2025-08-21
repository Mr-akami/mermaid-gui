import type { FlowchartData, Node } from './deps'
import { buildNodeCode } from './nodeCodeBuilder'
import { buildEdgeCode } from './edgeCodeBuilder'
import { topologicalSort } from './topologicalSort'

export function buildFlowchartCode(data: FlowchartData, direction: 'TD' | 'TB' | 'LR' | 'RL' | 'BT' | 'DT' = 'TD'): string {
  const lines: string[] = [`flowchart ${direction}`]

  // Helper function to build subgraph declaration
  function buildSubgraphDeclaration(node: Node): string {
    const label = node.data.label || 'Subgraph'
    // Convert newlines to <br> in subgraph labels
    const processedLabel = label.replace(/\n/g, '<br>')
    // If node.id is a generic subgraph ID pattern, just use the label
    if (node.id.match(/^(subgraph|sg)\d+$/) || node.id === processedLabel.toLowerCase()) {
      return `subgraph ${processedLabel}`
    }
    // Otherwise, use id [label] format
    return `subgraph ${node.id} [${processedLabel}]`
  }

  // Process nodes recursively with proper indentation
  function processNode(node: Node, indent: string = '    '): void {
    if (node.type === 'subgraph') {
      lines.push(`${indent}${buildSubgraphDeclaration(node)}`)
      
      // Find and process child nodes
      const childNodes = data.nodes.filter(n => n.parentId === node.id)
      
      // Use childIds order if available, otherwise use topological sort
      let orderedChildNodes: Node[]
      if (node.childIds && node.childIds.length > 0) {
        // Sort child nodes according to childIds order
        orderedChildNodes = node.childIds
          .map(childId => childNodes.find(n => n.id === childId))
          .filter((n): n is Node => n !== undefined)
      } else {
        orderedChildNodes = topologicalSort(
          childNodes, 
          data.edges.filter(e => 
            childNodes.some(n => n.id === e.source) && 
            childNodes.some(n => n.id === e.target)
          )
        )
      }
      
      orderedChildNodes.forEach(child => {
        processNode(child, '    ')
      })
      
      lines.push(`${indent}end`)
    } else {
      lines.push(`${indent}${buildNodeCode(node)}`)
    }
  }

  // Process all top-level nodes (nodes without parents)
  const topLevelNodes = data.nodes.filter(node => !node.parentId)
  const orderedTopLevelNodes = topologicalSort(
    topLevelNodes,
    data.edges.filter(e => 
      topLevelNodes.some(n => n.id === e.source) && 
      topLevelNodes.some(n => n.id === e.target)
    )
  )

  orderedTopLevelNodes.forEach(node => {
    processNode(node)
  })

  // Create a mapping of node IDs to their display names for subgraphs
  const nodeDisplayNames = new Map<string, string>()
  data.nodes.forEach(node => {
    if (node.type === 'subgraph') {
      const label = node.data.label || 'Subgraph'
      // Use just the label if it's a generic subgraph ID
      if (node.id.match(/^subgraph\d+$/) || node.id === label.toLowerCase()) {
        nodeDisplayNames.set(node.id, label)
      } else {
        nodeDisplayNames.set(node.id, node.id)
      }
    } else {
      nodeDisplayNames.set(node.id, node.id)
    }
  })

  // Process edges with & operator optimization
  const edgeGroups = groupEdgesWithAmpersand(data.edges, nodeDisplayNames)
  edgeGroups.forEach((group) => {
    lines.push(`    ${group}`)
  })

  // Handle empty flowchart
  if (lines.length === 1) {
    return `flowchart ${direction}`
  }

  return lines.join('\n')
}


// Group edges that can use & operator
function groupEdgesWithAmpersand(edges: FlowchartData['edges'], nodeDisplayNames?: Map<string, string>): string[] {
  // Group by connector type and label
  const groups = new Map<string, {
    type: typeof edges[0]['type']
    label?: string
    sources: Set<string>
    targets: Set<string>
    edges: typeof edges
  }>()

  edges.forEach((edge) => {
    const key = `${edge.type}|${edge.data?.label || ''}`
    
    if (!groups.has(key)) {
      groups.set(key, {
        type: edge.type,
        label: edge.data?.label,
        sources: new Set(),
        targets: new Set(),
        edges: []
      })
    }
    
    const group = groups.get(key)!
    group.sources.add(edge.source)
    group.targets.add(edge.target)
    group.edges.push(edge)
  })

  const result: string[] = []

  groups.forEach((group) => {
    // Check if we can optimize with & operator
    // For now, disable optimization to match expected test output
    const canOptimize = false

    if (canOptimize) {
      // Build optimized edge with & operator
      const sources = Array.from(group.sources).map(id => nodeDisplayNames?.get(id) || id).join(' & ')
      const targets = Array.from(group.targets).map(id => nodeDisplayNames?.get(id) || id).join(' & ')
      const connector = getConnector(group.type)
      
      if (group.label) {
        const escapedLabel = escapeEdgeLabel(group.label)
        result.push(`${sources} ${connector}|${escapedLabel}| ${targets}`)
      } else {
        result.push(`${sources} ${connector} ${targets}`)
      }
    } else {
      // Can't optimize, use individual edges
      group.edges.forEach(edge => {
        if (nodeDisplayNames) {
          const source = nodeDisplayNames.get(edge.source) || edge.source
          const target = nodeDisplayNames.get(edge.target) || edge.target
          const connector = getConnector(edge.type)
          
          if (edge.data?.label) {
            const escapedLabel = escapeEdgeLabel(edge.data.label)
            result.push(`${source} ${connector}|${escapedLabel}| ${target}`)
          } else {
            result.push(`${source} ${connector} ${target}`)
          }
        } else {
          result.push(buildEdgeCode(edge))
        }
      })
    }
  })

  return result
}

function getConnector(type: FlowchartData['edges'][0]['type']): string {
  switch (type) {
    case 'normal':
      return '---'
    case 'normal-arrow':
      return '-->'
    case 'thick':
      return '==='
    case 'thick-arrow':
      return '==>'
    case 'dotted':
      return '-.-'
    case 'dotted-arrow':
      return '-.->'
    default:
      throw new Error(`Unknown edge type: ${type}`)
  }
}

function escapeEdgeLabel(label: string): string {
  return label.replace(/\|/g, '\\|')
}
