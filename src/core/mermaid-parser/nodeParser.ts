export interface ParsedNode {
  id: string
  type: 'rectangle' | 'circle' | 'diamond' | 'subgraph'
  label: string
}

export function parseNode(line: string): ParsedNode | null {
  const trimmedLine = line.trim()

  // Parse subgraph declaration with optional label
  // First try with label in brackets
  const subgraphWithLabelMatch = trimmedLine.match(/^subgraph\s+([\w\-]+)\s*\[([^\]]*)\]/)
  if (subgraphWithLabelMatch) {
    return {
      id: subgraphWithLabelMatch[1],
      type: 'subgraph',
      label: subgraphWithLabelMatch[2],
    }
  }
  
  // Then try without label (just ID)
  const subgraphNoLabelMatch = trimmedLine.match(/^subgraph\s+([\w\-]+)\s*$/)
  if (subgraphNoLabelMatch) {
    return {
      id: subgraphNoLabelMatch[1],
      type: 'subgraph',
      label: subgraphNoLabelMatch[1], // Use ID as label
    }
  }

  // Parse rectangle node
  const rectangleMatch = trimmedLine.match(/^(\w+)\[((?:[^\\\]]|\\.)*)\]$/)
  if (rectangleMatch) {
    return {
      id: rectangleMatch[1],
      type: 'rectangle',
      label: unescapeLabel(rectangleMatch[2].trim()),
    }
  }

  // Check for incomplete rectangle node (missing closing bracket)
  if (trimmedLine.match(/^(\w+)\[([^\]]*)?$/)) {
    throw new Error(`Incomplete node declaration: ${trimmedLine}`)
  }

  // Parse circle node
  const circleMatch = trimmedLine.match(/^(\w+)\(\(([^)]*)\)\)$/)
  if (circleMatch) {
    return {
      id: circleMatch[1],
      type: 'circle',
      label: unescapeLabel(circleMatch[2]),
    }
  }

  // Parse diamond node
  const diamondMatch = trimmedLine.match(/^(\w+)\{([^}]*)\}$/)
  if (diamondMatch) {
    return {
      id: diamondMatch[1],
      type: 'diamond',
      label: unescapeLabel(diamondMatch[2]),
    }
  }

  // Not a node declaration
  return null
}

function unescapeLabel(label: string): string {
  // Unescape special characters
  return label
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
}
