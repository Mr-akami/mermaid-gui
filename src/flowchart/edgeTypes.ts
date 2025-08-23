// Mermaid edge types definition
export const MERMAID_EDGE_TYPES = [
  'normal',
  'normal-arrow',
  'thick',
  'thick-arrow',
  'dotted',
  'dotted-arrow',
] as const

export type MermaidEdgeType = typeof MERMAID_EDGE_TYPES[number]

// Edge type configuration
export const EDGE_TYPE_CONFIG: Record<MermaidEdgeType, {
  label: string
  hasArrow: boolean
  style: 'normal' | 'thick' | 'dotted'
}> = {
  'normal': { 
    label: 'Normal', 
    hasArrow: false,
    style: 'normal'
  },
  'normal-arrow': { 
    label: 'Normal Arrow', 
    hasArrow: true,
    style: 'normal'
  },
  'thick': { 
    label: 'Thick', 
    hasArrow: false,
    style: 'thick'
  },
  'thick-arrow': { 
    label: 'Thick Arrow', 
    hasArrow: true,
    style: 'thick'
  },
  'dotted': { 
    label: 'Dotted', 
    hasArrow: false,
    style: 'dotted'
  },
  'dotted-arrow': { 
    label: 'Dotted Arrow', 
    hasArrow: true,
    style: 'dotted'
  },
}