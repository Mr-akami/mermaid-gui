import { describe, it, expect } from 'vitest'
import { buildFlowchartCode } from './flowchartCodeBuilder'
import type { Node, Edge } from '../../types'

describe('flowchartCodeBuilder - subgraph support', () => {
  it('should generate code for a simple subgraph', () => {
    const nodes: Node[] = [
      {
        id: 'subgraph1',
        type: 'subgraph',
        position: { x: 0, y: 0 },
        data: { label: 'one' },
        childIds: ['a1', 'a2'],
      },
      {
        id: 'a1',
        type: 'rectangle',
        parentId: 'subgraph1',
        position: { x: 10, y: 10 },
        data: { label: 'a1' },
        childIds: [],
      },
      {
        id: 'a2',
        type: 'rectangle',
        parentId: 'subgraph1',
        position: { x: 10, y: 90 },
        data: { label: 'a2' },
        childIds: [],
      },
    ]
    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'a1',
        target: 'a2',
        type: 'normal-arrow',
      },
    ]

    const result = buildFlowchartCode({ nodes, edges }, 'TD')
    expect(result).toBe(`flowchart TD
    subgraph one
    a1[a1]
    a2[a2]
    end
    a1 --> a2`)
  })

  it('should generate code for subgraph with explicit ID', () => {
    const nodes: Node[] = [
      {
        id: 'ide1',
        type: 'subgraph',
        position: { x: 0, y: 0 },
        data: { label: 'one' },
        childIds: ['a1', 'a2'],
      },
      {
        id: 'a1',
        type: 'rectangle',
        parentId: 'ide1',
        position: { x: 10, y: 10 },
        data: { label: 'a1' },
        childIds: [],
      },
      {
        id: 'a2',
        type: 'rectangle',
        parentId: 'ide1',
        position: { x: 10, y: 90 },
        data: { label: 'a2' },
        childIds: [],
      },
    ]
    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'a1',
        target: 'a2',
        type: 'normal-arrow',
      },
    ]

    const result = buildFlowchartCode({ nodes, edges }, 'TD')
    expect(result).toBe(`flowchart TD
    subgraph ide1 [one]
    a1[a1]
    a2[a2]
    end
    a1 --> a2`)
  })

  it('should handle edges between subgraphs', () => {
    const nodes: Node[] = [
      {
        id: 'subgraph1',
        type: 'subgraph',
        position: { x: 0, y: 0 },
        data: { label: 'one' },
        childIds: ['a1', 'a2'],
      },
      {
        id: 'a1',
        type: 'rectangle',
        parentId: 'subgraph1',
        position: { x: 10, y: 10 },
        data: { label: 'a1' },
        childIds: [],
      },
      {
        id: 'a2',
        type: 'rectangle',
        parentId: 'subgraph1',
        position: { x: 10, y: 90 },
        data: { label: 'a2' },
        childIds: [],
      },
      {
        id: 'subgraph2',
        type: 'subgraph',
        position: { x: 200, y: 0 },
        data: { label: 'two' },
        childIds: ['b1', 'b2'],
      },
      {
        id: 'b1',
        type: 'rectangle',
        parentId: 'subgraph2',
        position: { x: 10, y: 10 },
        data: { label: 'b1' },
        childIds: [],
      },
      {
        id: 'b2',
        type: 'rectangle',
        parentId: 'subgraph2',
        position: { x: 10, y: 90 },
        data: { label: 'b2' },
        childIds: [],
      },
    ]
    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'a1',
        target: 'a2',
        type: 'normal-arrow',
      },
      {
        id: 'e2',
        source: 'b1',
        target: 'b2',
        type: 'normal-arrow',
      },
      {
        id: 'e3',
        source: 'subgraph1',
        target: 'subgraph2',
        type: 'normal-arrow',
      },
    ]

    const result = buildFlowchartCode({ nodes, edges }, 'TD')
    expect(result).toBe(`flowchart TD
    subgraph one
    a1[a1]
    a2[a2]
    end
    subgraph two
    b1[b1]
    b2[b2]
    end
    a1 --> a2
    b1 --> b2
    one --> two`)
  })

  it('should handle nested subgraphs', () => {
    const nodes: Node[] = [
      {
        id: 'ide1',
        type: 'subgraph',
        position: { x: 0, y: 0 },
        data: { label: 'one' },
        childIds: ['a1', 'a2', 'ide2'],
      },
      {
        id: 'a1',
        type: 'rectangle',
        parentId: 'ide1',
        position: { x: 10, y: 10 },
        data: { label: 'a1' },
        childIds: [],
      },
      {
        id: 'a2',
        type: 'rectangle',
        parentId: 'ide1',
        position: { x: 10, y: 90 },
        data: { label: 'a2' },
        childIds: [],
      },
      {
        id: 'ide2',
        type: 'subgraph',
        parentId: 'ide1',
        position: { x: 100, y: 50 },
        data: { label: 'two' },
        childIds: ['a3', 'a4'],
      },
      {
        id: 'a3',
        type: 'rectangle',
        parentId: 'ide2',
        position: { x: 10, y: 10 },
        data: { label: 'a3' },
        childIds: [],
      },
      {
        id: 'a4',
        type: 'rectangle',
        parentId: 'ide2',
        position: { x: 10, y: 90 },
        data: { label: 'a4' },
        childIds: [],
      },
    ]
    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'a1',
        target: 'a2',
        type: 'normal-arrow',
      },
      {
        id: 'e2',
        source: 'a3',
        target: 'a4',
        type: 'normal-arrow',
      },
    ]

    const result = buildFlowchartCode({ nodes, edges }, 'TD')
    expect(result).toBe(`flowchart TD
    subgraph ide1 [one]
    a1[a1]
    a2[a2]
    subgraph ide2 [two]
    a3[a3]
    a4[a4]
    end
    end
    a1 --> a2
    a3 --> a4`)
  })

  it('should handle nodes outside subgraphs connecting to nodes inside', () => {
    const nodes: Node[] = [
      {
        id: 'c1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'c1' },
        childIds: [],
      },
      {
        id: 'subgraph1',
        type: 'subgraph',
        position: { x: 100, y: 0 },
        data: { label: 'one' },
        childIds: ['a1', 'a2'],
      },
      {
        id: 'a1',
        type: 'rectangle',
        parentId: 'subgraph1',
        position: { x: 10, y: 10 },
        data: { label: 'a1' },
        childIds: [],
      },
      {
        id: 'a2',
        type: 'rectangle',
        parentId: 'subgraph1',
        position: { x: 10, y: 90 },
        data: { label: 'a2' },
        childIds: [],
      },
    ]
    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'c1',
        target: 'a2',
        type: 'normal-arrow',
      },
      {
        id: 'e2',
        source: 'a1',
        target: 'a2',
        type: 'normal-arrow',
      },
    ]

    const result = buildFlowchartCode({ nodes, edges }, 'TD')
    expect(result).toBe(`flowchart TD
    c1[c1]
    subgraph one
    a1[a1]
    a2[a2]
    end
    c1 & a1 --> a2`)
  })

  it('should maintain proper indentation for nested subgraphs', () => {
    const nodes: Node[] = [
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 0, y: 0 },
        data: { label: 'outer' },
        childIds: ['sg2'],
      },
      {
        id: 'sg2',
        type: 'subgraph',
        parentId: 'sg1',
        position: { x: 10, y: 10 },
        data: { label: 'inner' },
        childIds: ['n1'],
      },
      {
        id: 'n1',
        type: 'rectangle',
        parentId: 'sg2',
        position: { x: 10, y: 10 },
        data: { label: 'node1' },
        childIds: [],
      },
    ]
    const edges: Edge[] = []

    const result = buildFlowchartCode({ nodes, edges }, 'TD')
    expect(result).toBe(`flowchart TD
    subgraph outer
    subgraph inner
    n1[node1]
    end
    end`)
  })
})