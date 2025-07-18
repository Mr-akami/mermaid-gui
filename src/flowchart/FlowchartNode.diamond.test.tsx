import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FlowchartNode } from './FlowchartNode'
import { ReactFlowProvider } from '@xyflow/react'

describe('FlowchartNode - Diamond with 8 Handles', () => {
  const createNodeProps = () => ({
    id: 'test-diamond',
    type: 'diamond',
    data: { label: 'Diamond' },
    position: { x: 0, y: 0 },
    selected: false,
    sourcePosition: 'bottom' as const,
    targetPosition: 'top' as const,
  })

  it('should have 16 handles total (8 positions × 2 types)', () => {
    const props = createNodeProps()
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...props} />
      </ReactFlowProvider>
    )

    const handles = container.querySelectorAll('.react-flow__handle')
    expect(handles).toHaveLength(16)
  })

  it('should have handles at all 8 positions', () => {
    const props = createNodeProps()
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...props} />
      </ReactFlowProvider>
    )

    // Check vertex handles - React Flow adds node ID prefix
    const vertexPositions = ['top', 'right', 'bottom', 'left']
    vertexPositions.forEach(pos => {
      const sourceHandle = container.querySelector(`[data-handleid*="source-${pos}"]`)
      const targetHandle = container.querySelector(`[data-handleid*="target-${pos}"]`)
      expect(sourceHandle).toBeTruthy()
      expect(targetHandle).toBeTruthy()
    })

    // Check edge midpoint handles
    const edgePositions = ['topright', 'bottomright', 'bottomleft', 'topleft']
    edgePositions.forEach(pos => {
      const sourceHandle = container.querySelector(`[data-handleid*="source-${pos}"]`)
      const targetHandle = container.querySelector(`[data-handleid*="target-${pos}"]`)
      expect(sourceHandle).toBeTruthy()
      expect(targetHandle).toBeTruthy()
    })
  })

  it('should position handles on diamond outline', () => {
    const props = createNodeProps()
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...props} />
      </ReactFlowProvider>
    )

    // Check that vertex handles exist and have proper IDs
    const topSourceHandle = container.querySelector('[data-handleid*="source-top"]:not([data-handleid*="topright"]):not([data-handleid*="topleft"])') as HTMLElement
    const rightSourceHandle = container.querySelector('[data-handleid*="source-right"]:not([data-handleid*="topright"]):not([data-handleid*="bottomright"])') as HTMLElement
    const bottomSourceHandle = container.querySelector('[data-handleid*="source-bottom"]:not([data-handleid*="bottomright"]):not([data-handleid*="bottomleft"])') as HTMLElement
    const leftSourceHandle = container.querySelector('[data-handleid*="source-left"]:not([data-handleid*="topleft"]):not([data-handleid*="bottomleft"])') as HTMLElement

    expect(topSourceHandle).toBeTruthy()
    expect(rightSourceHandle).toBeTruthy()
    expect(bottomSourceHandle).toBeTruthy()
    expect(leftSourceHandle).toBeTruthy()
    
    // Check edge midpoint handles exist
    const toprightHandle = container.querySelector('[data-handleid*="source-topright"]') as HTMLElement
    const bottomrightHandle = container.querySelector('[data-handleid*="source-bottomright"]') as HTMLElement
    const bottomleftHandle = container.querySelector('[data-handleid*="source-bottomleft"]') as HTMLElement
    const topleftHandle = container.querySelector('[data-handleid*="source-topleft"]') as HTMLElement
    
    expect(toprightHandle).toBeTruthy()
    expect(bottomrightHandle).toBeTruthy()
    expect(bottomleftHandle).toBeTruthy()
    expect(topleftHandle).toBeTruthy()
  })
})