import type { Edge } from './deps'

export function buildEdgeCode(edge: Edge): string {
  const connector = getConnector(edge.type)

  if (edge.data?.label) {
    const escapedLabel = escapeEdgeLabel(edge.data.label)
    return `${edge.source} ${connector}|${escapedLabel}| ${edge.target}`
  }

  return `${edge.source} ${connector} ${edge.target}`
}

function getConnector(type: Edge['type']): string {
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
  // Escape special characters in Mermaid edge labels
  return label.replace(/\|/g, '\\|')
}
