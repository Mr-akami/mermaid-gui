import { describe, it, expect } from 'vitest'
import { parseNode } from './nodeParser'

describe('nodeParser', () => {
  describe('parseNode', () => {
    it('should parse a rectangle node', () => {
      const line = 'A[Start]'
      const result = parseNode(line)

      expect(result).toEqual({
        id: 'A',
        type: 'rectangle',
        label: 'Start',
      })
    })

    it('should parse a circle node', () => {
      const line = 'B((Process))'
      const result = parseNode(line)

      expect(result).toEqual({
        id: 'B',
        type: 'circle',
        label: 'Process',
      })
    })

    it('should parse a diamond node', () => {
      const line = 'C{Decision}'
      const result = parseNode(line)

      expect(result).toEqual({
        id: 'C',
        type: 'diamond',
        label: 'Decision',
      })
    })

    it('should parse a subgraph declaration', () => {
      const line = 'subgraph sub1 [Process Group]'
      const result = parseNode(line)

      expect(result).toEqual({
        id: 'sub1',
        type: 'subgraph',
        label: 'Process Group',
      })
    })

    it('should handle escaped characters in labels', () => {
      const line = 'D[Process \\[with brackets\\]]'
      const result = parseNode(line)

      expect(result).toEqual({
        id: 'D',
        type: 'rectangle',
        label: 'Process [with brackets]',
      })
    })

    it('should return null for non-node lines', () => {
      const line = 'A --> B'
      const result = parseNode(line)

      expect(result).toBeNull()
    })

    it('should handle nodes with empty labels', () => {
      const line = 'E[ ]'
      const result = parseNode(line)

      expect(result).toEqual({
        id: 'E',
        type: 'rectangle',
        label: '',
      })
    })
  })
})
