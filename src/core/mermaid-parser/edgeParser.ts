import type { Edge } from './deps'

export interface ParsedEdge {
  source: string
  target: string
  type: Edge['type']
  label?: string
}

export function parseEdge(line: string): ParsedEdge | null {
  const trimmedLine = line.trim()

  // Define edge patterns
  const edgePatterns = [
    { pattern: /^(\w+)\s*---\s*(\w+)$/, type: 'normal' as const },
    { pattern: /^(\w+)\s*-->\s*(\w+)$/, type: 'normal-arrow' as const },
    { pattern: /^(\w+)\s*===\s*(\w+)$/, type: 'thick' as const },
    { pattern: /^(\w+)\s*==>\s*(\w+)$/, type: 'thick-arrow' as const },
    { pattern: /^(\w+)\s*-\.-\s*(\w+)$/, type: 'dotted' as const },
    { pattern: /^(\w+)\s*-\.->\s*(\w+)$/, type: 'dotted-arrow' as const },
  ]

  // Define edge patterns with labels
  const edgeWithLabelPatterns = [
    {
      pattern: /^(\w+)\s*---\|((?:[^\\|]|\\.)*)\|\s*(\w+)$/,
      type: 'normal' as const,
    },
    {
      pattern: /^(\w+)\s*-->\|((?:[^\\|]|\\.)*)\|\s*(\w+)$/,
      type: 'normal-arrow' as const,
    },
    {
      pattern: /^(\w+)\s*===\|((?:[^\\|]|\\.)*)\|\s*(\w+)$/,
      type: 'thick' as const,
    },
    {
      pattern: /^(\w+)\s*==>\|((?:[^\\|]|\\.)*)\|\s*(\w+)$/,
      type: 'thick-arrow' as const,
    },
    {
      pattern: /^(\w+)\s*-\.-\|((?:[^\\|]|\\.)*)\|\s*(\w+)$/,
      type: 'dotted' as const,
    },
    {
      pattern: /^(\w+)\s*-\.->\|((?:[^\\|]|\\.)*)\|\s*(\w+)$/,
      type: 'dotted-arrow' as const,
    },
  ]

  // Try patterns with labels first
  for (const { pattern, type } of edgeWithLabelPatterns) {
    const match = trimmedLine.match(pattern)
    if (match) {
      return {
        source: match[1],
        target: match[3],
        type,
        label: unescapeEdgeLabel(match[2]),
      }
    }
  }

  // Try patterns without labels
  for (const { pattern, type } of edgePatterns) {
    const match = trimmedLine.match(pattern)
    if (match) {
      return {
        source: match[1],
        target: match[2],
        type,
        label: undefined,
      }
    }
  }

  // Not an edge declaration
  return null
}

function unescapeEdgeLabel(label: string): string {
  // Unescape special characters in edge labels
  return label.replace(/\\\|/g, '|')
}
