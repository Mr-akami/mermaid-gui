import { useCallback } from 'react';
import { Connection, Node, Edge, useReactFlow } from 'reactflow';
import { nanoid } from 'nanoid';

interface FreeConnectOptions {
  enableFreeConnect?: boolean;
  connectionMode?: 'free' | 'handles';
}

export function useFreeConnect(options: FreeConnectOptions = {}) {
  const { enableFreeConnect = false, connectionMode = 'handles' } = options;
  const { setEdges } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => {
      if (!enableFreeConnect || connectionMode !== 'free') {
        // Use default connection behavior
        return params;
      }

      // For free connections, we create a custom edge without handle constraints
      const newEdge: Edge = {
        id: nanoid(),
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        type: 'smoothstep', // Use smoothstep for better free-form appearance
        data: {
          freeConnect: true,
          // Store connection points if needed for custom rendering
        }
      };

      setEdges((edges) => [...edges, newEdge]);
      return null; // Prevent default connection
    },
    [enableFreeConnect, connectionMode, setEdges]
  );

  const createConnectionLine = useCallback(
    (fromNode: Node, toNode: Node, fromPoint?: { x: number; y: number }, toPoint?: { x: number; y: number }) => {
      if (!enableFreeConnect || connectionMode !== 'free') {
        return null;
      }

      const newEdge: Edge = {
        id: nanoid(),
        source: fromNode.id,
        target: toNode.id,
        type: 'smoothstep',
        data: {
          freeConnect: true,
          fromPoint,
          toPoint
        }
      };

      setEdges((edges) => [...edges, newEdge]);
      return newEdge;
    },
    [enableFreeConnect, connectionMode, setEdges]
  );

  return {
    onConnect,
    createConnectionLine,
    isFreeModeEnabled: enableFreeConnect && connectionMode === 'free'
  };
}