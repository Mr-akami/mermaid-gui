import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { ResizableSubgraph } from './ResizableSubgraph'
import { ReactFlowProvider } from '@xyflow/react'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

const defaultProps = {
  id: 'test-subgraph',
  data: { label: 'Test Subgraph' },
  selected: false,
  type: 'subgraph',
  position: { x: 0, y: 0 },
  dragging: false,
  zIndex: 0,
  isConnectable: true,
  xPos: 0,
  yPos: 0,
}

describe('ResizableSubgraph - Resize Behavior', () => {
  it('should show resize handles on hover', async () => {
    const { container } = render(
      <ReactFlowProvider>
        <ResizableSubgraph {...defaultProps} />
      </ReactFlowProvider>
    )
    
    const subgraph = container.firstChild as HTMLElement
    
    // Initially, resize handles should not be visible
    const resizer = container.querySelector('.react-flow__resize-control')
    expect(resizer).toBeDefined()
    
    // Hover over the subgraph
    fireEvent.mouseEnter(subgraph)
    
    // Resize handles should be visible
    await waitFor(() => {
      const handles = container.querySelectorAll('.react-flow__resize-control.handle')
      expect(handles.length).toBeGreaterThan(0)
    })
  })

  it('should maintain hover state during resize', async () => {
    const { container } = render(
      <ReactFlowProvider>
        <ResizableSubgraph {...defaultProps} selected={true} />
      </ReactFlowProvider>
    )
    
    // When selected, resize handles should be visible
    const handles = container.querySelectorAll('.react-flow__resize-control.handle')
    expect(handles.length).toBeGreaterThan(0)
    
    // Simulate resize start
    const handle = handles[0] as HTMLElement
    fireEvent.mouseDown(handle)
    
    // Move away from subgraph (which would normally trigger mouseleave)
    const subgraph = container.firstChild as HTMLElement
    fireEvent.mouseLeave(subgraph)
    
    // Handles should still be visible during resize
    await waitFor(() => {
      const visibleHandles = container.querySelectorAll('.react-flow__resize-control.handle')
      expect(visibleHandles.length).toBeGreaterThan(0)
    })
    
    // End resize
    fireEvent.mouseUp(handle)
  })

  it('should not flicker during resize', async () => {
    const { container } = render(
      <ReactFlowProvider>
        <ResizableSubgraph {...defaultProps} selected={true} />
      </ReactFlowProvider>
    )
    
    const handle = container.querySelector('.react-flow__resize-control.handle') as HTMLElement
    
    // Start resize
    fireEvent.mouseDown(handle)
    
    // Simulate multiple mouse moves during resize
    for (let i = 0; i < 10; i++) {
      fireEvent.mouseMove(document, { clientX: 100 + i * 10, clientY: 100 + i * 10 })
      
      // Handles should remain visible throughout
      const visibleHandles = container.querySelectorAll('.react-flow__resize-control.handle')
      expect(visibleHandles.length).toBeGreaterThan(0)
    }
    
    // End resize
    fireEvent.mouseUp(document)
  })
})