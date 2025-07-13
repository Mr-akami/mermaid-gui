export interface FlowchartNode {
  id: string;
  label: string;
  shape: 
    | 'rectangle'
    | 'rhombus'
    | 'round'
    | 'stadium'
    | 'cylinder'
    | 'circle'
    | 'asymmetric'
    | 'hexagon'
    | 'parallelogram'
    | 'parallelogram-alt'
    | 'trapezoid'
    | 'trapezoid-alt'
    | 'double-circle';
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: 'solid' | 'dotted' | 'thick';
}

export interface FlowchartOptions {
  direction?: 'TD' | 'LR' | 'BT' | 'RL';
}

const SHAPE_SYNTAX: Record<FlowchartNode['shape'], (label: string) => string> = {
  'rectangle': (label) => `[${label}]`,
  'rhombus': (label) => `{${label}}`,
  'round': (label) => `(${label})`,
  'stadium': (label) => `([${label}])`,
  'cylinder': (label) => `[(${label})]`,
  'circle': (label) => `((${label}))`,
  'asymmetric': (label) => `>${label}]`,
  'hexagon': (label) => `{{${label}}}`,
  'parallelogram': (label) => `[/${label}/]`,
  'parallelogram-alt': (label) => `[\\\\${label}\\\\]`,
  'trapezoid': (label) => `[/${label}\\\\]`,
  'trapezoid-alt': (label) => `[\\\\${label}/]`,
  'double-circle': (label) => `(((${label})))`
};

const EDGE_SYNTAX: Record<NonNullable<FlowchartEdge['style']> | 'default', string> = {
  'default': '-->',
  'solid': '-->',
  'dotted': '-.->',
  'thick': '==>'
};

export function generateFlowchartCode(
  nodes: FlowchartNode[],
  edges: FlowchartEdge[],
  options?: FlowchartOptions
): string {
  const direction = options?.direction || 'TD';
  const lines: string[] = [`flowchart ${direction}`];
  
  // Generate node definitions
  nodes.forEach(node => {
    const shapeRenderer = SHAPE_SYNTAX[node.shape];
    const nodeDefinition = `  ${node.id}${shapeRenderer(node.label)}`;
    lines.push(nodeDefinition);
  });
  
  // Generate edge definitions
  edges.forEach(edge => {
    const edgeStyle = EDGE_SYNTAX[edge.style || 'default'];
    const edgeLine = edge.label
      ? `  ${edge.source} ${edgeStyle}|${edge.label}| ${edge.target}`
      : `  ${edge.source} ${edgeStyle} ${edge.target}`;
    lines.push(edgeLine);
  });
  
  return lines.join('\n');
}