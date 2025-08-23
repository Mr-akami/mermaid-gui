// Mermaid node types definition
export const MERMAID_NODE_TYPES = [
  'rectangle',
  'circle',
  'diamond',
  'roundEdges',
  'stadium',
  'subroutine',
  'cylindrical',
  'parallelogram',
  'trapezoid',
  'hexagon',
  'doubleCircle',
  'subgraph',
] as const

export type MermaidNodeType = typeof MERMAID_NODE_TYPES[number]

// Node type configuration for React Flow
export const NODE_TYPE_CONFIG: Record<MermaidNodeType, {
  defaultLabel: string
}> = {
  rectangle: { defaultLabel: 'Rectangle' },
  circle: { defaultLabel: 'Circle' },
  diamond: { defaultLabel: 'Diamond' },
  roundEdges: { defaultLabel: 'Round Edges' },
  stadium: { defaultLabel: 'Stadium' },
  subroutine: { defaultLabel: 'Subroutine' },
  cylindrical: { defaultLabel: 'Cylindrical' },
  parallelogram: { defaultLabel: 'Parallelogram' },
  trapezoid: { defaultLabel: 'Trapezoid' },
  hexagon: { defaultLabel: 'Hexagon' },
  doubleCircle: { defaultLabel: 'Double Circle' },
  subgraph: { defaultLabel: 'Subgraph' },
}