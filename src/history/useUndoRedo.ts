import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { undoAtom, redoAtom, canUndoAtom, canRedoAtom } from './atoms'

export function useUndoRedo() {
  const undo = useSetAtom(undoAtom)
  const redo = useSetAtom(redoAtom)
  const canUndo = useAtomValue(canUndoAtom)
  const canRedo = useAtomValue(canRedoAtom)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          if (canUndo) undo()
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault()
          if (canRedo) redo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canUndo, canRedo])

  return {
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
