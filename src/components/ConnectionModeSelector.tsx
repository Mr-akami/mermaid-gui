import React from 'react';
import { Plug, Move } from 'lucide-react';
import { atom, useAtom } from 'jotai';

export type ConnectionMode = 'handles' | 'free';

export const connectionModeAtom = atom<ConnectionMode>('handles');

export const ConnectionModeSelector: React.FC = () => {
  const [connectionMode, setConnectionMode] = useAtom(connectionModeAtom);

  return (
    <div className="flex bg-white rounded-lg shadow-md p-1">
      <button
        className={`px-3 py-2 rounded flex items-center gap-2 transition-colors ${
          connectionMode === 'handles'
            ? 'bg-blue-500 text-white'
            : 'hover:bg-gray-100'
        }`}
        onClick={() => setConnectionMode('handles')}
        title="Connect using fixed handles"
      >
        <Plug size={16} />
        <span className="text-sm">Handles</span>
      </button>
      <button
        className={`px-3 py-2 rounded flex items-center gap-2 transition-colors ${
          connectionMode === 'free'
            ? 'bg-blue-500 text-white'
            : 'hover:bg-gray-100'
        }`}
        onClick={() => setConnectionMode('free')}
        title="Connect anywhere on nodes"
      >
        <Move size={16} />
        <span className="text-sm">Free</span>
      </button>
    </div>
  );
};