import type { Node } from './deps'

export function buildNodeCode(node: Node): string {
  const label = node.data.label || ' '
  const escapedLabel = escapeLabel(label)

  switch (node.type) {
    case 'rectangle':
      return `${node.id}[${escapedLabel}]`
    case 'circle':
      return `${node.id}((${escapedLabel}))`
    case 'diamond':
      return `${node.id}{${escapedLabel}}`
    case 'roundEdges':
      return `${node.id}(${escapedLabel})`
    case 'stadium':
      return `${node.id}([${escapedLabel}])`
    case 'subroutine':
      return `${node.id}[[${escapedLabel}]]`
    case 'cylindrical':
      return `${node.id}[(${escapedLabel})]`
    case 'parallelogram':
      return `${node.id}[/${escapedLabel}/]`
    case 'trapezoid':
      return `${node.id}[\\${escapedLabel}\\]`
    case 'hexagon':
      return `${node.id}{{${escapedLabel}}}`
    case 'doubleCircle':
      return `${node.id}(((${escapedLabel})))`
    case 'subgraph':
      return `subgraph ${node.id} [${escapedLabel}]`
    default:
      throw new Error(`Unknown node type: ${node.type}`)
  }
}

function escapeLabel(label: string): string {
  // Escape special characters for Mermaid
  return label
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}
