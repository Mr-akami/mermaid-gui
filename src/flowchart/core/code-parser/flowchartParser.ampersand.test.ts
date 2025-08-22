import { describe, it, expect } from 'vitest'
import { parseFlowchartCode } from './flowchartParser'

describe('parseFlowchartCode with & operator', () => {
  it('should parse simple & operator (a --> b & c --> d)', () => {
    const code = `flowchart LR
    a --> b & c --> d`
    
    const result = parseFlowchartCode(code)
    
    expect(result.direction).toBe('LR')
    expect(result.nodes).toHaveLength(4)
    expect(result.edges).toHaveLength(4)
    
    // Check nodes
    expect(result.nodes.map(n => n.id).sort()).toEqual(['a', 'b', 'c', 'd'])
    
    // Check edges - a connects to b and c, then both b and c connect to d
    const edges = result.edges.map(e => `${e.source}->${e.target}`).sort()
    expect(edges).toEqual([
      'a->b',
      'a->c',
      'b->d',
      'c->d'
    ])
  })
  
  it('should parse & operator with multiple targets (a --> b & c)', () => {
    const code = `flowchart TD
    a --> b & c`
    
    const result = parseFlowchartCode(code)
    
    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(2)
    
    const edges = result.edges.map(e => `${e.source}->${e.target}`).sort()
    expect(edges).toEqual([
      'a->b',
      'a->c'
    ])
  })
  
  it('should parse & operator with multiple sources (a & b --> c)', () => {
    const code = `flowchart TD
    a & b --> c`
    
    const result = parseFlowchartCode(code)
    
    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(2)
    
    const edges = result.edges.map(e => `${e.source}->${e.target}`).sort()
    expect(edges).toEqual([
      'a->c',
      'b->c'
    ])
  })
  
  it('should parse & operator with node definitions', () => {
    const code = `flowchart LR
    a[Start] --> b[Process] & c[Alternative] --> d[End]`
    
    const result = parseFlowchartCode(code)
    
    expect(result.nodes).toHaveLength(4)
    expect(result.edges).toHaveLength(4)
    
    // Check node labels
    const nodeLabels = Object.fromEntries(result.nodes.map(n => [n.id, n.data.label]))
    expect(nodeLabels).toEqual({
      a: 'Start',
      b: 'Process',
      c: 'Alternative',
      d: 'End'
    })
    
    // Check edges - both b and c connect to d
    const edges = result.edges.map(e => `${e.source}->${e.target}`).sort()
    expect(edges).toEqual([
      'a->b',
      'a->c',
      'b->d',
      'c->d'
    ])
  })
  
  it('should parse & operator with different edge types', () => {
    const code = `flowchart LR
    a ==> b & c -.-> d`
    
    const result = parseFlowchartCode(code)
    
    expect(result.nodes).toHaveLength(4)
    
    // For "a ==> b & c -.-> d", we should get:
    // a -> b (thick-arrow)
    // a -> c (thick-arrow)
    // b -> d (dotted-arrow)
    // c -> d (dotted-arrow)
    expect(result.edges).toHaveLength(4)
    
    // Check edge types
    const aToB = result.edges.find(e => e.source === 'a' && e.target === 'b')
    const aToC = result.edges.find(e => e.source === 'a' && e.target === 'c')
    const bToD = result.edges.find(e => e.source === 'b' && e.target === 'd')
    const cToD = result.edges.find(e => e.source === 'c' && e.target === 'd')
    
    expect(aToB?.type).toBe('thick-arrow')
    expect(aToC?.type).toBe('thick-arrow')
    expect(bToD?.type).toBe('dotted-arrow')
    expect(cToD?.type).toBe('dotted-arrow')
  })
  
  it('should parse complex & operator chains', () => {
    const code = `flowchart LR
    a --> b & c & d --> e & f`
    
    const result = parseFlowchartCode(code)
    
    expect(result.nodes).toHaveLength(6)
    
    // Check all expected edges
    const edges = result.edges.map(e => `${e.source}->${e.target}`).sort()
    expect(edges).toContain('a->b')
    expect(edges).toContain('a->c')
    expect(edges).toContain('a->d')
    expect(edges).toContain('b->e')
    expect(edges).toContain('b->f')
    expect(edges).toContain('c->e')
    expect(edges).toContain('c->f')
    expect(edges).toContain('d->e')
    expect(edges).toContain('d->f')
  })
})