import { useHistory } from '@/hooks/useHistory'

const UndoRedoButtons = () => {
  const { canUndo, canRedo, undo, redo } = useHistory()

  return (
    <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 flex space-x-2">
      <button
        onClick={() => {
          console.log('Undo clicked, canUndo:', canUndo)
          undo()
        }}
        disabled={!canUndo}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          canUndo
            ? 'bg-gray-600 text-white hover:bg-gray-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        ↶ Undo
      </button>
      <button
        onClick={() => {
          console.log('Redo clicked, canRedo:', canRedo)
          redo()
        }}
        disabled={!canRedo}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          canRedo
            ? 'bg-gray-600 text-white hover:bg-gray-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
      >
        ↷ Redo
      </button>
    </div>
  )
}

export default UndoRedoButtons