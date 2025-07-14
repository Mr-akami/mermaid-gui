import React, { useCallback } from 'react';
import { GitBranchPlus } from 'lucide-react';
import { useAtom, useAtomValue } from 'jotai';
import { nodesAtom, edgesAtom } from '@/store/flowStore';
import { diagramTypeAtom } from '@/store/diagramStore';
import { layoutNodes } from '@/core/layout/layoutEngine';

export const LayoutButton: React.FC = () => {
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [edges] = useAtom(edgesAtom);
  const diagramType = useAtomValue(diagramTypeAtom);

  const applyLayout = useCallback(() => {
    if (nodes.length === 0) return;

    // Convert React Flow nodes to layout engine format
    const layoutInput = nodes.map(node => ({
      id: node.id,
      width: 150, // Default width, could be calculated from actual node
      height: 50, // Default height
    }));

    // Convert React Flow edges to layout engine format
    const layoutEdges = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    }));

    // Apply layout algorithm
    const layoutResult = layoutNodes(layoutInput, layoutEdges, {
      direction: diagramType === 'flowchart' ? 'TB' : 'LR',
      nodeSpacing: 50,
      rankSpacing: 100,
    });

    // Update node positions
    setNodes(currentNodes => 
      currentNodes.map(node => {
        const layout = layoutResult.find(l => l.id === node.id);
        if (layout) {
          return {
            ...node,
            position: { x: layout.x, y: layout.y },
          };
        }
        return node;
      })
    );
  }, [nodes, edges, diagramType, setNodes]);

  return (
    <button
      onClick={applyLayout}
      className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
      title="Apply automatic layout"
    >
      <GitBranchPlus size={16} />
      <span className="text-sm">Auto Layout</span>
    </button>
  );
};