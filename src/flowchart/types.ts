export interface Node {
  id: string
  type: 'rectangle' | 'circle' | 'diamond' | 'roundEdges' | 'stadium' | 'subroutine' | 'cylindrical' | 'parallelogram' | 'trapezoid' | 'hexagon' | 'doubleCircle' | 'subgraph'
  parentId?: string
  childIds: string[]
  position: { x: number; y: number }
  data: {
    label: string
  }
  width?: number
  height?: number
  direction?: 'TD' | 'TB' | 'LR' | 'RL' | 'BT' | 'DT' // Direction for subgraphs
}

export interface Edge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type:
    | 'normal'
    | 'normal-arrow'
    | 'thick'
    | 'thick-arrow'
    | 'dotted'
    | 'dotted-arrow'
  data?: {
    label?: string
  }
}

export interface FlowchartData {
  nodes: Node[]
  edges: Edge[]
}

export interface MermaidParseResult {
  success: boolean
  data?: FlowchartData
  error?: string
}
