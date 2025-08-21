import { describe, it, expect } from 'vitest'
import { parseFlowchartCode } from './flowchartParser'

describe('parseFlowchartCode with nested subgraphs', () => {
  it('should parse nested subgraphs with correct parent relationships', () => {
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

    const result = parseFlowchartCode(code)
    
    console.log('Parsed nodes:', result.nodes.map(n => ({
      id: n.id,
      type: n.type,
      parentId: n.parentId,
      childIds: n.childIds
    })))
    
    // Find specific nodes
    const topNode = result.nodes.find(n => n.id === 'TOP')
    const b1Node = result.nodes.find(n => n.id === 'B1')
    const b2Node = result.nodes.find(n => n.id === 'B2')
    const i1Node = result.nodes.find(n => n.id === 'i1')
    const f1Node = result.nodes.find(n => n.id === 'f1')
    const i2Node = result.nodes.find(n => n.id === 'i2')
    const f2Node = result.nodes.find(n => n.id === 'f2')
    
    // Check that nodes exist
    expect(topNode).toBeDefined()
    expect(b1Node).toBeDefined()
    expect(b2Node).toBeDefined()
    
    // Check parent relationships
    expect(b1Node?.parentId).toBe('TOP')
    expect(b2Node?.parentId).toBe('TOP')
    expect(i1Node?.parentId).toBe('B1')
    expect(f1Node?.parentId).toBe('B1')
    expect(i2Node?.parentId).toBe('B2')
    expect(f2Node?.parentId).toBe('B2')
    
    // Check childIds
    expect(topNode?.childIds).toContain('B1')
    expect(topNode?.childIds).toContain('B2')
    expect(b1Node?.childIds).toContain('i1')
    expect(b1Node?.childIds).toContain('f1')
    expect(b2Node?.childIds).toContain('i2')
    expect(b2Node?.childIds).toContain('f2')
  })
})