import React, { useCallback } from 'react';
import { FileUp } from 'lucide-react';
import { useSetAtom, useAtomValue } from 'jotai';
import { nodesAtom, edgesAtom } from '@/store/flowStore';
import { mermaidCodeAtom } from '@/store/flowStore';
import { parseFlowchartCode } from '@/core/parsers/flowchartParser';
import { layoutNodes } from '@/core/layout/layoutEngine';
import { Node, Edge } from 'reactflow';

export const MermaidImportButton: React.FC = () => {
  const setNodes = useSetAtom(nodesAtom);
  const setEdges = useSetAtom(edgesAtom);
  const mermaidCode = useAtomValue(mermaidCodeAtom);

  const importFromMermaid = useCallback(() => {
    try {
      // Parse the Mermaid code
      const parsed = parseFlowchartCode(mermaidCode);
      
      // Convert parsed nodes to layout engine format
      const layoutInput = parsed.nodes.map(node => ({
        id: node.id,
        width: 150, // Default width
        height: 50, // Default height
      }));

      // Convert parsed edges to layout engine format
      const layoutEdges = parsed.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      }));

      // Apply layout algorithm
      const layoutResult = layoutNodes(layoutInput, layoutEdges, {
        direction: parsed.direction,
        nodeSpacing: 50,
        rankSpacing: 100,
      });

      // Convert to React Flow nodes
      const flowNodes: Node[] = parsed.nodes.map(node => {
        const layout = layoutResult.find(l => l.id === node.id);
        return {
          id: node.id,
          type: 'flowchart',
          position: layout ? { x: layout.x, y: layout.y } : { x: 0, y: 0 },
          data: {
            label: node.label,
            shape: node.shape === 'double-circle' ? 'doubleCircle' : node.shape,
          },
        };
      });

      // Convert to React Flow edges
      const flowEdges: Edge[] = parsed.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'flowchart',
        data: {
          label: edge.label || '',
          style: edge.style,
        },
      }));

      // Update the flow
      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error('Failed to import Mermaid code:', error);
      alert('Failed to parse Mermaid code. Please check the syntax.');
    }
  }, [mermaidCode, setNodes, setEdges]);

  return (
    <button
      onClick={importFromMermaid}
      className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
      title="Import from Mermaid code"
    >
      <FileUp size={16} />
      <span className="text-sm">Import</span>
    </button>
  );
};