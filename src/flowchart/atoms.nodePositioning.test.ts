import { describe, it, expect } from 'vitest'
import { createStore } from 'jotai'
import { nodesAtom, setNodeParentAtom } from './atoms'

describe('Node Positioning with Parent-Child Relationships', () => {
  it('should convert to relative position when node is added to parent', () => {
    const store = createStore()
    
    // Set up initial nodes
    store.set(nodesAtom, [
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: [],
        position: { x: 200, y: 200 },
        data: { label: 'Test Subgraph' },
        width: 600,
        height: 200,
      },
      {
        id: 'Rect1',
        type: 'rectangle',
        parentId: undefined,
        childIds: [],
        position: { x: 250, y: 250 }, // Absolute position
        data: { label: 'Test Rectangle' },
        width: 150,
        height: 50,
      },
    ])
    
    // Set parent relationship
    store.set(setNodeParentAtom, { nodeId: 'Rect1', parentId: 'Subgraph1' })
    
    // Check that position is now relative to parent
    const nodes = store.get(nodesAtom)
    const rect = nodes.find(n => n.id === 'Rect1')
    const subgraph = nodes.find(n => n.id === 'Subgraph1')
    
    expect(rect?.parentId).toBe('Subgraph1')
    expect(subgraph?.childIds).toContain('Rect1')
    
    // Position should be relative: (250 - 200, 250 - 200) = (50, 50)
    expect(rect?.position).toEqual({ x: 50, y: 50 })
  })
  
  it('should convert to absolute position when node is removed from parent', () => {
    const store = createStore()
    
    // Set up initial nodes with rectangle inside subgraph
    store.set(nodesAtom, [
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: ['Rect1'],
        position: { x: 200, y: 200 },
        data: { label: 'Test Subgraph' },
        width: 600,
        height: 200,
      },
      {
        id: 'Rect1',
        type: 'rectangle',
        parentId: 'Subgraph1',
        childIds: [],
        position: { x: 50, y: 50 }, // Relative position
        data: { label: 'Test Rectangle' },
        width: 150,
        height: 50,
      },
    ])
    
    // Remove parent relationship
    store.set(setNodeParentAtom, { nodeId: 'Rect1', parentId: null })
    
    // Check that position is now absolute
    const nodes = store.get(nodesAtom)
    const rect = nodes.find(n => n.id === 'Rect1')
    const subgraph = nodes.find(n => n.id === 'Subgraph1')
    
    expect(rect?.parentId).toBeUndefined()
    expect(subgraph?.childIds).not.toContain('Rect1')
    
    // Position should be absolute: (50 + 200, 50 + 200) = (250, 250)
    expect(rect?.position).toEqual({ x: 250, y: 250 })
  })
  
  it('should handle nested subgraphs correctly', () => {
    const store = createStore()
    
    // Set up nested subgraphs
    store.set(nodesAtom, [
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: ['Subgraph2'],
        position: { x: 100, y: 100 },
        data: { label: 'Outer Subgraph' },
        width: 800,
        height: 400,
      },
      {
        id: 'Subgraph2',
        type: 'subgraph',
        parentId: 'Subgraph1',
        childIds: [],
        position: { x: 100, y: 100 }, // Relative to Subgraph1
        data: { label: 'Inner Subgraph' },
        width: 400,
        height: 200,
      },
      {
        id: 'Rect1',
        type: 'rectangle',
        parentId: undefined,
        childIds: [],
        position: { x: 250, y: 250 }, // Absolute position
        data: { label: 'Test Rectangle' },
        width: 150,
        height: 50,
      },
    ])
    
    // Add rectangle to inner subgraph
    store.set(setNodeParentAtom, { nodeId: 'Rect1', parentId: 'Subgraph2' })
    
    // Check position is relative to inner subgraph
    const nodes = store.get(nodesAtom)
    const rect = nodes.find(n => n.id === 'Rect1')
    
    expect(rect?.parentId).toBe('Subgraph2')
    
    // Position should be relative to Subgraph2's position (100, 100)
    // Relative position: (250 - 100, 250 - 100) = (150, 150)
    expect(rect?.position).toEqual({ x: 150, y: 150 })
  })
  
  it('should not allow node to be its own parent', () => {
    const store = createStore()
    
    store.set(nodesAtom, [
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: [],
        position: { x: 200, y: 200 },
        data: { label: 'Test Subgraph' },
        width: 600,
        height: 200,
      },
    ])
    
    // Try to set node as its own parent
    store.set(setNodeParentAtom, { nodeId: 'Subgraph1', parentId: 'Subgraph1' })
    
    // Should remain unchanged
    const nodes = store.get(nodesAtom)
    const subgraph = nodes.find(n => n.id === 'Subgraph1')
    
    expect(subgraph?.parentId).toBeUndefined()
    expect(subgraph?.childIds).toHaveLength(0)
  })
})