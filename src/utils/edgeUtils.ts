import { Node } from 'reactflow';

export interface EdgeAnchorPoint {
  x: number;
  y: number;
}

// Calculate the intersection point between a line from source to target and the node boundary
export function getEdgeAnchorPoint(
  node: Node,
  targetPoint: { x: number; y: number }
): EdgeAnchorPoint {
  const nodeWidth = node.width || 150;
  const nodeHeight = node.height || 50;
  
  // Node center
  const nodeCenterX = node.position.x + nodeWidth / 2;
  const nodeCenterY = node.position.y + nodeHeight / 2;
  
  // Direction from node center to target
  const dx = targetPoint.x - nodeCenterX;
  const dy = targetPoint.y - nodeCenterY;
  
  // Handle edge cases
  if (dx === 0 && dy === 0) {
    return { x: nodeCenterX, y: nodeCenterY };
  }
  
  // Calculate angle
  const angle = Math.atan2(dy, dx);
  
  // For different shapes, calculate the edge point differently
  switch (node.data?.shape) {
    case 'circle':
    case 'doubleCircle': {
      const radius = nodeWidth / 2;
      return {
        x: nodeCenterX + radius * Math.cos(angle),
        y: nodeCenterY + radius * Math.sin(angle),
      };
    }
    
    case 'rhombus': {
      // For rhombus, we need to handle the diamond shape
      const halfWidth = nodeWidth / 2;
      const halfHeight = nodeHeight / 2;
      
      // Convert angle to 0-2π range
      const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      
      // Determine which edge the line intersects
      const angleToCorner1 = Math.atan2(halfHeight, halfWidth);
      const angleToCorner2 = Math.PI - angleToCorner1;
      const angleToCorner3 = Math.PI + angleToCorner1;
      const angleToCorner4 = 2 * Math.PI - angleToCorner1;
      
      let intersectX: number;
      let intersectY: number;
      
      if (normalizedAngle < angleToCorner1 || normalizedAngle >= angleToCorner4) {
        // Right edge
        intersectX = halfWidth;
        intersectY = halfWidth * Math.tan(angle);
      } else if (normalizedAngle < angleToCorner2) {
        // Top edge
        intersectY = halfHeight;
        intersectX = halfHeight / Math.tan(angle);
      } else if (normalizedAngle < angleToCorner3) {
        // Left edge
        intersectX = -halfWidth;
        intersectY = -halfWidth * Math.tan(angle);
      } else {
        // Bottom edge
        intersectY = -halfHeight;
        intersectX = -halfHeight / Math.tan(angle);
      }
      
      return {
        x: nodeCenterX + intersectX,
        y: nodeCenterY + intersectY,
      };
    }
    
    default: {
      // Rectangle and other shapes
      const halfWidth = nodeWidth / 2;
      const halfHeight = nodeHeight / 2;
      
      // Calculate which edge the line from center to target intersects
      const slope = dy / dx;
      
      let intersectX: number;
      let intersectY: number;
      
      // Check intersection with each edge
      if (Math.abs(slope) <= halfHeight / halfWidth) {
        // Intersects with left or right edge
        if (dx > 0) {
          // Right edge
          intersectX = halfWidth;
          intersectY = halfWidth * slope;
        } else {
          // Left edge
          intersectX = -halfWidth;
          intersectY = -halfWidth * slope;
        }
      } else {
        // Intersects with top or bottom edge
        if (dy > 0) {
          // Bottom edge
          intersectY = halfHeight;
          intersectX = halfHeight / slope;
        } else {
          // Top edge
          intersectY = -halfHeight;
          intersectX = -halfHeight / slope;
        }
      }
      
      return {
        x: nodeCenterX + intersectX,
        y: nodeCenterY + intersectY,
      };
    }
  }
}

// Get the anchor points for both source and target nodes
export function getEdgeAnchors(
  sourceNode: Node,
  targetNode: Node
): { source: EdgeAnchorPoint; target: EdgeAnchorPoint } {
  const targetCenter = {
    x: targetNode.position.x + (targetNode.width || 150) / 2,
    y: targetNode.position.y + (targetNode.height || 50) / 2,
  };
  
  const sourceCenter = {
    x: sourceNode.position.x + (sourceNode.width || 150) / 2,
    y: sourceNode.position.y + (sourceNode.height || 50) / 2,
  };
  
  return {
    source: getEdgeAnchorPoint(sourceNode, targetCenter),
    target: getEdgeAnchorPoint(targetNode, sourceCenter),
  };
}