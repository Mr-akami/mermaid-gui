import React, { useMemo } from 'react';
import { ConnectionLineComponentProps, getStraightPath, useNodes, Node } from 'reactflow';
import { useAtomValue } from 'jotai';
import { drawingModeAtom } from '../store/drawingStore';
import { getEdgeAnchorPoint } from '../utils/edgeUtils';

const CustomConnectionLine: React.FC<ConnectionLineComponentProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  fromNode,
}) => {
  const drawingMode = useAtomValue(drawingModeAtom);
  const nodes = useNodes();

  // Find if we're hovering over a target node
  const targetNode = useMemo(() => {
    return nodes.find((node: Node) => {
      const nodeWidth = node.width || 150;
      const nodeHeight = node.height || 50;
      const nodeLeft = node.position.x;
      const nodeRight = node.position.x + nodeWidth;
      const nodeTop = node.position.y;
      const nodeBottom = node.position.y + nodeHeight;
      
      // Check if mouse is within node bounds (with some margin)
      const margin = 30;
      return toX >= nodeLeft - margin && 
             toX <= nodeRight + margin && 
             toY >= nodeTop - margin && 
             toY <= nodeBottom + margin &&
             node.id !== fromNode?.id;
    });
  }, [nodes, toX, toY, fromNode]);

  // Calculate anchor points
  let sourceX = fromX;
  let sourceY = fromY;
  let targetX = toX;
  let targetY = toY;

  if (drawingMode === 'draw-line' && fromNode) {
    const sourceNode = nodes.find(n => n.id === fromNode.id);
    if (sourceNode) {
      const anchor = getEdgeAnchorPoint(sourceNode, { x: targetX, y: targetY });
      sourceX = anchor.x;
      sourceY = anchor.y;
    }
    
    // If hovering over a target node, snap to its edge
    if (targetNode) {
      const targetAnchor = getEdgeAnchorPoint(targetNode, { x: sourceX, y: sourceY });
      targetX = targetAnchor.x;
      targetY = targetAnchor.y;
    }
  }

  const [path] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <g>
      <path
        fill="none"
        stroke={targetNode ? "#3b82f6" : "#b1b1b7"}
        strokeWidth={targetNode ? 2.5 : 1.5}
        strokeDasharray={targetNode ? "none" : "5,5"}
        d={path}
      />
      {/* Show anchor point indicator */}
      {targetNode && (
        <circle
          cx={targetX}
          cy={targetY}
          fill="#3b82f6"
          r={6}
          stroke="#fff"
          strokeWidth={2}
        />
      )}
      {/* Mouse position indicator */}
      {!targetNode && (
        <circle
          cx={toX}
          cy={toY}
          fill="#fff"
          r={3}
          stroke="#b1b1b7"
          strokeWidth={1.5}
        />
      )}
    </g>
  );
};

export default CustomConnectionLine;