import { describe, it, expect } from 'vitest'
import { parseFlowchart } from './flowchartParser'

describe('parseFlowchart with chained edges', () => {
  it('should parse chained edges like A --> TOP --> B', () => {
    const code = `flowchart LR
  subgraph TOP
    direction TB
    subgraph B1
        direction RL
        i1 -->f1
    end
    subgraph B2
        direction BT
        i2 -->f2
    end
  end
  A --> TOP --> B
  B1 --> B2`

    const result = parseFlowchart(code)
    
    expect(result.success).toBe(true)
    if (result.success) {
      const { nodes, edges } = result.data
      
      // Check nodes
      const nodeIds = nodes.map(n => n.id)
      expect(nodeIds).toContain('A')
      expect(nodeIds).toContain('TOP')
      expect(nodeIds).toContain('B')
      expect(nodeIds).toContain('B1')
      expect(nodeIds).toContain('B2')
      expect(nodeIds).toContain('i1')
      expect(nodeIds).toContain('f1')
      expect(nodeIds).toContain('i2')
      expect(nodeIds).toContain('f2')
      
      // Check edges
      const edgePairs = edges.map(e => `${e.source}->${e.target}`)
      console.log('Edge pairs:', edgePairs)
      
      // Should have these edges from chained edge
      expect(edgePairs).toContain('A->TOP')
      expect(edgePairs).toContain('TOP->B')
      
      // Should have other edges
      expect(edgePairs).toContain('i1->f1')
      expect(edgePairs).toContain('i2->f2')
      expect(edgePairs).toContain('B1->B2')
    }
  })
  
  it('should parse simple chained edges', () => {
    const code = `flowchart LR
  A --> B --> C`

    const result = parseFlowchart(code)
    
    expect(result.success).toBe(true)
    if (result.success) {
      const { edges } = result.data
      
      const edgePairs = edges.map(e => `${e.source}->${e.target}`)
      console.log('Simple chain edge pairs:', edgePairs)
      
      expect(edgePairs).toContain('A->B')
      expect(edgePairs).toContain('B->C')
    }
  })
})