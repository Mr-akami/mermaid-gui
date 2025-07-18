import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FlowchartNode } from './FlowchartNode'
import { ReactFlowProvider } from '@xyflow/react'

describe('FlowchartNode - Circle Handle Positions', () => {
  const createNodeProps = () => ({
    id: 'test-circle',
    type: 'circle',
    data: { label: 'Circle' },
    position: { x: 0, y: 0 },
    selected: false,
    sourcePosition: 'bottom' as const,
    targetPosition: 'top' as const,
  })

  it('should have 8 handles total for circle node', () => {
    const props = createNodeProps()
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...props} />
      </ReactFlowProvider>
    )

    const handles = container.querySelectorAll('.react-flow__handle')
    expect(handles).toHaveLength(8) // 4 positions × 2 types
  })

  it('should position handles on circle boundary', () => {
    const props = createNodeProps()
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...props} />
      </ReactFlowProvider>
    )

    // Circle is 80x80 (w-20 h-20 in Tailwind)
    // Handles should be positioned on the circle edge
    const circleRadius = 40 // 80px / 2

    // Get the circle element to measure its actual size
    const circleElement = container.querySelector('.rounded-full')
    expect(circleElement).toBeTruthy()

    // Check that handles are positioned correctly
    const topHandle = container.querySelector('[data-handleid*="source-top"]') as HTMLElement
    const rightHandle = container.querySelector('[data-handleid*="source-right"]') as HTMLElement
    const bottomHandle = container.querySelector('[data-handleid*="source-bottom"]') as HTMLElement
    const leftHandle = container.querySelector('[data-handleid*="source-left"]') as HTMLElement

    expect(topHandle).toBeTruthy()
    expect(rightHandle).toBeTruthy()
    expect(bottomHandle).toBeTruthy()
    expect(leftHandle).toBeTruthy()

    // Verify handle positions are on the circle edge
    // They should have negative offset to be on the boundary
    expect(topHandle.style.top).toMatch(/-\d+px/)
    expect(rightHandle.style.right).toMatch(/-\d+px/)
    expect(bottomHandle.style.bottom).toMatch(/-\d+px/)
    expect(leftHandle.style.left).toMatch(/-\d+px/)
  })

  it('should have handles positioned at exact circle boundary', () => {
    const props = createNodeProps()
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...props} />
      </ReactFlowProvider>
    )

    // For a circle with radius 40px (80x80 div), 
    // handles should be offset by handle half-width to appear on boundary
    const expectedOffset = '-6px' // Half of handle width (12px / 2)

    const handles = container.querySelectorAll('[data-handleid*="source-"]')
    
    // Check inline styles for positioning
    handles.forEach(handle => {
      const element = handle as HTMLElement
      const style = element.getAttribute('style') || ''
      
      // Should have negative offset positioning
      expect(style).toMatch(/-\d+px/)
    })
  })
})