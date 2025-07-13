export interface ParsedNode {
  id: string;
  label: string;
  shape: string;
}

export interface ParsedEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style: 'solid' | 'dotted' | 'thick';
}

export interface ParsedFlowchart {
  direction: 'TD' | 'LR' | 'BT' | 'RL';
  nodes: ParsedNode[];
  edges: ParsedEdge[];
}

// Shape patterns mapping - order matters! More specific patterns first
const SHAPE_PATTERNS: Array<[RegExp, string]> = [
  [/^(\w+)\(\(\((.*?)\)\)\)$/, 'double-circle'],
  [/^(\w+)\(\[(.*?)\]\)$/, 'stadium'],
  [/^(\w+)\[\((.*?)\)\]$/, 'cylinder'],
  [/^(\w+)\(\((.*?)\)\)$/, 'circle'],
  [/^(\w+)\{\{(.*?)\}\}$/, 'hexagon'],
  [/^(\w+)\[\\\\(.*?)\\\\]$/, 'parallelogram-alt'],
  [/^(\w+)\[\/(.*?)\/\]$/, 'parallelogram'],
  [/^(\w+)\[\/(.*?)\\\\]$/, 'trapezoid'],
  [/^(\w+)\[\\\\(.*?)\/]$/, 'trapezoid-alt'],
  [/^(\w+)\[(.*?)\]$/, 'rectangle'],
  [/^(\w+)\{(.*?)\}$/, 'rhombus'],
  [/^(\w+)\((.*?)\)$/, 'round'],
  [/^(\w+)>(.*?)\]$/, 'asymmetric']
];

// Edge patterns
const EDGE_PATTERNS: Array<[RegExp, 'solid' | 'dotted' | 'thick']> = [
  [/-->/g, 'solid'],
  [/-\.->/g, 'dotted'],
  [/==>/g, 'thick']
];

export function parseFlowchartCode(code: string): ParsedFlowchart {
  const lines = code.split('\n').map(line => line.trim());
  const nodes: ParsedNode[] = [];
  const edges: ParsedEdge[] = [];
  const nodeMap = new Map<string, ParsedNode>();
  
  // Parse direction
  const firstLine = lines[0];
  const directionMatch = firstLine.match(/flowchart\s+(\w+)/);
  const direction = (directionMatch?.[1] || 'TD') as ParsedFlowchart['direction'];
  
  let edgeCounter = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines and comments
    if (!line || line.startsWith('%%')) {
      continue;
    }
    
    // Check if line contains edge definition
    let hasEdge = false;
    for (const [pattern] of EDGE_PATTERNS) {
      // Reset lastIndex for global regex
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        hasEdge = true;
        break;
      }
    }
    
    if (hasEdge) {
      // Parse edges and inline node definitions
      const edgesBefore = edges.length;
      parseEdgeLine(line, nodeMap, nodes, edges, edgeCounter);
      if (edges.length > edgesBefore) {
        edgeCounter++;
      }
    } else {
      // Parse standalone node definition
      const node = parseNode(line);
      if (node && !nodeMap.has(node.id)) {
        nodes.push(node);
        nodeMap.set(node.id, node);
      }
    }
  }
  
  return {
    direction,
    nodes,
    edges
  };
}

function parseNode(nodeStr: string): ParsedNode | null {
  const trimmed = nodeStr.trim();
  
  for (const [pattern, shape] of SHAPE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return {
        id: match[1],
        label: match[2].replace(/^"|"$/g, ''), // Remove surrounding quotes if present
        shape
      };
    }
  }
  
  return null;
}

function parseEdgeLine(
  line: string,
  nodeMap: Map<string, ParsedNode>,
  nodes: ParsedNode[],
  edges: ParsedEdge[],
  edgeCounter: number
) {
  // First, extract any inline node definitions
  // This pattern matches node definitions with various shapes
  const nodePattern = /(\w+)(\[.*?\]|\{.*?\}|\(+.*?\)+|>.*?\]|\{\{.*?\}\})/g;
  let nodeMatch;
  
  while ((nodeMatch = nodePattern.exec(line)) !== null) {
    const nodeStr = nodeMatch[0];
    const node = parseNode(nodeStr);
    if (node && !nodeMap.has(node.id)) {
      nodes.push(node);
      nodeMap.set(node.id, node);
    }
  }
  
  // Now parse the edge
  let edgeStyle: 'solid' | 'dotted' | 'thick' = 'solid';
  let edgePattern: RegExp | null = null;
  
  for (const [pattern, style] of EDGE_PATTERNS) {
    pattern.lastIndex = 0; // Reset for global regex
    if (pattern.test(line)) {
      edgeStyle = style;
      edgePattern = pattern;
      break;
    }
  }
  
  if (!edgePattern) return;
  
  // Parse edge with optional label
  // We need to handle edges that might have node definitions inline
  const edgeOperator = edgePattern.source.replace(/g$/, '');
  
  // Pattern for edges with labels
  const labeledEdgeRegex = new RegExp(
    `(\\w+)(?:\\[.*?\\]|\\{.*?\\}|\\(+.*?\\)+|>.*?\\]|\\{\\{.*?\\}\\})?\\s*${edgeOperator}\\s*\\|(.*?)\\|\\s*(\\w+)(?:\\[.*?\\]|\\{.*?\\}|\\(+.*?\\)+|>.*?\\]|\\{\\{.*?\\}\\})?`
  );
  
  // Pattern for edges without labels
  const unlabeledEdgeRegex = new RegExp(
    `(\\w+)(?:\\[.*?\\]|\\{.*?\\}|\\(+.*?\\)+|>.*?\\]|\\{\\{.*?\\}\\})?\\s*${edgeOperator}\\s*(\\w+)(?:\\[.*?\\]|\\{.*?\\}|\\(+.*?\\)+|>.*?\\]|\\{\\{.*?\\}\\})?`
  );
  
  let match = line.match(labeledEdgeRegex);
  if (match) {
    // Edge with label
    const source = match[1];
    const label = match[2];
    const target = match[3];
    
    // Create nodes if they don't exist
    ensureNode(source, nodeMap, nodes);
    ensureNode(target, nodeMap, nodes);
    
    edges.push({
      id: `e${edgeCounter}`,
      source,
      target,
      label,
      style: edgeStyle
    });
  } else {
    match = line.match(unlabeledEdgeRegex);
    if (match) {
      // Edge without label
      const source = match[1];
      const target = match[2];
      
      // Create nodes if they don't exist
      ensureNode(source, nodeMap, nodes);
      ensureNode(target, nodeMap, nodes);
      
      edges.push({
        id: `e${edgeCounter}`,
        source,
        target,
        style: edgeStyle
      });
    }
  }
}

function ensureNode(
  nodeId: string,
  nodeMap: Map<string, ParsedNode>,
  nodes: ParsedNode[]
) {
  if (!nodeMap.has(nodeId)) {
    const node: ParsedNode = {
      id: nodeId,
      label: nodeId,
      shape: 'rectangle'
    };
    nodes.push(node);
    nodeMap.set(nodeId, node);
  }
}