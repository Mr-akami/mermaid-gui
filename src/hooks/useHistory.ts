import { useEffect, useCallback } from 'react'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { nodesAtom, edgesAtom } from '@/store/flowStore'
import { pushToHistoryAtom, undoAtom, redoAtom } from '@/store/historyStore'

export const useHistory = () => {
  const nodes = useAtomValue(nodesAtom)
  const edges = useAtomValue(edgesAtom)
  const pushToHistory = useSetAtom(pushToHistoryAtom)
  const [canUndo, undo] = useAtom(undoAtom)
  const [canRedo, redo] = useAtom(redoAtom)

  // Save to history when nodes or edges change
  useEffect(() => {
    console.log('History: nodes/edges changed', { nodes: nodes.length, edges: edges.length })
    pushToHistory()
  }, [nodes, edges, pushToHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          undo()
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault()
          redo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return {
    undo: useCallback(() => undo(), [undo]),
    redo: useCallback(() => redo(), [redo]),
    canUndo,
    canRedo,
  }
}