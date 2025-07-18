import { describe, it, expect } from 'vitest'
import { createStore } from 'jotai'
import { nodesAtom, addNodeAtom, setNodeParentAtom } from './atoms'

describe('setNodeParentAtom', () => {
  const createTestStore = () => {
    const store = createStore()
    
    // Add test nodes
    store.set(addNodeAtom, {
      type: 'subgraph',
      position: { x: 200, y: 200 },
      label: 'Subgraph1',
    })
    
    store.set(addNodeAtom, {
      type: 'rectangle',
      position: { x: 100, y: 100 },
      label: 'Rect1',
    })
    
    store.set(addNodeAtom, {
      type: 'rectangle',
      position: { x: 300, y: 100 },
      label: 'Rect2',
    })
    
    store.set(addNodeAtom, {
      type: 'subgraph',
      position: { x: 400, y: 200 },
      label: 'Subgraph2',
    })
    
    return store
  }

  it('should add node to subgraph as parent', () => {
    const store = createTestStore()
    
    // Set Rect1's parent to Subgraph1
    store.set(setNodeParentAtom, { nodeId: 'Rect1', parentId: 'Subgraph1' })
    
    const nodes = store.get(nodesAtom)
    const rect1 = nodes.find(n => n.id === 'Rect1')
    const subgraph1 = nodes.find(n => n.id === 'Subgraph1')
    
    expect(rect1?.parentId).toBe('Subgraph1')
    expect(subgraph1?.childIds).toContain('Rect1')
  })

  it('should remove node from parent when parentId is null', () => {
    const store = createTestStore()
    
    // First add to parent
    store.set(setNodeParentAtom, { nodeId: 'Rect1', parentId: 'Subgraph1' })
    
    // Then remove from parent
    store.set(setNodeParentAtom, { nodeId: 'Rect1', parentId: null })
    
    const nodes = store.get(nodesAtom)
    const rect1 = nodes.find(n => n.id === 'Rect1')
    const subgraph1 = nodes.find(n => n.id === 'Subgraph1')
    
    expect(rect1?.parentId).toBeUndefined()
    expect(subgraph1?.childIds).not.toContain('Rect1')
  })

  it('should move node from one parent to another', () => {
    const store = createTestStore()
    
    // Add to first parent
    store.set(setNodeParentAtom, { nodeId: 'Rect1', parentId: 'Subgraph1' })
    
    // Move to second parent
    store.set(setNodeParentAtom, { nodeId: 'Rect1', parentId: 'Subgraph2' })
    
    const nodes = store.get(nodesAtom)
    const rect1 = nodes.find(n => n.id === 'Rect1')
    const subgraph1 = nodes.find(n => n.id === 'Subgraph1')
    const subgraph2 = nodes.find(n => n.id === 'Subgraph2')
    
    expect(rect1?.parentId).toBe('Subgraph2')
    expect(subgraph1?.childIds).not.toContain('Rect1')
    expect(subgraph2?.childIds).toContain('Rect1')
  })

  it('should not allow node to be its own parent', () => {
    const store = createTestStore()
    
    // Try to set node as its own parent
    store.set(setNodeParentAtom, { nodeId: 'Rect1', parentId: 'Rect1' })
    
    const nodes = store.get(nodesAtom)
    const rect1 = nodes.find(n => n.id === 'Rect1')
    
    expect(rect1?.parentId).toBeUndefined()
  })

  it('should not allow non-subgraph nodes to have subgraph children', () => {
    const store = createTestStore()
    
    // Try to set a subgraph as child of a rectangle
    store.set(setNodeParentAtom, { nodeId: 'Subgraph1', parentId: 'Rect1' })
    
    const nodes = store.get(nodesAtom)
    const subgraph1 = nodes.find(n => n.id === 'Subgraph1')
    const rect1 = nodes.find(n => n.id === 'Rect1')
    
    expect(subgraph1?.parentId).toBeUndefined()
    expect(rect1?.childIds).not.toContain('Subgraph1')
  })

  it('should allow subgraph to be child of another subgraph', () => {
    const store = createTestStore()
    
    // Set Subgraph2 as child of Subgraph1
    store.set(setNodeParentAtom, { nodeId: 'Subgraph2', parentId: 'Subgraph1' })
    
    const nodes = store.get(nodesAtom)
    const subgraph1 = nodes.find(n => n.id === 'Subgraph1')
    const subgraph2 = nodes.find(n => n.id === 'Subgraph2')
    
    expect(subgraph2?.parentId).toBe('Subgraph1')
    expect(subgraph1?.childIds).toContain('Subgraph2')
  })

  it('should handle multiple children in same parent', () => {
    const store = createTestStore()
    
    // Add both rectangles to the same subgraph
    store.set(setNodeParentAtom, { nodeId: 'Rect1', parentId: 'Subgraph1' })
    store.set(setNodeParentAtom, { nodeId: 'Rect2', parentId: 'Subgraph1' })
    
    const nodes = store.get(nodesAtom)
    const subgraph1 = nodes.find(n => n.id === 'Subgraph1')
    const rect1 = nodes.find(n => n.id === 'Rect1')
    const rect2 = nodes.find(n => n.id === 'Rect2')
    
    expect(rect1?.parentId).toBe('Subgraph1')
    expect(rect2?.parentId).toBe('Subgraph1')
    expect(subgraph1?.childIds).toHaveLength(2)
    expect(subgraph1?.childIds).toContain('Rect1')
    expect(subgraph1?.childIds).toContain('Rect2')
  })
})