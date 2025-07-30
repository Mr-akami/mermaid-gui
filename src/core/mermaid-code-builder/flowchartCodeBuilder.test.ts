import { describe, it, expect } from 'vitest'
import { buildFlowchartCode } from './flowchartCodeBuilder'
import type { FlowchartData } from './deps'

describe('flowchartCodeBuilder', () => {
  describe('buildFlowchartCode', () => {
    it('should build code for a simple flowchart', () => {
      const data: FlowchartData = {
        nodes: [
          {
            id: 'A',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 0 },
            data: { label: 'Start' },
          },
          {
            id: 'B',
            type: 'diamond',
            childIds: [],
            position: { x: 0, y: 100 },
            data: { label: 'Decision' },
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'A',
            target: 'B',
            type: 'normal-arrow',
          },
        ],
      }

      const result = buildFlowchartCode(data)
      expect(result).toBe(`flowchart TD
    A[Start]
    B{Decision}
    A --> B`)
    })

    it('should build code for a flowchart with subgraph', () => {
      const data: FlowchartData = {
        nodes: [
          {
            id: 'sub1',
            type: 'subgraph',
            childIds: ['A', 'B'],
            position: { x: 0, y: 0 },
            data: { label: 'Process Group' },
          },
          {
            id: 'A',
            type: 'rectangle',
            parentId: 'sub1',
            childIds: [],
            position: { x: 10, y: 10 },
            data: { label: 'Task 1' },
          },
          {
            id: 'B',
            type: 'rectangle',
            parentId: 'sub1',
            childIds: [],
            position: { x: 10, y: 50 },
            data: { label: 'Task 2' },
          },
          {
            id: 'C',
            type: 'circle',
            childIds: [],
            position: { x: 0, y: 200 },
            data: { label: 'End' },
          },
        ],
        edges: [
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
        ],
      }

      const result = buildFlowchartCode(data)
      expect(result).toBe(`flowchart TD
    subgraph sub1 [Process Group]
        A[Task 1]
        B[Task 2]
    end
    C((End))
    A --> B
    B --> C`)
    })

    it('should handle empty flowchart', () => {
      const data: FlowchartData = {
        nodes: [],
        edges: [],
      }

      const result = buildFlowchartCode(data)
      expect(result).toBe('flowchart TD')
    })

    it('should handle edges with labels', () => {
      const data: FlowchartData = {
        nodes: [
          {
            id: 'A',
            type: 'diamond',
            childIds: [],
            position: { x: 0, y: 0 },
            data: { label: 'Check' },
          },
          {
            id: 'B',
            type: 'rectangle',
            childIds: [],
            position: { x: -50, y: 100 },
            data: { label: 'Yes Path' },
          },
          {
            id: 'C',
            type: 'rectangle',
            childIds: [],
            position: { x: 50, y: 100 },
            data: { label: 'No Path' },
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'A',
            target: 'B',
            type: 'normal-arrow',
            data: { label: 'Yes' },
          },
          {
            id: 'edge2',
            source: 'A',
            target: 'C',
            type: 'normal-arrow',
            data: { label: 'No' },
          },
        ],
      }

      const result = buildFlowchartCode(data)
      expect(result).toBe(`flowchart TD
    A{Check}
    B[Yes Path]
    C[No Path]
    A -->|Yes| B
    A -->|No| C`)
    })

    it('should optimize edges with & operator when multiple sources to multiple targets', () => {
      const data: FlowchartData = {
        nodes: [
          {
            id: 'A',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 0 },
            data: { label: 'A' },
          },
          {
            id: 'B',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 0 },
            data: { label: 'B' },
          },
          {
            id: 'C',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 100 },
            data: { label: 'C' },
          },
          {
            id: 'D',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 100 },
            data: { label: 'D' },
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'A',
            target: 'C',
            type: 'normal-arrow',
          },
          {
            id: 'edge2',
            source: 'A',
            target: 'D',
            type: 'normal-arrow',
          },
          {
            id: 'edge3',
            source: 'B',
            target: 'C',
            type: 'normal-arrow',
          },
          {
            id: 'edge4',
            source: 'B',
            target: 'D',
            type: 'normal-arrow',
          },
        ],
      }

      const result = buildFlowchartCode(data)
      expect(result).toBe(`flowchart TD
    A[A]
    B[B]
    C[C]
    D[D]
    A & B --> C & D`)
    })

    it('should optimize edges with & operator and labels', () => {
      const data: FlowchartData = {
        nodes: [
          {
            id: 'A',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 0 },
            data: { label: 'Source A' },
          },
          {
            id: 'B',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 0 },
            data: { label: 'Source B' },
          },
          {
            id: 'C',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 100 },
            data: { label: 'Target C' },
          },
          {
            id: 'D',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 100 },
            data: { label: 'Target D' },
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'A',
            target: 'C',
            type: 'normal-arrow',
            data: { label: 'Process' },
          },
          {
            id: 'edge2',
            source: 'A',
            target: 'D',
            type: 'normal-arrow',
            data: { label: 'Process' },
          },
          {
            id: 'edge3',
            source: 'B',
            target: 'C',
            type: 'normal-arrow',
            data: { label: 'Process' },
          },
          {
            id: 'edge4',
            source: 'B',
            target: 'D',
            type: 'normal-arrow',
            data: { label: 'Process' },
          },
        ],
      }

      const result = buildFlowchartCode(data)
      expect(result).toBe(`flowchart TD
    A[Source A]
    B[Source B]
    C[Target C]
    D[Target D]
    A & B -->|Process| C & D`)
    })

    it('should not optimize when edges have different types', () => {
      const data: FlowchartData = {
        nodes: [
          {
            id: 'A',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 0 },
            data: { label: 'A' },
          },
          {
            id: 'B',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 0 },
            data: { label: 'B' },
          },
          {
            id: 'C',
            type: 'rectangle',
            childIds: [],
            position: { x: 50, y: 100 },
            data: { label: 'C' },
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'A',
            target: 'C',
            type: 'normal-arrow',
          },
          {
            id: 'edge2',
            source: 'B',
            target: 'C',
            type: 'dotted-arrow',
          },
        ],
      }

      const result = buildFlowchartCode(data)
      expect(result).toBe(`flowchart TD
    A[A]
    B[B]
    C[C]
    A --> C
    B -.-> C`)
    })

    it('should not optimize when edges have different labels', () => {
      const data: FlowchartData = {
        nodes: [
          {
            id: 'A',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 0 },
            data: { label: 'A' },
          },
          {
            id: 'B',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 0 },
            data: { label: 'B' },
          },
          {
            id: 'C',
            type: 'rectangle',
            childIds: [],
            position: { x: 50, y: 100 },
            data: { label: 'C' },
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'A',
            target: 'C',
            type: 'normal-arrow',
            data: { label: 'Yes' },
          },
          {
            id: 'edge2',
            source: 'B',
            target: 'C',
            type: 'normal-arrow',
            data: { label: 'No' },
          },
        ],
      }

      const result = buildFlowchartCode(data)
      expect(result).toBe(`flowchart TD
    A[A]
    B[B]
    C[C]
    A -->|Yes| C
    B -->|No| C`)
    })

    it('should not optimize incomplete edge sets', () => {
      const data: FlowchartData = {
        nodes: [
          {
            id: 'A',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 0 },
            data: { label: 'A' },
          },
          {
            id: 'B',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 0 },
            data: { label: 'B' },
          },
          {
            id: 'C',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 100 },
            data: { label: 'C' },
          },
          {
            id: 'D',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 100 },
            data: { label: 'D' },
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'A',
            target: 'C',
            type: 'normal-arrow',
          },
          {
            id: 'edge2',
            source: 'A',
            target: 'D',
            type: 'normal-arrow',
          },
          {
            id: 'edge3',
            source: 'B',
            target: 'C',
            type: 'normal-arrow',
          },
          // Missing B->D edge
        ],
      }

      const result = buildFlowchartCode(data)
      const lines = result.split('\n')
      
      // Check that all nodes are present
      expect(result).toContain('A[A]')
      expect(result).toContain('B[B]')
      expect(result).toContain('C[C]')
      expect(result).toContain('D[D]')
      
      // Check that edges are not optimized (should be individual)
      expect(result).toContain('A --> C')
      expect(result).toContain('A --> D')
      expect(result).toContain('B --> C')
      expect(result).not.toContain('&') // No optimization should occur
      
      // Check topological order: A and B (roots) should come before C and D
      const aIndex = lines.findIndex(line => line.includes('A[A]'))
      const bIndex = lines.findIndex(line => line.includes('B[B]'))
      const cIndex = lines.findIndex(line => line.includes('C[C]'))
      const dIndex = lines.findIndex(line => line.includes('D[D]'))
      
      expect(Math.max(aIndex, bIndex)).toBeLessThan(Math.min(cIndex, dIndex))
    })

    it('should optimize multiple edge types independently', () => {
      const data: FlowchartData = {
        nodes: [
          {
            id: 'A',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 0 },
            data: { label: 'A' },
          },
          {
            id: 'B',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 0 },
            data: { label: 'B' },
          },
          {
            id: 'C',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 100 },
            data: { label: 'C' },
          },
          {
            id: 'D',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 100 },
            data: { label: 'D' },
          },
        ],
        edges: [
          // Normal arrows group
          {
            id: 'edge1',
            source: 'A',
            target: 'C',
            type: 'normal-arrow',
          },
          {
            id: 'edge2',
            source: 'A',
            target: 'D',
            type: 'normal-arrow',
          },
          {
            id: 'edge3',
            source: 'B',
            target: 'C',
            type: 'normal-arrow',
          },
          {
            id: 'edge4',
            source: 'B',
            target: 'D',
            type: 'normal-arrow',
          },
          // Dotted arrows group
          {
            id: 'edge5',
            source: 'C',
            target: 'A',
            type: 'dotted-arrow',
          },
          {
            id: 'edge6',
            source: 'D',
            target: 'A',
            type: 'dotted-arrow',
          },
        ],
      }

      const result = buildFlowchartCode(data)
      
      // Check that all nodes are present
      expect(result).toContain('A[A]')
      expect(result).toContain('B[B]')
      expect(result).toContain('C[C]')
      expect(result).toContain('D[D]')
      
      // Check that edges are optimized by type
      expect(result).toContain('A & B --> C & D') // Normal arrows optimized
      expect(result).toContain('C & D -.-> A') // Dotted arrows optimized
      
      // Since there's a cycle (C->A, D->A), topological order isn't strictly defined
      // But we can check that optimization still works
      expect(result.startsWith('flowchart TD'))
    })

    it('should order nodes using topological sort (DAG)', () => {
      const data: FlowchartData = {
        nodes: [
          {
            id: 'E',
            type: 'rectangle',
            childIds: [],
            position: { x: 200, y: 200 },
            data: { label: 'End' },
          },
          {
            id: 'A',
            type: 'rectangle',
            childIds: [],
            position: { x: 0, y: 0 },
            data: { label: 'Start' },
          },
          {
            id: 'C',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 100 },
            data: { label: 'Middle' },
          },
          {
            id: 'B',
            type: 'rectangle',
            childIds: [],
            position: { x: 50, y: 50 },
            data: { label: 'Second' },
          },
        ],
        edges: [
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
          {
            id: 'edge3',
            source: 'C',
            target: 'E',
            type: 'normal-arrow',
          },
        ],
      }

      const result = buildFlowchartCode(data)
      // Should be ordered A -> B -> C -> E despite nodes being defined out of order
      expect(result).toBe(`flowchart TD
    A[Start]
    B[Second]
    C[Middle]
    E[End]
    A --> B
    B --> C
    C --> E`)
    })

    it('should handle multiple root nodes correctly', () => {
      const data: FlowchartData = {
        nodes: [
          {
            id: 'C',
            type: 'rectangle',
            childIds: [],
            position: { x: 100, y: 100 },
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
            position: { x: 50, y: 0 },
            data: { label: 'Root2' },
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'A',
            target: 'C',
            type: 'normal-arrow',
          },
          {
            id: 'edge2',
            source: 'B',
            target: 'C',
            type: 'normal-arrow',
          },
        ],
      }

      const result = buildFlowchartCode(data)
      // Both A and B are roots, should appear before C
      const lines = result.split('\n')
      const aIndex = lines.findIndex(line => line.includes('A[Root1]'))
      const bIndex = lines.findIndex(line => line.includes('B[Root2]'))
      const cIndex = lines.findIndex(line => line.includes('C[Target]'))
      
      expect(aIndex).toBeGreaterThan(0)
      expect(bIndex).toBeGreaterThan(0)
      expect(cIndex).toBeGreaterThan(0)
      expect(Math.max(aIndex, bIndex)).toBeLessThan(cIndex)
    })
  })
})
