import { describe, it, expect } from 'vitest'
import { createStore } from 'jotai'
import { editorCodeAtom, syncWithFlowchartAtom } from './atoms'
import { nodesAtom, edgesAtom, mermaidCodeAtom, addNodeAtom } from './deps'
import type { Node } from './deps'

describe('bidirectional sync', () => {
  it('should sync flowchart changes to editor code', () => {
    const store = createStore()

    // Add a node through GUI
    store.set(addNodeAtom, {
      type: 'rectangle',
      position: { x: 100, y: 100 },
      label: 'New Node',
    })

    // Get the generated mermaid code
    const mermaidCode = store.get(mermaidCodeAtom)

    // Sync to editor
    store.set(syncWithFlowchartAtom, null)

    // Editor should have the same code
    expect(store.get(editorCodeAtom)).toBe(mermaidCode)
  })

  it('should maintain sync after multiple GUI operations', () => {
    const store = createStore()

    // Add first node
    store.set(addNodeAtom, {
      type: 'rectangle',
      position: { x: 0, y: 0 },
      label: 'Start',
    })

    // Add second node
    store.set(addNodeAtom, {
      type: 'diamond',
      position: { x: 0, y: 100 },
      label: 'Decision',
    })

    // Sync to editor
    store.set(syncWithFlowchartAtom, null)

    const editorCode = store.get(editorCodeAtom)
    expect(editorCode).toContain('[Start]')
    expect(editorCode).toContain('{Decision}')
  })

  it('should handle manual node ID assignment for predictable sync', () => {
    const store = createStore()

    // Manually create nodes with specific IDs
    const node1: Node = {
      id: 'A',
      type: 'rectangle',
      childIds: [],
      position: { x: 0, y: 0 },
      data: { label: 'Start' },
    }

    const node2: Node = {
      id: 'B',
      type: 'circle',
      childIds: [],
      position: { x: 0, y: 100 },
      data: { label: 'End' },
    }

    store.set(nodesAtom, [node1, node2])

    // Sync to editor
    store.set(syncWithFlowchartAtom, null)

    const expectedCode = `flowchart TD
    A[Start]
    B((End))`

    expect(store.get(editorCodeAtom)).toBe(expectedCode)
  })
})
