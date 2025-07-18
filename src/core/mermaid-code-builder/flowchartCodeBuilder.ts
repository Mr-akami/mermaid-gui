import type { FlowchartData, Node } from './deps';
import { buildNodeCode } from './nodeCodeBuilder';
import { buildEdgeCode } from './edgeCodeBuilder';

export function buildFlowchartCode(data: FlowchartData): string {
  const lines: string[] = ['flowchart TD'];
  
  // Separate subgraphs from regular nodes
  const subgraphs = data.nodes.filter(node => node.type === 'subgraph');
  const regularNodes = data.nodes.filter(node => node.type !== 'subgraph');
  
  // Process top-level nodes (nodes without parent)
  const topLevelNodes = regularNodes.filter(node => !node.parentId);
  
  // Process subgraphs
  subgraphs.forEach(subgraph => {
    lines.push(`    ${buildNodeCode(subgraph)}`);
    
    // Process nodes within the subgraph
    const childNodes = regularNodes.filter(node => node.parentId === subgraph.id);
    childNodes.forEach(node => {
      lines.push(`        ${buildNodeCode(node)}`);
    });
    
    lines.push('    end');
  });
  
  // Process top-level nodes
  topLevelNodes.forEach(node => {
    lines.push(`    ${buildNodeCode(node)}`);
  });
  
  // Process edges
  data.edges.forEach(edge => {
    lines.push(`    ${buildEdgeCode(edge)}`);
  });
  
  // Handle empty flowchart
  if (lines.length === 1) {
    return 'flowchart TD';
  }
  
  return lines.join('\n');
}