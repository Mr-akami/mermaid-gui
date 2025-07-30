import type { FlowchartData } from './deps'
import { buildNodeCode } from './nodeCodeBuilder'
import { buildEdgeCode } from './edgeCodeBuilder'
import { topologicalSort } from './topologicalSort'

export function buildFlowchartCode(data: FlowchartData, direction: 'TD' | 'TB' | 'LR' = 'TD'): string {
  const lines: string[] = [`flowchart ${direction}`]

  // Separate subgraphs from regular nodes
  const subgraphs = data.nodes.filter((node) => node.type === 'subgraph')
  const regularNodes = data.nodes.filter((node) => node.type !== 'subgraph')

  // Process subgraphs first
  subgraphs.forEach((subgraph) => {
    lines.push(`    ${buildNodeCode(subgraph)}`)

    // Process nodes within the subgraph using topological order
    const childNodes = regularNodes.filter(
      (node) => node.parentId === subgraph.id,
    )
    const subgraphEdges = data.edges.filter(
      (edge) => 
        childNodes.some(n => n.id === edge.source) && 
        childNodes.some(n => n.id === edge.target)
    )
    
    const orderedChildNodes = topologicalSort(childNodes, subgraphEdges)
    orderedChildNodes.forEach((node) => {
      lines.push(`        ${buildNodeCode(node)}`)
    })

    lines.push('    end')
  })

  // Process top-level nodes using topological order
  const topLevelNodes = regularNodes.filter((node) => !node.parentId)
  const topLevelEdges = data.edges.filter(
    (edge) => 
      topLevelNodes.some(n => n.id === edge.source) && 
      topLevelNodes.some(n => n.id === edge.target)
  )
  
  const orderedTopLevelNodes = topologicalSort(topLevelNodes, topLevelEdges)
  orderedTopLevelNodes.forEach((node) => {
    lines.push(`    ${buildNodeCode(node)}`)
  })

  // Process edges with & operator optimization
  const edgeGroups = groupEdgesWithAmpersand(data.edges)
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
function groupEdgesWithAmpersand(edges: FlowchartData['edges']): string[] {
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
    const canOptimize = 
      (group.sources.size > 1 || group.targets.size > 1) &&
      group.edges.length === group.sources.size * group.targets.size

    if (canOptimize) {
      // Build optimized edge with & operator
      const sources = Array.from(group.sources).join(' & ')
      const targets = Array.from(group.targets).join(' & ')
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
        result.push(buildEdgeCode(edge))
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
