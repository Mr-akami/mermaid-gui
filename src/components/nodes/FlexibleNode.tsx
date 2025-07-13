import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useAtomValue } from 'jotai';
import { connectionModeAtom } from '../ConnectionModeSelector';

interface FlexibleNodeData {
  label: string;
  shape?: string;
}

export const FlexibleNode: React.FC<NodeProps<FlexibleNodeData>> = ({
  data,
  selected,
  isConnectable
}) => {
  const connectionMode = useAtomValue(connectionModeAtom);
  
  const nodeStyles = {
    padding: '10px 20px',
    borderRadius: '5px',
    backgroundColor: '#fff',
    border: selected ? '2px solid #4CAF50' : '2px solid #555',
    fontSize: '14px',
    position: 'relative' as const,
  };

  // In free mode, we make the whole node connectable
  const handleStyles = connectionMode === 'free' ? {
    background: 'transparent',
    border: 'none',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    transform: 'none',
    pointerEvents: 'all' as const,
  } : {
    width: '10px',
    height: '10px',
  };

  return (
    <div style={nodeStyles} className="flexible-node">
      {data.label}
      
      {connectionMode === 'free' ? (
        <>
          {/* Single large invisible handle covering the entire node */}
          <Handle
            type="source"
            position={Position.Top}
            id="free-source"
            style={handleStyles}
            isConnectable={isConnectable}
          />
          <Handle
            type="target"
            position={Position.Top}
            id="free-target"
            style={{
              ...handleStyles,
              pointerEvents: 'none' as const, // Prevent overlap issues
            }}
            isConnectable={isConnectable}
          />
        </>
      ) : (
        <>
          {/* Traditional fixed handles */}
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
          />
        </>
      )}
    </div>
  );
};