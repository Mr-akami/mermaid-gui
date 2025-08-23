import { describe, it, expect } from 'vitest'
import { toReactFlowNodes } from './toXyflowFromIR'
import type { IRNode } from '../core/types'

describe('flowchartConverters - node ordering', () => {
  it('should place parent nodes before child nodes', () => {
    const nodes: IRNode[] = [
      {
        id: 'n1',
        type: 'rectangle',
        parentId: 'sg1', // Parent comes after in array
        position: { x: 10, y: 10 },
        data: { label: 'Node 1' },
        childIds: [],
      },
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 0, y: 0 },
        data: { label: 'Subgraph 1' },
        childIds: ['n1'],
      },
    ]

    const result = toReactFlowNodes(nodes)

    // Parent should come before child
    const sg1Index = result.findIndex(n => n.id === 'sg1')
    const n1Index = result.findIndex(n => n.id === 'n1')
    
    expect(sg1Index).toBeLessThan(n1Index)
    expect(sg1Index).toBe(0)
    expect(n1Index).toBe(1)
  })

  it('should handle nested subgraphs with proper ordering', () => {
    const nodes: IRNode[] = [
      {
        id: 'n1',
        type: 'rectangle',
        parentId: 'sg2',
        position: { x: 20, y: 20 },
        data: { label: 'Node 1' },
        childIds: [],
      },
      {
        id: 'sg2',
        type: 'subgraph',
        parentId: 'sg1',
        position: { x: 10, y: 10 },
        data: { label: 'Inner Subgraph' },
        childIds: ['n1'],
      },
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 0, y: 0 },
        data: { label: 'Outer Subgraph' },
        childIds: ['sg2'],
      },
    ]

    const result = toReactFlowNodes(nodes)

    // Check ordering: sg1 -> sg2 -> n1
    const sg1Index = result.findIndex(n => n.id === 'sg1')
    const sg2Index = result.findIndex(n => n.id === 'sg2')
    const n1Index = result.findIndex(n => n.id === 'n1')
    
    expect(sg1Index).toBe(0)
    expect(sg2Index).toBe(1)
    expect(n1Index).toBe(2)
  })

  it('should keep subgraph nodes as subgraph type for React Flow', () => {
    const nodes: IRNode[] = [
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 0, y: 0 },
        data: { label: 'Subgraph 1' },
        childIds: ['n1'],
      },
      {
        id: 'n1',
        type: 'rectangle',
        parentId: 'sg1',
        position: { x: 10, y: 10 },
        data: { label: 'Node 1' },
        childIds: [],
      },
    ]

    const result = toReactFlowNodes(nodes)

    // Subgraph should keep its type for React Flow
    const subgraph = result.find(n => n.id === 'sg1')
    expect(subgraph?.type).toBe('subgraph')
    
    // Regular nodes should keep their type
    const node = result.find(n => n.id === 'n1')
    expect(node?.type).toBe('rectangle')
  })

  it('should set parentId on child nodes', () => {
    const nodes: IRNode[] = [
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 0, y: 0 },
        data: { label: 'Subgraph 1' },
        childIds: ['n1', 'n2'],
      },
      {
        id: 'n1',
        type: 'rectangle',
        parentId: 'sg1',
        position: { x: 10, y: 10 },
        data: { label: 'Node 1' },
        childIds: [],
      },
      {
        id: 'n2',
        type: 'rectangle',
        parentId: 'sg1',
        position: { x: 10, y: 50 },
        data: { label: 'Node 2' },
        childIds: [],
      },
    ]

    const result = toReactFlowNodes(nodes)

    const n1 = result.find(n => n.id === 'n1')
    const n2 = result.find(n => n.id === 'n2')
    
    expect(n1?.parentId).toBe('sg1')
    expect(n2?.parentId).toBe('sg1')
  })

  it('should handle complex hierarchy with multiple levels', () => {
    const nodes: IRNode[] = [
      {
        id: 'n3',
        type: 'rectangle',
        parentId: 'sg3',
        position: { x: 30, y: 30 },
        data: { label: 'Node 3' },
        childIds: [],
      },
      {
        id: 'sg3',
        type: 'subgraph',
        parentId: 'sg2',
        position: { x: 20, y: 20 },
        data: { label: 'Level 3' },
        childIds: ['n3'],
      },
      {
        id: 'n2',
        type: 'rectangle',
        parentId: 'sg2',
        position: { x: 20, y: 60 },
        data: { label: 'Node 2' },
        childIds: [],
      },
      {
        id: 'sg2',
        type: 'subgraph',
        parentId: 'sg1',
        position: { x: 10, y: 10 },
        data: { label: 'Level 2' },
        childIds: ['sg3', 'n2'],
      },
      {
        id: 'n1',
        type: 'rectangle',
        position: { x: 0, y: 100 },
        data: { label: 'Node 1' },
        childIds: [],
      },
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 0, y: 0 },
        data: { label: 'Level 1' },
        childIds: ['sg2'],
      },
    ]

    const result = toReactFlowNodes(nodes)

    // Check proper ordering
    const indices = {
      n1: result.findIndex(n => n.id === 'n1'),
      sg1: result.findIndex(n => n.id === 'sg1'),
      sg2: result.findIndex(n => n.id === 'sg2'),
      sg3: result.findIndex(n => n.id === 'sg3'),
      n2: result.findIndex(n => n.id === 'n2'),
      n3: result.findIndex(n => n.id === 'n3'),
    }

    // Subgraphs come first (for z-index ordering)
    expect(indices.sg1).toBeLessThan(indices.n1)
    expect(indices.sg2).toBeLessThan(indices.n1)
    expect(indices.sg3).toBeLessThan(indices.n1)
    
    // Among subgraphs, parent-child order is preserved
    expect(indices.sg1).toBeLessThan(indices.sg2)
    expect(indices.sg2).toBeLessThan(indices.sg3)
    
    // Regular nodes come after all subgraphs
    expect(indices.sg3).toBeLessThan(indices.n2)
    expect(indices.sg3).toBeLessThan(indices.n3)
  })
})