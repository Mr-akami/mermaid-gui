import { memo } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { canUndoAtom, canRedoAtom, undoAtom, redoAtom } from '../../history'

interface UndoRedoButtonsProps {
  onUndo: (state: { nodes: any[], edges: any[] }) => void
  onRedo: (state: { nodes: any[], edges: any[] }) => void
}

export const UndoRedoButtons = memo(({ onUndo, onRedo }: UndoRedoButtonsProps) => {
  const canUndo = useAtomValue(canUndoAtom)
  const canRedo = useAtomValue(canRedoAtom)
  const [, undo] = useAtom(undoAtom)
  const [, redo] = useAtom(redoAtom)

  const handleUndo = () => {
    const previousState = undo()
    if (previousState) {
      onUndo(previousState)
    }
  }

  const handleRedo = () => {
    const nextState = redo()
    if (nextState) {
      onRedo(nextState)
    }
  }

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 flex gap-2 z-10">
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className={`
          w-10 h-10 flex items-center justify-center rounded
          text-lg transition-all
          ${
            canUndo
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        ↶
      </button>
      <button
        onClick={handleRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className={`
          w-10 h-10 flex items-center justify-center rounded
          text-lg transition-all
          ${
            canRedo
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        ↷
      </button>
    </div>
  )
})

UndoRedoButtons.displayName = 'UndoRedoButtons'