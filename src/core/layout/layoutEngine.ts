export interface GraphNode {
  id: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface LayoutOptions {
  direction?: 'TB' | 'TD' | 'LR' | 'BT' | 'RL'; // Top-Bottom/Top-Down, Left-Right, etc.
  nodeSpacing?: number;
  rankSpacing?: number;
}

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  direction: 'TB',
  nodeSpacing: 50,
  rankSpacing: 100
};

export function layoutNodes(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options?: LayoutOptions
): LayoutNode[] {
  if (nodes.length === 0) {
    return [];
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Build adjacency list
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  edges.forEach(edge => {
    adjacencyList.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });
  
  // Find connected components
  const components = findConnectedComponents(nodes, adjacencyList);
  
  // Layout each component
  const layoutResults: LayoutNode[] = [];
  let componentOffset = 0;
  
  components.forEach(component => {
    const componentLayout = layoutComponent(
      component,
      adjacencyList,
      inDegree,
      opts
    );
    
    // Apply component offset
    componentLayout.forEach(node => {
      if (opts.direction === 'TB' || opts.direction === 'BT') {
        node.x += componentOffset;
      } else {
        node.y += componentOffset;
      }
      layoutResults.push(node);
    });
    
    // Calculate next component offset
    const maxDimension = Math.max(
      ...component.map(node => 
        opts.direction === 'TB' || opts.direction === 'BT' 
          ? node.width 
          : node.height
      )
    );
    componentOffset += maxDimension + opts.rankSpacing;
  });
  
  return layoutResults;
}

function findConnectedComponents(
  nodes: GraphNode[],
  adjacencyList: Map<string, string[]>
): GraphNode[][] {
  const visited = new Set<string>();
  const components: GraphNode[][] = [];
  
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const component: GraphNode[] = [];
      dfs(node.id, visited, adjacencyList, nodes, component);
      components.push(component);
    }
  });
  
  return components;
}

function dfs(
  nodeId: string,
  visited: Set<string>,
  adjacencyList: Map<string, string[]>,
  nodes: GraphNode[],
  component: GraphNode[]
) {
  visited.add(nodeId);
  const node = nodes.find(n => n.id === nodeId);
  if (node) {
    component.push(node);
  }
  
  adjacencyList.get(nodeId)?.forEach(neighbor => {
    if (!visited.has(neighbor)) {
      dfs(neighbor, visited, adjacencyList, nodes, component);
    }
  });
}

function layoutComponent(
  nodes: GraphNode[],
  adjacencyList: Map<string, string[]>,
  inDegree: Map<string, number>,
  options: Required<LayoutOptions>
): LayoutNode[] {
  // Use topological sort to assign ranks
  const ranks = assignRanks(nodes, adjacencyList, inDegree);
  
  // Group nodes by rank
  const nodesByRank = new Map<number, GraphNode[]>();
  ranks.forEach((rank, nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      if (!nodesByRank.has(rank)) {
        nodesByRank.set(rank, []);
      }
      nodesByRank.get(rank)!.push(node);
    }
  });
  
  // Layout nodes
  const result: LayoutNode[] = [];
  let rankPosition = 0;
  
  const sortedRanks = Array.from(nodesByRank.keys()).sort((a, b) => a - b);
  
  sortedRanks.forEach(rank => {
    const nodesInRank = nodesByRank.get(rank)!;
    let nodePosition = 0;
    
    nodesInRank.forEach((node, _index) => {
      let x: number, y: number;
      
      switch (options.direction) {
        case 'TB':
        case 'TD':
          x = nodePosition;
          y = rankPosition;
          break;
        case 'BT':
          x = nodePosition;
          y = -rankPosition;
          break;
        case 'LR':
          x = rankPosition;
          y = nodePosition;
          break;
        case 'RL':
          x = -rankPosition;
          y = nodePosition;
          break;
      }
      
      result.push({ id: node.id, x, y });
      nodePosition += node.width + options.nodeSpacing;
    });
    
    rankPosition += options.rankSpacing;
  });
  
  // Center nodes in each rank
  centerNodesInRanks(result, nodesByRank, ranks, options);
  
  return result;
}

function assignRanks(
  nodes: GraphNode[],
  adjacencyList: Map<string, string[]>,
  inDegree: Map<string, number>
): Map<string, number> {
  const ranks = new Map<string, number>();
  const queue: string[] = [];
  
  // Start with nodes that have no incoming edges
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
      ranks.set(node.id, 0);
    }
  });
  
  // If no nodes with 0 in-degree (cycle), start with first node
  if (queue.length === 0 && nodes.length > 0) {
    queue.push(nodes[0].id);
    ranks.set(nodes[0].id, 0);
  }
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentRank = ranks.get(current) || 0;
    
    adjacencyList.get(current)?.forEach(neighbor => {
      if (!ranks.has(neighbor)) {
        ranks.set(neighbor, currentRank + 1);
        queue.push(neighbor);
      }
    });
  }
  
  // Handle any remaining nodes (disconnected or in cycles)
  nodes.forEach(node => {
    if (!ranks.has(node.id)) {
      ranks.set(node.id, 0);
    }
  });
  
  return ranks;
}

function centerNodesInRanks(
  layoutNodes: LayoutNode[],
  nodesByRank: Map<number, GraphNode[]>,
  _ranks: Map<string, number>,
  options: Required<LayoutOptions>
) {
  nodesByRank.forEach((nodesInRank, _rank) => {
    const nodeIds = nodesInRank.map(n => n.id);
    const rankNodes = layoutNodes.filter(n => nodeIds.includes(n.id));
    
    if (rankNodes.length === 0) return;
    
    // Calculate center offset
    const isVertical = options.direction === 'TB' || options.direction === 'TD' || options.direction === 'BT';
    const positions = rankNodes.map(n => isVertical ? n.x : n.y);
    const minPos = Math.min(...positions);
    const maxPos = Math.max(...positions);
    const centerOffset = -(maxPos + minPos) / 2;
    
    // Apply centering
    rankNodes.forEach(node => {
      if (isVertical) {
        node.x += centerOffset;
      } else {
        node.y += centerOffset;
      }
    });
  });
}