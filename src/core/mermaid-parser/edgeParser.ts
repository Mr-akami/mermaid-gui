import type { Edge } from './deps'

export interface ParsedEdge {
  source?: string
  target?: string
  sources?: string[]
  targets?: string[]
  type: Edge['type']
  label?: string
}

export function parseEdge(line: string): ParsedEdge | null {
  const trimmedLine = line.trim()

  // Helper function to parse node lists with & operator
  const parseNodeList = (nodeString: string): string[] => {
    return nodeString.split('&').map(node => node.trim())
  }

  // Define edge patterns with & operator support
  const edgePatterns = [
    { pattern: /^([\w\s&]+)\s*---\s*([\w\s&]+)$/, type: 'normal' as const },
    { pattern: /^([\w\s&]+)\s*-->\s*([\w\s&]+)$/, type: 'normal-arrow' as const },
    { pattern: /^([\w\s&]+)\s*===\s*([\w\s&]+)$/, type: 'thick' as const },
    { pattern: /^([\w\s&]+)\s*==>\s*([\w\s&]+)$/, type: 'thick-arrow' as const },
    { pattern: /^([\w\s&]+)\s*-\.-\s*([\w\s&]+)$/, type: 'dotted' as const },
    { pattern: /^([\w\s&]+)\s*-\.->\s*([\w\s&]+)$/, type: 'dotted-arrow' as const },
  ]

  // Define edge patterns with labels
  const edgeWithLabelPatterns = [
    {
      pattern: /^([\w\s&]+)\s*---\|((?:[^\\|]|\\.)*)\|\s*([\w\s&]+)$/,
      type: 'normal' as const,
    },
    {
      pattern: /^([\w\s&]+)\s*-->\|((?:[^\\|]|\\.)*)\|\s*([\w\s&]+)$/,
      type: 'normal-arrow' as const,
    },
    {
      pattern: /^([\w\s&]+)\s*===\|((?:[^\\|]|\\.)*)\|\s*([\w\s&]+)$/,
      type: 'thick' as const,
    },
    {
      pattern: /^([\w\s&]+)\s*==>\|((?:[^\\|]|\\.)*)\|\s*([\w\s&]+)$/,
      type: 'thick-arrow' as const,
    },
    {
      pattern: /^([\w\s&]+)\s*-\.-\|((?:[^\\|]|\\.)*)\|\s*([\w\s&]+)$/,
      type: 'dotted' as const,
    },
    {
      pattern: /^([\w\s&]+)\s*-\.->\|((?:[^\\|]|\\.)*)\|\s*([\w\s&]+)$/,
      type: 'dotted-arrow' as const,
    },
  ]

  // Try patterns with labels first
  for (const { pattern, type } of edgeWithLabelPatterns) {
    const match = trimmedLine.match(pattern)
    if (match) {
      const sources = parseNodeList(match[1])
      const targets = parseNodeList(match[3])
      
      // If single source and target, use old format for backward compatibility
      if (sources.length === 1 && targets.length === 1) {
        return {
          source: sources[0],
          target: targets[0],
          type,
          label: unescapeEdgeLabel(match[2]),
        }
      }
      
      return {
        sources,
        targets,
        type,
        label: unescapeEdgeLabel(match[2]),
      }
    }
  }

  // Try patterns without labels
  for (const { pattern, type } of edgePatterns) {
    const match = trimmedLine.match(pattern)
    if (match) {
      const sources = parseNodeList(match[1])
      const targets = parseNodeList(match[2])
      
      // If single source and target, use old format for backward compatibility
      if (sources.length === 1 && targets.length === 1) {
        return {
          source: sources[0],
          target: targets[0],
          type,
          label: undefined,
        }
      }
      
      return {
        sources,
        targets,
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
