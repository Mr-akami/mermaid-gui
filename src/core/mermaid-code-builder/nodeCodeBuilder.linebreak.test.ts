import { describe, it, expect } from 'vitest'
import { buildNodeCode } from './nodeCodeBuilder'
import type { Node } from './deps'

describe('nodeCodeBuilder - Line Break Support', () => {
  it('should convert newlines to <br> in rectangle node', () => {
    const node: Node = {
      id: 'N1',
      type: 'rectangle',
      data: { label: 'Line 1\nLine 2\nLine 3' },
      position: { x: 0, y: 0 },
      childIds: []
    }
    
    const result = buildNodeCode(node)
    expect(result).toBe('N1[Line 1<br>Line 2<br>Line 3]')
  })

  it('should convert newlines to <br> in circle node', () => {
    const node: Node = {
      id: 'N2',
      type: 'circle',
      data: { label: 'First\nSecond' },
      position: { x: 0, y: 0 },
      childIds: []
    }
    
    const result = buildNodeCode(node)
    expect(result).toBe('N2((First<br>Second))')
  })

  it('should convert newlines to <br> in diamond node', () => {
    const node: Node = {
      id: 'N3',
      type: 'diamond',
      data: { label: 'Condition\nCheck' },
      position: { x: 0, y: 0 },
      childIds: []
    }
    
    const result = buildNodeCode(node)
    expect(result).toBe('N3{Condition<br>Check}')
  })

  it('should handle multiple consecutive newlines', () => {
    const node: Node = {
      id: 'N4',
      type: 'rectangle',
      data: { label: 'Line 1\n\n\nLine 2' },
      position: { x: 0, y: 0 },
      childIds: []
    }
    
    const result = buildNodeCode(node)
    expect(result).toBe('N4[Line 1<br><br><br>Line 2]')
  })

  it('should handle labels with both newlines and special characters', () => {
    const node: Node = {
      id: 'N5',
      type: 'rectangle',
      data: { label: 'Test [with]\nbrackets' },
      position: { x: 0, y: 0 },
      childIds: []
    }
    
    const result = buildNodeCode(node)
    expect(result).toBe('N5[Test \\[with\\]<br>brackets]')
  })

  it('should handle empty label with newline', () => {
    const node: Node = {
      id: 'N6',
      type: 'rectangle',
      data: { label: '\n' },
      position: { x: 0, y: 0 },
      childIds: []
    }
    
    const result = buildNodeCode(node)
    expect(result).toBe('N6[<br>]')
  })
})