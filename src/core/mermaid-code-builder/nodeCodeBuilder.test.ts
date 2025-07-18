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
  })
})
