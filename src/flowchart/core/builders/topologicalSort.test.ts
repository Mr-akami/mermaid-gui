import { describe, it, expect } from 'vitest'
import { topologicalSort } from './topologicalSort'
import type { FlowchartData } from './deps'

describe('topologicalSort', () => {
  it('should return empty array for empty input', () => {
    const result = topologicalSort([], [])
    expect(result).toEqual([])
  })

  it('should handle single node', () => {
    const nodes: FlowchartData['nodes'] = [
      {
        id: 'A',
        type: 'rectangle',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Node A' },
      }
    ]
    const edges: FlowchartData['edges'] = []

    const result = topologicalSort(nodes, edges)
    expect(result).toEqual(nodes)
  })

  it('should sort simple linear chain', () => {
    const nodes: FlowchartData['nodes'] = [
      {
        id: 'C',
        type: 'rectangle',
        childIds: [],
        position: { x: 200, y: 0 },
        data: { label: 'Third' },
      },
      {
        id: 'A',
        type: 'rectangle',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'First' },
      },
      {
        id: 'B',
        type: 'rectangle',
        childIds: [],
        position: { x: 100, y: 0 },
        data: { label: 'Second' },
      },
    ]
    const edges: FlowchartData['edges'] = [
      {
        id: 'edge1',
        source: 'A',
        target: 'B',
        type: 'normal-arrow',
      },
      {
        id: 'edge2',
        source: 'B',
        target: 'C',
        type: 'normal-arrow',
      },
    ]

    const result = topologicalSort(nodes, edges)
    const ids = result.map(node => node.id)
    expect(ids).toEqual(['A', 'B', 'C'])
  })

  it('should handle multiple root nodes', () => {
    const nodes: FlowchartData['nodes'] = [
      {
        id: 'D',
        type: 'rectangle',
        childIds: [],
        position: { x: 150, y: 100 },
        data: { label: 'Target' },
      },
      {
        id: 'A',
        type: 'rectangle',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Root1' },
      },
      {
        id: 'B',
        type: 'rectangle',
        childIds: [],
        position: { x: 100, y: 0 },
        data: { label: 'Root2' },
      },
    ]
    const edges: FlowchartData['edges'] = [
      {
        id: 'edge1',
        source: 'A',
        target: 'D',
        type: 'normal-arrow',
      },
      {
        id: 'edge2',
        source: 'B',
        target: 'D',
        type: 'normal-arrow',
      },
    ]

    const result = topologicalSort(nodes, edges)
    const ids = result.map(node => node.id)
    
    // Both A and B should come before D
    const aIndex = ids.indexOf('A')
    const bIndex = ids.indexOf('B')
    const dIndex = ids.indexOf('D')
    
    expect(aIndex).toBeGreaterThanOrEqual(0)
    expect(bIndex).toBeGreaterThanOrEqual(0)
    expect(dIndex).toBeGreaterThanOrEqual(0)
    expect(Math.max(aIndex, bIndex)).toBeLessThan(dIndex)
  })

  it('should handle diamond pattern', () => {
    const nodes: FlowchartData['nodes'] = [
      {
        id: 'A',
        type: 'rectangle',
        childIds: [],
        position: { x: 50, y: 0 },
        data: { label: 'Start' },
      },
      {
        id: 'B',
        type: 'rectangle',
        childIds: [],
        position: { x: 0, y: 50 },
        data: { label: 'Left' },
      },
      {
        id: 'C',
        type: 'rectangle',
        childIds: [],
        position: { x: 100, y: 50 },
        data: { label: 'Right' },
      },
      {
        id: 'D',
        type: 'rectangle',
        childIds: [],
        position: { x: 50, y: 100 },
        data: { label: 'End' },
      },
    ]
    const edges: FlowchartData['edges'] = [
      {
        id: 'edge1',
        source: 'A',
        target: 'B',
        type: 'normal-arrow',
      },
      {
        id: 'edge2',
        source: 'A',
        target: 'C',
        type: 'normal-arrow',
      },
      {
        id: 'edge3',
        source: 'B',
        target: 'D',
        type: 'normal-arrow',
      },
      {
        id: 'edge4',
        source: 'C',
        target: 'D',
        type: 'normal-arrow',
      },
    ]

    const result = topologicalSort(nodes, edges)
    const ids = result.map(node => node.id)
    
    // A should be first, D should be last
    expect(ids[0]).toBe('A')
    expect(ids[ids.length - 1]).toBe('D')
    
    // B and C should be in the middle
    const bIndex = ids.indexOf('B')
    const cIndex = ids.indexOf('C')
    expect(bIndex).toBeGreaterThan(0)
    expect(cIndex).toBeGreaterThan(0)
    expect(bIndex).toBeLessThan(ids.length - 1)
    expect(cIndex).toBeLessThan(ids.length - 1)
  })

  it('should handle disconnected nodes', () => {
    const nodes: FlowchartData['nodes'] = [
      {
        id: 'A',
        type: 'rectangle',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Connected' },
      },
      {
        id: 'B',
        type: 'rectangle',
        childIds: [],
        position: { x: 100, y: 0 },
        data: { label: 'Connected' },
      },
      {
        id: 'C',
        type: 'rectangle',
        childIds: [],
        position: { x: 200, y: 0 },
        data: { label: 'Disconnected' },
      },
    ]
    const edges: FlowchartData['edges'] = [
      {
        id: 'edge1',
        source: 'A',
        target: 'B',
        type: 'normal-arrow',
      },
    ]

    const result = topologicalSort(nodes, edges)
    expect(result).toHaveLength(3)
    
    // A should come before B
    const ids = result.map(node => node.id)
    const aIndex = ids.indexOf('A')
    const bIndex = ids.indexOf('B')
    expect(aIndex).toBeLessThan(bIndex)
    
    // C should be included somewhere
    expect(ids).toContain('C')
  })
})