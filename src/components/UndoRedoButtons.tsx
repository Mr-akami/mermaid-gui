import { useHistory } from '@/hooks/useHistory'
import Tooltip from './ui/Tooltip'
import { RiArrowGoBackLine, RiArrowGoForwardLine } from 'react-icons/ri'

const UndoRedoButtons = () => {
  const { canUndo, canRedo, undo, redo } = useHistory()

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 flex space-x-2">
      <Tooltip content="Undo (Ctrl+Z)">
        <button
          onClick={() => {
            console.log('Undo clicked, canUndo:', canUndo)
            undo()
          }}
          disabled={!canUndo}
          className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
            canUndo
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <RiArrowGoBackLine className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip content="Redo (Ctrl+Shift+Z or Ctrl+Y)">
        <button
          onClick={() => {
            console.log('Redo clicked, canRedo:', canRedo)
            redo()
          }}
          disabled={!canRedo}
          className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
            canRedo
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <RiArrowGoForwardLine className="w-4 h-4" />
        </button>
      </Tooltip>
    </div>
  )
}

export default UndoRedoButtons