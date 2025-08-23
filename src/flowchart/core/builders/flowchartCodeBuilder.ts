import type { IRFlowchartData, IRNode } from './deps'
import { buildNodeCode } from './nodeCodeBuilder'
import { buildEdgeCode } from './edgeCodeBuilder'
import { topologicalSort } from './topologicalSort'

export function buildFlowchartCode(data: IRFlowchartData, direction: 'TD' | 'TB' | 'LR' | 'RL' | 'BT' | 'DT' = 'TD'): string {
  const lines: string[] = [`flowchart ${direction}`]

  // Helper function to build subgraph declaration
  function buildSubgraphDeclaration(node: IRNode): string {
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
  function processNode(node: IRNode, indent: string = '    '): void {
    if (node.type === 'subgraph') {
      lines.push(`${indent}${buildSubgraphDeclaration(node)}`)
      
      // Add direction if specified
      if (node.direction) {
        lines.push(`${indent}direction ${node.direction}`)
      }
      
      // Find and process child nodes
      const childNodes = data.nodes.filter(n => n.parentId === node.id)
      
      // Use childIds order if available, otherwise use topological sort
      let orderedChildNodes: IRNode[]
      if (node.childIds && node.childIds.length > 0) {
        // Sort child nodes according to childIds order
        orderedChildNodes = node.childIds
          .map(childId => childNodes.find(n => n.id === childId))
          .filter((n): n is IRNode => n !== undefined)
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
        processNode(child, indent)
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
    processNode(node, '    ')
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
function groupEdgesWithAmpersand(edges: IRFlowchartData['edges'], nodeDisplayNames?: Map<string, string>): string[] {
  const result: string[] = []
  const processedEdges = new Set<typeof edges[0]>()
  
  // Try to detect patterns that can use & operator
  edges.forEach((edge) => {
    if (processedEdges.has(edge)) return
    
    const connector = getConnector(edge.type)
    const label = edge.data?.label
    
    // Find all edges with the same source and same type/label
    const sameSourceEdges = edges.filter(e => 
      !processedEdges.has(e) &&
      e.source === edge.source &&
      e.type === edge.type &&
      e.data?.label === label
    )
    
    // If we have multiple targets from the same source, check if they continue
    if (sameSourceEdges.length > 1) {
      // Get all targets
      const targets = sameSourceEdges.map(e => e.target)
      
      // For each target, check if it has continuation edges
      const continuations = new Map<string, typeof edges>()
      targets.forEach(target => {
        const nextEdges = edges.filter(e => 
          !processedEdges.has(e) &&
          e.source === target &&
          !sameSourceEdges.includes(e)
        )
        if (nextEdges.length > 0) {
          continuations.set(target, nextEdges)
        }
      })
      
      // Check if we can form a pattern like "a --> b & c --> d"
      // This means some targets have the same continuation
      if (continuations.size > 0) {
        // Group continuations by their target and type
        const continuationGroups = new Map<string, {
          type: typeof edges[0]['type']
          label?: string
          sources: string[]
          target: string
        }>()
        
        continuations.forEach((nextEdges, source) => {
          nextEdges.forEach(nextEdge => {
            const key = `${nextEdge.target}|${nextEdge.type}|${nextEdge.data?.label || ''}`
            if (!continuationGroups.has(key)) {
              continuationGroups.set(key, {
                type: nextEdge.type,
                label: nextEdge.data?.label,
                sources: [],
                target: nextEdge.target
              })
            }
            continuationGroups.get(key)!.sources.push(source)
          })
        })
        
        // Check if all targets continue to the same destination
        let hasSharedContinuation = false
        continuationGroups.forEach(group => {
          if (group.sources.length === targets.length) {
            // All targets continue to this destination
            hasSharedContinuation = true
            
            // Generate "a --> b & c --> d" pattern
            const source = nodeDisplayNames?.get(edge.source) || edge.source
            const targetList = targets.map(t => nodeDisplayNames?.get(t) || t).join(' & ')
            const finalTarget = nodeDisplayNames?.get(group.target) || group.target
            const nextConnector = getConnector(group.type)
            
            if (label) {
              const escapedLabel = escapeEdgeLabel(label)
              result.push(`${source} ${connector}|${escapedLabel}| ${targetList} ${nextConnector} ${finalTarget}`)
            } else {
              result.push(`${source} ${connector} ${targetList} ${nextConnector} ${finalTarget}`)
            }
            
            // Mark all involved edges as processed
            sameSourceEdges.forEach(e => processedEdges.add(e))
            continuations.forEach(nextEdges => {
              nextEdges.forEach(e => {
                if (e.target === group.target && e.type === group.type) {
                  processedEdges.add(e)
                }
              })
            })
          }
        })
        
        if (!hasSharedContinuation) {
          // Use simple & for multiple targets from same source
          const source = nodeDisplayNames?.get(edge.source) || edge.source
          const targetList = targets.map(t => nodeDisplayNames?.get(t) || t).join(' & ')
          
          if (label) {
            const escapedLabel = escapeEdgeLabel(label)
            result.push(`${source} ${connector}|${escapedLabel}| ${targetList}`)
          } else {
            result.push(`${source} ${connector} ${targetList}`)
          }
          
          sameSourceEdges.forEach(e => processedEdges.add(e))
        }
      } else {
        // Simple case: one source to multiple targets
        const source = nodeDisplayNames?.get(edge.source) || edge.source
        const targetList = targets.map(t => nodeDisplayNames?.get(t) || t).join(' & ')
        
        if (label) {
          const escapedLabel = escapeEdgeLabel(label)
          result.push(`${source} ${connector}|${escapedLabel}| ${targetList}`)
        } else {
          result.push(`${source} ${connector} ${targetList}`)
        }
        
        sameSourceEdges.forEach(e => processedEdges.add(e))
      }
    } else {
      // Single edge, can't optimize
      processedEdges.add(edge)
      
      if (nodeDisplayNames) {
        const source = nodeDisplayNames.get(edge.source) || edge.source
        const target = nodeDisplayNames.get(edge.target) || edge.target
        
        if (label) {
          const escapedLabel = escapeEdgeLabel(label)
          result.push(`${source} ${connector}|${escapedLabel}| ${target}`)
        } else {
          result.push(`${source} ${connector} ${target}`)
        }
      } else {
        result.push(buildEdgeCode(edge))
      }
    }
  })
  
  return result
}

function getConnector(type: IRFlowchartData['edges'][0]['type']): string {
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
