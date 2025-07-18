import { describe, it, expect } from 'vitest'
import { parseFlowchart } from './flowchartParser'

describe('flowchartParser', () => {
  describe('parseFlowchart', () => {
    it('should parse a simple flowchart', () => {
      const code = `flowchart TD
    A[Start]
    B{Decision}
    A --> B`

      const result = parseFlowchart(code)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.nodes).toHaveLength(2)
      expect(result.data!.edges).toHaveLength(1)

      expect(result.data!.nodes[0]).toMatchObject({
        id: 'A',
        type: 'rectangle',
        data: { label: 'Start' },
      })

      expect(result.data!.nodes[1]).toMatchObject({
        id: 'B',
        type: 'diamond',
        data: { label: 'Decision' },
      })

      expect(result.data!.edges[0]).toMatchObject({
        source: 'A',
        target: 'B',
        type: 'normal-arrow',
      })
    })

    it('should parse a flowchart with subgraph', () => {
      const code = `flowchart TD
    subgraph sub1 [Process Group]
        A[Task 1]
        B[Task 2]
    end
    C((End))
    A --> B
    B --> C`

      const result = parseFlowchart(code)

      expect(result.success).toBe(true)
      expect(result.data!.nodes).toHaveLength(4) // sub1, A, B, C
      expect(result.data!.edges).toHaveLength(2)

      // Check subgraph
      const subgraph = result.data!.nodes.find((n) => n.id === 'sub1')
      expect(subgraph).toMatchObject({
        id: 'sub1',
        type: 'subgraph',
        childIds: ['A', 'B'],
        data: { label: 'Process Group' },
      })

      // Check nodes have correct parent
      const nodeA = result.data!.nodes.find((n) => n.id === 'A')
      expect(nodeA!.parentId).toBe('sub1')

      const nodeB = result.data!.nodes.find((n) => n.id === 'B')
      expect(nodeB!.parentId).toBe('sub1')
    })

    it('should handle edges with labels', () => {
      const code = `flowchart TD
    A{Check}
    B[Yes Path]
    C[No Path]
    A -->|Yes| B
    A -->|No| C`

      const result = parseFlowchart(code)

      expect(result.success).toBe(true)
      expect(result.data!.edges).toHaveLength(2)

      expect(result.data!.edges[0]).toMatchObject({
        source: 'A',
        target: 'B',
        type: 'normal-arrow',
        data: { label: 'Yes' },
      })

      expect(result.data!.edges[1]).toMatchObject({
        source: 'A',
        target: 'C',
        type: 'normal-arrow',
        data: { label: 'No' },
      })
    })

    it('should handle empty flowchart', () => {
      const code = `flowchart TD`

      const result = parseFlowchart(code)

      expect(result.success).toBe(true)
      expect(result.data!.nodes).toHaveLength(0)
      expect(result.data!.edges).toHaveLength(0)
    })

    it('should handle invalid syntax', () => {
      const code = `flowchart TD
    A[Node
    B --> A`

      const result = parseFlowchart(code)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Invalid syntax')
    })

    it('should handle nested subgraphs', () => {
      const code = `flowchart TD
    subgraph outer [Outer]
        subgraph inner [Inner]
            A[Node A]
        end
        B[Node B]
    end`

      const result = parseFlowchart(code)

      expect(result.success).toBe(true)
      expect(result.data!.nodes).toHaveLength(4) // outer, inner, A, B

      const inner = result.data!.nodes.find((n) => n.id === 'inner')
      expect(inner!.parentId).toBe('outer')

      const nodeA = result.data!.nodes.find((n) => n.id === 'A')
      expect(nodeA!.parentId).toBe('inner')
    })
  })
})
