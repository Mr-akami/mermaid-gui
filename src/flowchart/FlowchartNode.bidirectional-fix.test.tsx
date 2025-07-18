import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FlowchartNode } from './FlowchartNode'
import { ReactFlowProvider } from '@xyflow/react'

describe('FlowchartNode - True Bidirectional Handles', () => {
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
    it('should have separate source and target handles at each position', () => {
      const props = createNodeProps('rectangle')
      const { container } = render(
        <ReactFlowProvider>
          <FlowchartNode {...props} />
        </ReactFlowProvider>
      )

      // Should have 8 handles total (4 positions × 2 types)
      const handles = container.querySelectorAll('.react-flow__handle')
      expect(handles).toHaveLength(8)

      // Check each position has both source and target
      const positions = ['top', 'right', 'bottom', 'left']
      positions.forEach(pos => {
        const sourceHandle = container.querySelector(`.react-flow__handle-${pos}.react-flow__handle[data-handleid*="source"]`)
        const targetHandle = container.querySelector(`.react-flow__handle-${pos}.react-flow__handle[data-handleid*="target"]`)
        
        expect(sourceHandle).toBeTruthy()
        expect(targetHandle).toBeTruthy()
        
        // Check they have correct type attribute
        expect(sourceHandle?.getAttribute('data-handleid')).toContain('source')
        expect(targetHandle?.getAttribute('data-handleid')).toContain('target')
      })
    })

    it('should position overlapping handles correctly', () => {
      const props = createNodeProps('rectangle')
      const { container } = render(
        <ReactFlowProvider>
          <FlowchartNode {...props} />
        </ReactFlowProvider>
      )

      // Check that source and target handles at same position overlap
      const topSourceHandle = container.querySelector('.react-flow__handle-top[data-handleid*="source"]')
      const topTargetHandle = container.querySelector('.react-flow__handle-top[data-handleid*="target"]')
      
      const sourceStyle = window.getComputedStyle(topSourceHandle!)
      const targetStyle = window.getComputedStyle(topTargetHandle!)
      
      // They should have the same position
      expect(sourceStyle.left).toBe(targetStyle.left)
      expect(sourceStyle.top).toBe(targetStyle.top)
    })
  })

  describe('Connection Behavior', () => {
    it('should have handles that can connect in both directions', () => {
      const props = createNodeProps('rectangle')
      const { container } = render(
        <ReactFlowProvider>
          <FlowchartNode {...props} />
        </ReactFlowProvider>
      )

      const handles = container.querySelectorAll('.react-flow__handle')
      
      // Each handle should be connectable
      handles.forEach(handle => {
        expect(handle.classList.contains('connectable')).toBe(true)
        
        // Check that handles are properly typed
        const handleId = handle.getAttribute('data-handleid')
        if (handleId?.includes('source')) {
          expect(handle.classList.contains('source')).toBe(true)
        } else if (handleId?.includes('target')) {
          expect(handle.classList.contains('target')).toBe(true)
        }
      })
    })
  })
})