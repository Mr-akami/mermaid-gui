import { describe, it, expect } from 'vitest'
import { createStore } from 'jotai'
import {
  editorCodeAtom,
  parseErrorAtom,
  applyCodeToFlowchartAtom,
} from './atoms'
import { nodesAtom, edgesAtom } from './deps'

describe('code-editor atoms', () => {
  it('should initialize with empty code', () => {
    const store = createStore()

    expect(store.get(editorCodeAtom)).toBe('')
    expect(store.get(parseErrorAtom)).toBeNull()
  })

  it('should update editor code', () => {
    const store = createStore()

    const newCode = `flowchart TD
    A[Start]
    B[End]
    A --> B`

    store.set(editorCodeAtom, newCode)
    expect(store.get(editorCodeAtom)).toBe(newCode)
  })

  it('should apply valid code to flowchart', () => {
    const store = createStore()

    const validCode = `flowchart TD
    A[Start]
    B{Decision}
    A --> B`

    store.set(editorCodeAtom, validCode)
    store.set(applyCodeToFlowchartAtom, null)

    const nodes = store.get(nodesAtom)
    const edges = store.get(edgesAtom)

    expect(nodes).toHaveLength(2)
    expect(edges).toHaveLength(1)
    expect(store.get(parseErrorAtom)).toBeNull()

    expect(nodes[0]).toMatchObject({
      id: 'A',
      type: 'rectangle',
      data: { label: 'Start' },
    })

    expect(nodes[1]).toMatchObject({
      id: 'B',
      type: 'diamond',
      data: { label: 'Decision' },
    })
  })

  it('should set error for invalid code', () => {
    const store = createStore()

    const invalidCode = `flowchart TD
    A[Start
    B --> A`

    store.set(editorCodeAtom, invalidCode)
    store.set(applyCodeToFlowchartAtom, null)

    const error = store.get(parseErrorAtom)
    expect(error).toBeDefined()
    expect(error).toContain('Invalid syntax')

    // Should not update nodes/edges on error
    expect(store.get(nodesAtom)).toHaveLength(0)
    expect(store.get(edgesAtom)).toHaveLength(0)
  })

  it('should clear error when valid code is applied', () => {
    const store = createStore()

    // First set invalid code
    const invalidCode = `flowchart TD
    A[Start`

    store.set(editorCodeAtom, invalidCode)
    store.set(applyCodeToFlowchartAtom, null)

    expect(store.get(parseErrorAtom)).toBeDefined()

    // Then set valid code
    const validCode = `flowchart TD
    A[Start]`

    store.set(editorCodeAtom, validCode)
    store.set(applyCodeToFlowchartAtom, null)

    expect(store.get(parseErrorAtom)).toBeNull()
    expect(store.get(nodesAtom)).toHaveLength(1)
  })
})
