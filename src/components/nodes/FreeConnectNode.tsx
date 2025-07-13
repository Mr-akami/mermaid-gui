import React, { useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface FreeConnectNodeData {
  label: string;
  shape: string;
}

// This component creates invisible handles around the perimeter of a node
// to enable connections from any point on the edge
export const FreeConnectNode: React.FC<NodeProps<FreeConnectNodeData>> = ({
  data,
  selected,
  id: _id
}) => {
  // Create multiple handles around the perimeter
  const handles = useMemo(() => {
    const handleCount = 8; // Number of handles per side
    const handles = [];
    
    // Top handles
    for (let i = 0; i < handleCount; i++) {
      const left = `${(i + 0.5) * (100 / handleCount)}%`;
      handles.push(
        <Handle
          key={`top-${i}`}
          type="target"
          position={Position.Top}
          id={`top-${i}`}
          style={{
            left,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            top: '-10px'
          }}
        />
      );
      handles.push(
        <Handle
          key={`top-source-${i}`}
          type="source"
          position={Position.Top}
          id={`top-source-${i}`}
          style={{
            left,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            top: '-10px'
          }}
        />
      );
    }
    
    // Bottom handles
    for (let i = 0; i < handleCount; i++) {
      const left = `${(i + 0.5) * (100 / handleCount)}%`;
      handles.push(
        <Handle
          key={`bottom-${i}`}
          type="target"
          position={Position.Bottom}
          id={`bottom-${i}`}
          style={{
            left,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            bottom: '-10px'
          }}
        />
      );
      handles.push(
        <Handle
          key={`bottom-source-${i}`}
          type="source"
          position={Position.Bottom}
          id={`bottom-source-${i}`}
          style={{
            left,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            bottom: '-10px'
          }}
        />
      );
    }
    
    // Left handles
    for (let i = 0; i < handleCount; i++) {
      const top = `${(i + 0.5) * (100 / handleCount)}%`;
      handles.push(
        <Handle
          key={`left-${i}`}
          type="target"
          position={Position.Left}
          id={`left-${i}`}
          style={{
            top,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            left: '-10px'
          }}
        />
      );
      handles.push(
        <Handle
          key={`left-source-${i}`}
          type="source"
          position={Position.Left}
          id={`left-source-${i}`}
          style={{
            top,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            left: '-10px'
          }}
        />
      );
    }
    
    // Right handles
    for (let i = 0; i < handleCount; i++) {
      const top = `${(i + 0.5) * (100 / handleCount)}%`;
      handles.push(
        <Handle
          key={`right-${i}`}
          type="target"
          position={Position.Right}
          id={`right-${i}`}
          style={{
            top,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            right: '-10px'
          }}
        />
      );
      handles.push(
        <Handle
          key={`right-source-${i}`}
          type="source"
          position={Position.Right}
          id={`right-source-${i}`}
          style={{
            top,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            right: '-10px'
          }}
        />
      );
    }
    
    return handles;
  }, []);

  const nodeStyle = useMemo(() => {
    const baseStyle = {
      padding: '10px 20px',
      borderRadius: '5px',
      backgroundColor: '#fff',
      border: selected ? '2px solid #4CAF50' : '2px solid #1a192b',
      fontSize: '14px',
      fontWeight: 500,
      minWidth: '150px',
      textAlign: 'center' as const,
      cursor: 'grab'
    };

    // Apply shape-specific styles
    switch (data.shape) {
      case 'rhombus':
        return {
          ...baseStyle,
          transform: 'rotate(45deg)',
          borderRadius: '5px',
        };
      case 'round':
        return {
          ...baseStyle,
          borderRadius: '50px',
        };
      case 'circle':
        return {
          ...baseStyle,
          borderRadius: '50%',
          width: '100px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        };
      default:
        return baseStyle;
    }
  }, [data.shape, selected]);

  const labelStyle = data.shape === 'rhombus' ? { transform: 'rotate(-45deg)' } : {};

  return (
    <div style={nodeStyle} className="free-connect-node">
      <div style={labelStyle}>{data.label}</div>
      {handles}
    </div>
  );
};