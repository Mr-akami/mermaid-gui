export interface Node {
  id: string
  type: 'rectangle' | 'circle' | 'diamond' | 'subgraph'
  parentId?: string
  childIds: string[]
  position: { x: number; y: number }
  data: {
    label: string
  }
  width?: number
  height?: number
}

export interface Edge {
  id: string
  source: string
  target: string
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
