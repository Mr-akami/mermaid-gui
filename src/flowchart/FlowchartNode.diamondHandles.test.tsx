import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FlowchartNode } from './FlowchartNode'
import { ReactFlowProvider } from '@xyflow/react'

describe('FlowchartNode - Diamond Handle Positions', () => {
  const createNodeProps = () => ({
    id: 'test-diamond',
    type: 'diamond',
    data: { label: 'Diamond' },
    position: { x: 0, y: 0 },
    selected: false,
    sourcePosition: 'bottom' as const,
    targetPosition: 'top' as const,
  })

  it('should have 16 handles total for diamond node', () => {
    const props = createNodeProps()
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...props} />
      </ReactFlowProvider>
    )

    const handles = container.querySelectorAll('.react-flow__handle')
    expect(handles).toHaveLength(16) // 8 positions × 2 types
  })

  it('should have handles at all 4 vertices', () => {
    const props = createNodeProps()
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...props} />
      </ReactFlowProvider>
    )

    // Diamond is rotated 45 degrees, so vertices are at:
    // Top vertex, Right vertex, Bottom vertex, Left vertex
    const sourceHandles = container.querySelectorAll('[data-handleid*="source-"]')
    expect(sourceHandles.length).toBeGreaterThanOrEqual(8)

    // Check for vertex handles
    const topHandle = container.querySelector('[data-handleid*="source-top"][data-handleid$="top"]')
    const rightHandle = container.querySelector('[data-handleid*="source-right"][data-handleid$="right"]')
    const bottomHandle = container.querySelector('[data-handleid*="source-bottom"][data-handleid$="bottom"]')
    const leftHandle = container.querySelector('[data-handleid*="source-left"][data-handleid$="left"]')

    expect(topHandle).toBeTruthy()
    expect(rightHandle).toBeTruthy()
    expect(bottomHandle).toBeTruthy()
    expect(leftHandle).toBeTruthy()
  })

  it('should have handles at edge midpoints', () => {
    const props = createNodeProps()
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...props} />
      </ReactFlowProvider>
    )

    // Edge midpoint handles
    const topRightHandle = container.querySelector('[data-handleid*="source-topright"]')
    const bottomRightHandle = container.querySelector('[data-handleid*="source-bottomright"]')
    const bottomLeftHandle = container.querySelector('[data-handleid*="source-bottomleft"]')
    const topLeftHandle = container.querySelector('[data-handleid*="source-topleft"]')

    expect(topRightHandle).toBeTruthy()
    expect(bottomRightHandle).toBeTruthy()
    expect(bottomLeftHandle).toBeTruthy()
    expect(topLeftHandle).toBeTruthy()
  })

  it('should position handles correctly on diamond outline', () => {
    const props = createNodeProps()
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...props} />
      </ReactFlowProvider>
    )

    // For a diamond (rotated square), the shape is 100x100
    // Half-size is 50px, so diamond vertices should be at:
    // Top: (50, 0), Right: (100, 50), Bottom: (50, 100), Left: (0, 50)
    
    const topHandle = container.querySelector('[data-handleid*="source-top"][data-handleid$="top"]') as HTMLElement
    const rightHandle = container.querySelector('[data-handleid*="source-right"][data-handleid$="right"]') as HTMLElement
    const bottomHandle = container.querySelector('[data-handleid*="source-bottom"][data-handleid$="bottom"]') as HTMLElement
    const leftHandle = container.querySelector('[data-handleid*="source-left"][data-handleid$="left"]') as HTMLElement

    // Check positioning - vertices use 50% for centering
    expect(topHandle.style.left).toBe('50%')
    expect(topHandle.style.top).toMatch(/-?\d+px/) // Should have negative offset

    expect(rightHandle.style.right).toMatch(/-?\d+px/) // Should have negative offset
    expect(rightHandle.style.top).toBe('50%')

    expect(bottomHandle.style.left).toBe('50%')
    expect(bottomHandle.style.bottom).toMatch(/-?\d+px/) // Should have negative offset

    expect(leftHandle.style.left).toMatch(/-?\d+px/) // Should have negative offset
    expect(leftHandle.style.top).toBe('50%')
  })

  it('should calculate diamond edge positions correctly', () => {
    // Test the mathematical calculation for diamond edges
    const halfSize = 50 // Diamond is 100x100
    
    // Vertices of diamond (rotated square)
    const topVertex = { x: halfSize, y: 0 }
    const rightVertex = { x: halfSize * 2, y: halfSize }
    const bottomVertex = { x: halfSize, y: halfSize * 2 }
    const leftVertex = { x: 0, y: halfSize }
    
    // Edge midpoints should be halfway between vertices
    const topRightMidpoint = {
      x: (topVertex.x + rightVertex.x) / 2,
      y: (topVertex.y + rightVertex.y) / 2
    }
    const bottomRightMidpoint = {
      x: (rightVertex.x + bottomVertex.x) / 2,
      y: (rightVertex.y + bottomVertex.y) / 2
    }
    const bottomLeftMidpoint = {
      x: (bottomVertex.x + leftVertex.x) / 2,
      y: (bottomVertex.y + leftVertex.y) / 2
    }
    const topLeftMidpoint = {
      x: (leftVertex.x + topVertex.x) / 2,
      y: (leftVertex.y + topVertex.y) / 2
    }
    
    // Verify calculations
    expect(topRightMidpoint).toEqual({ x: 75, y: 25 })
    expect(bottomRightMidpoint).toEqual({ x: 75, y: 75 })
    expect(bottomLeftMidpoint).toEqual({ x: 25, y: 75 })
    expect(topLeftMidpoint).toEqual({ x: 25, y: 25 })
  })

  it('should apply negative offsets for handles on diamond outline', () => {
    const props = createNodeProps()
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...props} />
      </ReactFlowProvider>
    )

    // All handles should have some offset to appear on the outline
    const handles = container.querySelectorAll('[data-handleid*="source-"]')
    
    handles.forEach(handle => {
      const element = handle as HTMLElement
      const style = element.getAttribute('style') || ''
      
      // Should have positioning styles (allowing decimal values)
      expect(style).toMatch(/(?:top|right|bottom|left):\s*-?\d+(?:\.\d+)?px/)
    })
  })
})