import { describe, it, expect } from 'vitest'
import { buildNodeCode } from './nodeCodeBuilder'
import type { Node } from './deps'

describe('nodeCodeBuilder', () => {
  describe('buildNodeCode', () => {
    it('should build code for a subgraph node', () => {
      const node: Node = {
        id: 'subgraph1',
        type: 'subgraph',
        childIds: ['node1', 'node2'],
        position: { x: 0, y: 0 },
        data: { label: 'Sub Process' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('subgraph subgraph1 [Sub Process]')
    })

    it('should build code for a rectangle node', () => {
      const node: Node = {
        id: 'node1',
        type: 'rectangle',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Process' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node1[Process]')
    })

    it('should build code for a circle node', () => {
      const node: Node = {
        id: 'node2',
        type: 'circle',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node2((Start))')
    })

    it('should build code for a diamond node', () => {
      const node: Node = {
        id: 'node3',
        type: 'diamond',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Decision' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node3{Decision}')
    })

    it('should handle empty label', () => {
      const node: Node = {
        id: 'node4',
        type: 'rectangle',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: '' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node4[ ]')
    })

    it('should escape special characters in labels', () => {
      const node: Node = {
        id: 'node5',
        type: 'rectangle',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Process [with brackets]' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node5[Process \\[with brackets\\]]')
    })

    it('should build code for roundEdges node', () => {
      const node: Node = {
        id: 'node6',
        type: 'roundEdges',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Round Edges' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node6(Round Edges)')
    })

    it('should build code for stadium node', () => {
      const node: Node = {
        id: 'node7',
        type: 'stadium',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Stadium' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node7([Stadium])')
    })

    it('should build code for subroutine node', () => {
      const node: Node = {
        id: 'node8',
        type: 'subroutine',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Subroutine' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node8[[Subroutine]]')
    })

    it('should build code for cylindrical node', () => {
      const node: Node = {
        id: 'node9',
        type: 'cylindrical',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Database' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node9[(Database)]')
    })

    it('should build code for parallelogram node', () => {
      const node: Node = {
        id: 'node10',
        type: 'parallelogram',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Input/Output' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node10[/Input/Output/]')
    })

    it('should build code for trapezoid node', () => {
      const node: Node = {
        id: 'node11',
        type: 'trapezoid',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Manual Process' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node11[\\Manual Process\\]')
    })

    it('should build code for hexagon node', () => {
      const node: Node = {
        id: 'node12',
        type: 'hexagon',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Preparation' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node12{{Preparation}}')
    })

    it('should build code for doubleCircle node', () => {
      const node: Node = {
        id: 'node13',
        type: 'doubleCircle',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Terminator' },
      }

      const result = buildNodeCode(node)
      expect(result).toBe('node13(((Terminator)))')
    })

    it('should throw error for unknown node type', () => {
      const node: Node = {
        id: 'node14',
        type: 'unknown' as any,
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Unknown' },
      }

      expect(() => buildNodeCode(node)).toThrow('Unknown node type: unknown')
    })
  })
})
