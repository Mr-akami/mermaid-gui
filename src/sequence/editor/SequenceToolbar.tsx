import { memo } from 'react'
import { useAtom } from 'jotai'
import { placementModeAtom } from '../atoms'

export const SequenceToolbar = memo(() => {
  const [placementMode, setPlacementMode] = useAtom(placementModeAtom)

  return (
    <div 
      style={{
        padding: '8px',
        borderBottom: '1px solid #e0e0e0',
        background: '#f5f5f5',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}
    >
      <button
        onClick={() => setPlacementMode(placementMode === 'participant' ? null : 'participant')}
        style={{
          padding: '6px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: placementMode === 'participant' ? '#4A90E2' : '#fff',
          color: placementMode === 'participant' ? '#fff' : '#333',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500
        }}
      >
        👤 Participant
      </button>
      
      <button
        onClick={() => setPlacementMode(placementMode === 'actor' ? null : 'actor')}
        style={{
          padding: '6px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: placementMode === 'actor' ? '#4A90E2' : '#fff',
          color: placementMode === 'actor' ? '#fff' : '#333',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500
        }}
      >
        🎭 Actor
      </button>
      
      <button
        onClick={() => setPlacementMode(placementMode === 'note' ? null : 'note')}
        style={{
          padding: '6px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: placementMode === 'note' ? '#4A90E2' : '#fff',
          color: placementMode === 'note' ? '#fff' : '#333',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500
        }}
      >
        📝 Note
      </button>
      
      <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
        {placementMode && (
          <span>Click on the canvas to place a {placementMode}</span>
        )}
      </div>
    </div>
  )
})

SequenceToolbar.displayName = 'SequenceToolbar'