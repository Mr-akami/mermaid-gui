import React from 'react';
import { ConnectionLineComponentProps, getStraightPath, useNodes } from 'reactflow';
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

  // Calculate the source anchor point if in draw-line mode
  let sourceX = fromX;
  let sourceY = fromY;

  if (drawingMode === 'draw-line' && fromNode) {
    const sourceNode = nodes.find(n => n.id === fromNode.id);
    if (sourceNode) {
      const anchor = getEdgeAnchorPoint(sourceNode, { x: toX, y: toY });
      sourceX = anchor.x;
      sourceY = anchor.y;
    }
  }

  const [path] = getStraightPath({
    sourceX,
    sourceY,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path
        fill="none"
        stroke="#b1b1b7"
        strokeWidth={1.5}
        strokeDasharray="5,5"
        d={path}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        stroke="#b1b1b7"
        strokeWidth={1.5}
      />
    </g>
  );
};

export default CustomConnectionLine;