import { describe, it, expect } from 'vitest'
import { createStore } from 'jotai'
import { nodesAtom } from '../flowchart/index'
import { reactFlowNodesAtom } from './atoms'

describe('Topological Sort in reactFlowNodesAtom', () => {
  it('should preserve node positions after sorting', () => {
    const store = createStore()
    
    // Set up nodes where child comes before parent in array
    store.set(nodesAtom, [
      {
        id: 'Rect1',
        type: 'rectangle',
        parentId: 'Subgraph1',
        childIds: [],
        position: { x: 50, y: 50 },
        data: { label: 'Child Rectangle' },
        width: 150,
        height: 50,
      },
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: ['Rect1'],
        position: { x: 200, y: 200 },
        data: { label: 'Parent Subgraph' },
        width: 600,
        height: 200,
      },
    ])
    
    // Get React Flow nodes (which should be sorted)
    const reactFlowNodes = store.get(reactFlowNodesAtom)
    
    // Check that parent comes before child
    const parentIndex = reactFlowNodes.findIndex(n => n.id === 'Subgraph1')
    const childIndex = reactFlowNodes.findIndex(n => n.id === 'Rect1')
    expect(parentIndex).toBeLessThan(childIndex)
    
    // Check that positions are preserved
    const parent = reactFlowNodes.find(n => n.id === 'Subgraph1')
    const child = reactFlowNodes.find(n => n.id === 'Rect1')
    
    expect(parent?.position).toEqual({ x: 200, y: 200 })
    expect(child?.position).toEqual({ x: 50, y: 50 })
  })
  
  it('should handle nested hierarchies correctly', () => {
    const store = createStore()
    
    // Set up deeply nested nodes in random order
    store.set(nodesAtom, [
      {
        id: 'Rect1',
        type: 'rectangle',
        parentId: 'Subgraph2',
        childIds: [],
        position: { x: 30, y: 30 },
        data: { label: 'Grandchild' },
        width: 150,
        height: 50,
      },
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: ['Subgraph2'],
        position: { x: 100, y: 100 },
        data: { label: 'Grandparent' },
        width: 800,
        height: 400,
      },
      {
        id: 'Subgraph2',
        type: 'subgraph',
        parentId: 'Subgraph1',
        childIds: ['Rect1'],
        position: { x: 100, y: 100 },
        data: { label: 'Parent' },
        width: 400,
        height: 200,
      },
    ])
    
    const reactFlowNodes = store.get(reactFlowNodesAtom)
    
    // Check order: Subgraph1 -> Subgraph2 -> Rect1
    const grandparentIndex = reactFlowNodes.findIndex(n => n.id === 'Subgraph1')
    const parentIndex = reactFlowNodes.findIndex(n => n.id === 'Subgraph2')
    const childIndex = reactFlowNodes.findIndex(n => n.id === 'Rect1')
    
    expect(grandparentIndex).toBeLessThan(parentIndex)
    expect(parentIndex).toBeLessThan(childIndex)
  })
  
  it('should handle multiple root nodes', () => {
    const store = createStore()
    
    store.set(nodesAtom, [
      {
        id: 'Rect1',
        type: 'rectangle',
        parentId: undefined,
        childIds: [],
        position: { x: 50, y: 50 },
        data: { label: 'Root 1' },
        width: 150,
        height: 50,
      },
      {
        id: 'Rect2',
        type: 'rectangle',
        parentId: 'Subgraph1',
        childIds: [],
        position: { x: 100, y: 100 },
        data: { label: 'Child' },
        width: 150,
        height: 50,
      },
      {
        id: 'Subgraph1',
        type: 'subgraph',
        parentId: undefined,
        childIds: ['Rect2'],
        position: { x: 200, y: 200 },
        data: { label: 'Root 2' },
        width: 600,
        height: 200,
      },
    ])
    
    const reactFlowNodes = store.get(reactFlowNodesAtom)
    
    // All nodes should be present
    expect(reactFlowNodes).toHaveLength(3)
    
    // Parent should come before its child
    const parentIndex = reactFlowNodes.findIndex(n => n.id === 'Subgraph1')
    const childIndex = reactFlowNodes.findIndex(n => n.id === 'Rect2')
    expect(parentIndex).toBeLessThan(childIndex)
  })
  
  it('should not affect nodes without parent-child relationships', () => {
    const store = createStore()
    
    const originalNodes = [
      {
        id: 'Rect1',
        type: 'rectangle' as const,
        parentId: undefined,
        childIds: [],
        position: { x: 50, y: 50 },
        data: { label: 'Node 1' },
        width: 150,
        height: 50,
      },
      {
        id: 'Rect2',
        type: 'rectangle' as const,
        parentId: undefined,
        childIds: [],
        position: { x: 200, y: 200 },
        data: { label: 'Node 2' },
        width: 150,
        height: 50,
      },
      {
        id: 'Rect3',
        type: 'rectangle' as const,
        parentId: undefined,
        childIds: [],
        position: { x: 350, y: 350 },
        data: { label: 'Node 3' },
        width: 150,
        height: 50,
      },
    ]
    
    store.set(nodesAtom, originalNodes)
    
    const reactFlowNodes = store.get(reactFlowNodesAtom)
    
    // All nodes should be present
    expect(reactFlowNodes).toHaveLength(3)
    
    // Order might be preserved or changed, but all nodes should exist
    originalNodes.forEach(original => {
      const found = reactFlowNodes.find(n => n.id === original.id)
      expect(found).toBeDefined()
      expect(found?.position).toEqual(original.position)
    })
  })
})