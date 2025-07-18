import { describe, it, expect } from 'vitest'
import { createStore } from 'jotai'
import { reactFlowNodesAtom } from './atoms'
import { nodesAtom } from '../flowchart/index'

describe('reactFlowNodesAtom - Parent Node Ordering', () => {
  it('should order parent nodes before their children', () => {
    const store = createStore()
    
    // Set nodes where children appear before parents in the array
    store.set(nodesAtom, [
      {
        id: 'child1',
        type: 'rectangle',
        parentId: 'parent1',
        childIds: [],
        position: { x: 100, y: 100 },
        data: { label: 'Child 1' },
      },
      {
        id: 'child2',
        type: 'rectangle',
        parentId: 'parent2',
        childIds: [],
        position: { x: 200, y: 100 },
        data: { label: 'Child 2' },
      },
      {
        id: 'parent1',
        type: 'subgraph',
        parentId: undefined,
        childIds: ['child1'],
        position: { x: 50, y: 50 },
        data: { label: 'Parent 1' },
        width: 300,
        height: 200,
      },
      {
        id: 'parent2',
        type: 'subgraph',
        parentId: undefined,
        childIds: ['child2'],
        position: { x: 400, y: 50 },
        data: { label: 'Parent 2' },
        width: 300,
        height: 200,
      },
      {
        id: 'standalone',
        type: 'circle',
        parentId: undefined,
        childIds: [],
        position: { x: 500, y: 300 },
        data: { label: 'Standalone' },
      },
    ])
    
    const reactFlowNodes = store.get(reactFlowNodesAtom)
    
    // Find indices
    const parent1Index = reactFlowNodes.findIndex(n => n.id === 'parent1')
    const parent2Index = reactFlowNodes.findIndex(n => n.id === 'parent2')
    const child1Index = reactFlowNodes.findIndex(n => n.id === 'child1')
    const child2Index = reactFlowNodes.findIndex(n => n.id === 'child2')
    
    // Parents should come before their children
    expect(parent1Index).toBeLessThan(child1Index)
    expect(parent2Index).toBeLessThan(child2Index)
  })

  it('should handle nested parent-child relationships', () => {
    const store = createStore()
    
    // Grandparent -> Parent -> Child hierarchy
    store.set(nodesAtom, [
      {
        id: 'child',
        type: 'rectangle',
        parentId: 'parent',
        childIds: [],
        position: { x: 100, y: 100 },
        data: { label: 'Child' },
      },
      {
        id: 'parent',
        type: 'subgraph',
        parentId: 'grandparent',
        childIds: ['child'],
        position: { x: 50, y: 50 },
        data: { label: 'Parent' },
        width: 200,
        height: 150,
      },
      {
        id: 'grandparent',
        type: 'subgraph',
        parentId: undefined,
        childIds: ['parent'],
        position: { x: 0, y: 0 },
        data: { label: 'Grandparent' },
        width: 400,
        height: 300,
      },
    ])
    
    const reactFlowNodes = store.get(reactFlowNodesAtom)
    
    const grandparentIndex = reactFlowNodes.findIndex(n => n.id === 'grandparent')
    const parentIndex = reactFlowNodes.findIndex(n => n.id === 'parent')
    const childIndex = reactFlowNodes.findIndex(n => n.id === 'child')
    
    // Should be ordered: grandparent -> parent -> child
    expect(grandparentIndex).toBeLessThan(parentIndex)
    expect(parentIndex).toBeLessThan(childIndex)
  })

  it('should maintain relative order for nodes at the same level', () => {
    const store = createStore()
    
    store.set(nodesAtom, [
      {
        id: 'nodeA',
        type: 'rectangle',
        parentId: undefined,
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'A' },
      },
      {
        id: 'nodeB',
        type: 'rectangle',
        parentId: undefined,
        childIds: [],
        position: { x: 100, y: 0 },
        data: { label: 'B' },
      },
      {
        id: 'nodeC',
        type: 'rectangle',
        parentId: undefined,
        childIds: [],
        position: { x: 200, y: 0 },
        data: { label: 'C' },
      },
    ])
    
    const reactFlowNodes = store.get(reactFlowNodesAtom)
    
    // Should maintain original order for nodes without parent-child relationships
    expect(reactFlowNodes[0].id).toBe('nodeA')
    expect(reactFlowNodes[1].id).toBe('nodeB')
    expect(reactFlowNodes[2].id).toBe('nodeC')
  })
})