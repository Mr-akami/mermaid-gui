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
      expect(result).toBe(`flowchart TD
    A[A]
    B[B]
    C[C]
    D[D]
    A --> C
    A --> D
    B --> C`)
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
      expect(result).toBe(`flowchart TD
    A[A]
    B[B]
    C[C]
    D[D]
    A & B --> C & D
    C & D -.-> A`)
    })
  })
})
