import { describe, it, expect } from 'vitest'
import { buildEdgeCode } from './edgeCodeBuilder'
import type { IREdge } from './deps'

describe('edgeCodeBuilder', () => {
  describe('buildEdgeCode', () => {
    it('should build code for a normal edge', () => {
      const edge: IREdge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        type: 'normal',
      }

      const result = buildEdgeCode(edge)
      expect(result).toBe('node1 --- node2')
    })

    it('should build code for a normal edge with arrow', () => {
      const edge: IREdge = {
        id: 'edge2',
        source: 'node1',
        target: 'node2',
        type: 'normal-arrow',
      }

      const result = buildEdgeCode(edge)
      expect(result).toBe('node1 --> node2')
    })

    it('should build code for a thick edge', () => {
      const edge: IREdge = {
        id: 'edge3',
        source: 'node1',
        target: 'node2',
        type: 'thick',
      }

      const result = buildEdgeCode(edge)
      expect(result).toBe('node1 === node2')
    })

    it('should build code for a thick edge with arrow', () => {
      const edge: IREdge = {
        id: 'edge4',
        source: 'node1',
        target: 'node2',
        type: 'thick-arrow',
      }

      const result = buildEdgeCode(edge)
      expect(result).toBe('node1 ==> node2')
    })

    it('should build code for a dotted edge', () => {
      const edge: IREdge = {
        id: 'edge5',
        source: 'node1',
        target: 'node2',
        type: 'dotted',
      }

      const result = buildEdgeCode(edge)
      expect(result).toBe('node1 -.- node2')
    })

    it('should build code for a dotted edge with arrow', () => {
      const edge: IREdge = {
        id: 'edge6',
        source: 'node1',
        target: 'node2',
        type: 'dotted-arrow',
      }

      const result = buildEdgeCode(edge)
      expect(result).toBe('node1 -.-> node2')
    })

    it('should build code for an edge with label', () => {
      const edge: IREdge = {
        id: 'edge7',
        source: 'node1',
        target: 'node2',
        type: 'normal-arrow',
        data: {
          label: 'Yes',
        },
      }

      const result = buildEdgeCode(edge)
      expect(result).toBe('node1 -->|Yes| node2')
    })

    it('should escape special characters in edge labels', () => {
      const edge: IREdge = {
        id: 'edge8',
        source: 'node1',
        target: 'node2',
        type: 'normal-arrow',
        data: {
          label: 'Label |with| pipes',
        },
      }

      const result = buildEdgeCode(edge)
      expect(result).toBe('node1 -->|Label \\|with\\| pipes| node2')
    })
  })
})
