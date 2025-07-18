import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FlowchartNode } from './FlowchartNode'
import { ReactFlowProvider } from '@xyflow/react'

describe('FlowchartNode - Bidirectional Connection Points', () => {
  const createNodeProps = (type: string) => ({
    id: 'test-node',
    type,
    data: { label: 'Test Node' },
    position: { x: 0, y: 0 },
    selected: false,
    sourcePosition: 'bottom' as const,
    targetPosition: 'top' as const,
  })

  describe('Rectangle Node', () => {
    it('should have handles that can act as both source and target', () => {
      const props = createNodeProps('rectangle')
      const { container } = render(
        <ReactFlowProvider>
          <FlowchartNode {...props} />
        </ReactFlowProvider>
      )

      // Should have 8 handles (4 positions × 2 types)
      const handles = container.querySelectorAll('.react-flow__handle')
      expect(handles).toHaveLength(8)

      // Each handle should be either source or target
      handles.forEach(handle => {
        const isSource = handle.classList.contains('source')
        const isTarget = handle.classList.contains('target')
        expect(isSource || isTarget).toBe(true)
      })
    })

    it('should have handles on all four sides', () => {
      const props = createNodeProps('rectangle')
      const { container } = render(
        <ReactFlowProvider>
          <FlowchartNode {...props} />
        </ReactFlowProvider>
      )

      const topHandle = container.querySelector('.react-flow__handle-top')
      const rightHandle = container.querySelector('.react-flow__handle-right')
      const bottomHandle = container.querySelector('.react-flow__handle-bottom')
      const leftHandle = container.querySelector('.react-flow__handle-left')

      expect(topHandle).toBeDefined()
      expect(rightHandle).toBeDefined()
      expect(bottomHandle).toBeDefined()
      expect(leftHandle).toBeDefined()
    })
  })

  describe('Circle Node', () => {
    it('should have handles that can act as both source and target', () => {
      const props = createNodeProps('circle')
      const { container } = render(
        <ReactFlowProvider>
          <FlowchartNode {...props} />
        </ReactFlowProvider>
      )

      // Should have 8 handles (4 positions × 2 types)
      const handles = container.querySelectorAll('.react-flow__handle')
      expect(handles).toHaveLength(8)

      // Each handle should be either source or target
      handles.forEach(handle => {
        const isSource = handle.classList.contains('source')
        const isTarget = handle.classList.contains('target')
        expect(isSource || isTarget).toBe(true)
      })
    })
  })

  describe('Diamond Node', () => {
    it('should have handles that can act as both source and target', () => {
      const props = createNodeProps('diamond')
      const { container } = render(
        <ReactFlowProvider>
          <FlowchartNode {...props} />
        </ReactFlowProvider>
      )

      // Diamond has 16 handles (8 positions × 2 types)
      const handles = container.querySelectorAll('.react-flow__handle')
      expect(handles).toHaveLength(16)

      // Each handle should be either source or target
      handles.forEach(handle => {
        const isSource = handle.classList.contains('source')
        const isTarget = handle.classList.contains('target')
        expect(isSource || isTarget).toBe(true)
      })
    })
  })

  describe('Connection Behavior', () => {
    it('should allow connections from any handle to any handle', () => {
      const props = createNodeProps('rectangle')
      const { container } = render(
        <ReactFlowProvider>
          <FlowchartNode {...props} />
        </ReactFlowProvider>
      )

      const handles = container.querySelectorAll('.react-flow__handle')
      
      // All handles should be connectable
      handles.forEach(handle => {
        expect(handle.classList.contains('connectable')).toBe(true)
        expect(handle.classList.contains('connectablestart')).toBe(true)
        expect(handle.classList.contains('connectableend')).toBe(true)
      })
    })
  })
})