import { describe, it, expect } from 'vitest'
import { parseFlowchartCode } from './flowchartParser'

describe('flowchartParser', () => {
  it('should parse the sample flowchart correctly', () => {
    const code = `flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]`
    
    const result = parseFlowchartCode(code)
    
    expect(result.direction).toBe('TD')
    expect(result.nodes).toHaveLength(6)
    expect(result.edges).toHaveLength(5)
    
    // Check nodes
    const nodeA = result.nodes.find(n => n.id === 'A')
    expect(nodeA).toBeDefined()
    expect(nodeA?.type).toBe('rectangle')
    expect(nodeA?.data.label).toBe('Christmas')
    
    const nodeB = result.nodes.find(n => n.id === 'B')
    expect(nodeB).toBeDefined()
    expect(nodeB?.type).toBe('roundEdges')
    expect(nodeB?.data.label).toBe('Go shopping')
    
    const nodeC = result.nodes.find(n => n.id === 'C')
    expect(nodeC).toBeDefined()
    expect(nodeC?.type).toBe('diamond')
    expect(nodeC?.data.label).toBe('Let me think')
    
    // Check edges
    const edgeAB = result.edges.find(e => e.source === 'A' && e.target === 'B')
    expect(edgeAB).toBeDefined()
    expect(edgeAB?.type).toBe('normal-arrow')
    expect(edgeAB?.data?.label).toBe('Get money')
    
    const edgeBC = result.edges.find(e => e.source === 'B' && e.target === 'C')
    expect(edgeBC).toBeDefined()
    expect(edgeBC?.type).toBe('normal-arrow')
  })
  
  it('should parse different node types', () => {
    const code = `flowchart LR
    A[Rectangle]
    B(Round Edges)
    C((Circle))
    D{Diamond}
    E{{Hexagon}}
    F[[Subroutine]]
    G[(Cylindrical)]
    H([Stadium])
    I[/Parallelogram/]
    J[\\\\Trapezoid\\\\]
    K(((Double Circle)))`
    
    const result = parseFlowchartCode(code)
    
    expect(result.direction).toBe('LR')
    expect(result.nodes).toHaveLength(11)
    
    // Check node types by ID instead of order
    expect(result.nodes.find(n => n.id === 'A')?.type).toBe('rectangle')
    expect(result.nodes.find(n => n.id === 'B')?.type).toBe('roundEdges')
    expect(result.nodes.find(n => n.id === 'C')?.type).toBe('circle')
    expect(result.nodes.find(n => n.id === 'D')?.type).toBe('diamond')
    expect(result.nodes.find(n => n.id === 'E')?.type).toBe('hexagon')
    expect(result.nodes.find(n => n.id === 'F')?.type).toBe('subroutine')
    expect(result.nodes.find(n => n.id === 'G')?.type).toBe('cylindrical')
    expect(result.nodes.find(n => n.id === 'H')?.type).toBe('stadium')
    expect(result.nodes.find(n => n.id === 'I')?.type).toBe('parallelogram')
    expect(result.nodes.find(n => n.id === 'J')?.type).toBe('trapezoid')
    expect(result.nodes.find(n => n.id === 'K')?.type).toBe('doubleCircle')
  })
  
  it('should parse edge types', () => {
    const code = `flowchart TD
    A --> B
    B ==> C
    C -.-> D
    D --> E`
    
    const result = parseFlowchartCode(code)
    
    expect(result.edges).toHaveLength(4)
    expect(result.edges[0].type).toBe('normal-arrow')
    expect(result.edges[1].type).toBe('thick-arrow')
    expect(result.edges[2].type).toBe('dotted-arrow')
    expect(result.edges[3].type).toBe('normal-arrow')
  })
  
  it('should handle line breaks in labels', () => {
    const code = `flowchart TD
    A[Line 1<br>Line 2<br>Line 3]
    B[Single line]`
    
    const result = parseFlowchartCode(code)
    
    const nodeA = result.nodes.find(n => n.id === 'A')
    expect(nodeA?.data.label).toBe('Line 1\nLine 2\nLine 3')
    
    const nodeB = result.nodes.find(n => n.id === 'B')
    expect(nodeB?.data.label).toBe('Single line')
  })
  
  it('should parse subgraphs', () => {
    const code = `flowchart TD
    subgraph sg1 [Group 1]
      A[Node A]
      B[Node B]
    end
    C[Node C]`
    
    const result = parseFlowchartCode(code)
    
    const subgraph = result.nodes.find(n => n.id === 'sg1')
    expect(subgraph).toBeDefined()
    expect(subgraph?.type).toBe('subgraph')
    expect(subgraph?.data.label).toBe('Group 1')
    
    const nodeA = result.nodes.find(n => n.id === 'A')
    expect(nodeA?.parentId).toBe('sg1')
    
    const nodeB = result.nodes.find(n => n.id === 'B')
    expect(nodeB?.parentId).toBe('sg1')
    
    const nodeC = result.nodes.find(n => n.id === 'C')
    expect(nodeC?.parentId).toBeUndefined()
  })
})