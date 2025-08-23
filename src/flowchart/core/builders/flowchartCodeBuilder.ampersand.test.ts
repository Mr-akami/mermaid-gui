import { describe, it, expect } from 'vitest'
import { buildFlowchartCode } from './flowchartCodeBuilder'
import type { IRFlowchartData } from './deps'

describe('buildFlowchartCode with & operator', () => {
  it('should build code with & operator for pattern a --> b & c --> d', () => {
    const data: IRFlowchartData = {
      nodes: [
        { id: 'a', type: 'rectangle', data: { label: 'a' }, position: { x: 0, y: 0 }, childIds: [] },
        { id: 'b', type: 'rectangle', data: { label: 'b' }, position: { x: 100, y: 0 }, childIds: [] },
        { id: 'c', type: 'rectangle', data: { label: 'c' }, position: { x: 100, y: 100 }, childIds: [] },
        { id: 'd', type: 'rectangle', data: { label: 'd' }, position: { x: 200, y: 50 }, childIds: [] },
      ],
      edges: [
        { id: 'a-b', source: 'a', target: 'b', type: 'normal-arrow' },
        { id: 'a-c', source: 'a', target: 'c', type: 'normal-arrow' },
        { id: 'b-d', source: 'b', target: 'd', type: 'normal-arrow' },
        { id: 'c-d', source: 'c', target: 'd', type: 'normal-arrow' },
      ]
    }
    
    const result = buildFlowchartCode(data, 'LR')
    
    // Should generate "a --> b & c --> d" pattern
    expect(result).toContain('a --> b & c --> d')
    expect(result).toBe(`flowchart LR
    a[a]
    b[b]
    c[c]
    d[d]
    a --> b & c --> d`)
  })
  
  it('should build code with & operator for simple multiple targets', () => {
    const data: IRFlowchartData = {
      nodes: [
        { id: 'a', type: 'rectangle', data: { label: 'Start' }, position: { x: 0, y: 0 }, childIds: [] },
        { id: 'b', type: 'rectangle', data: { label: 'Process 1' }, position: { x: 100, y: 0 }, childIds: [] },
        { id: 'c', type: 'rectangle', data: { label: 'Process 2' }, position: { x: 100, y: 100 }, childIds: [] },
      ],
      edges: [
        { id: 'a-b', source: 'a', target: 'b', type: 'normal-arrow' },
        { id: 'a-c', source: 'a', target: 'c', type: 'normal-arrow' },
      ]
    }
    
    const result = buildFlowchartCode(data)
    
    // Should generate "a --> b & c" pattern
    expect(result).toContain('a --> b & c')
  })
  
  it('should handle different edge types correctly', () => {
    const data: IRFlowchartData = {
      nodes: [
        { id: 'a', type: 'rectangle', data: { label: 'a' }, position: { x: 0, y: 0 }, childIds: [] },
        { id: 'b', type: 'rectangle', data: { label: 'b' }, position: { x: 100, y: 0 }, childIds: [] },
        { id: 'c', type: 'rectangle', data: { label: 'c' }, position: { x: 100, y: 100 }, childIds: [] },
        { id: 'd', type: 'rectangle', data: { label: 'd' }, position: { x: 200, y: 50 }, childIds: [] },
      ],
      edges: [
        { id: 'a-b', source: 'a', target: 'b', type: 'thick-arrow' },
        { id: 'a-c', source: 'a', target: 'c', type: 'thick-arrow' },
        { id: 'b-d', source: 'b', target: 'd', type: 'dotted-arrow' },
        { id: 'c-d', source: 'c', target: 'd', type: 'dotted-arrow' },
      ]
    }
    
    const result = buildFlowchartCode(data)
    
    // Should generate "a ==> b & c -.-> d" pattern
    expect(result).toContain('a ==> b & c -.-> d')
  })
  
  it('should not use & operator when edges dont form the pattern', () => {
    const data: IRFlowchartData = {
      nodes: [
        { id: 'a', type: 'rectangle', data: { label: 'a' }, position: { x: 0, y: 0 }, childIds: [] },
        { id: 'b', type: 'rectangle', data: { label: 'b' }, position: { x: 100, y: 0 }, childIds: [] },
        { id: 'c', type: 'rectangle', data: { label: 'c' }, position: { x: 100, y: 100 }, childIds: [] },
        { id: 'd', type: 'rectangle', data: { label: 'd' }, position: { x: 200, y: 50 }, childIds: [] },
      ],
      edges: [
        { id: 'a-b', source: 'a', target: 'b', type: 'normal-arrow' },
        { id: 'a-c', source: 'a', target: 'c', type: 'normal-arrow' },
        { id: 'b-d', source: 'b', target: 'd', type: 'normal-arrow' },
        // Missing c -> d edge
      ]
    }
    
    const result = buildFlowchartCode(data)
    
    // Should use & for a --> b & c, but separate edge for b --> d
    expect(result).toContain('a --> b & c')
    expect(result).toContain('b --> d')
    expect(result).not.toContain('a --> b & c --> d')
  })
})