import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResizableSubgraph } from './ResizableSubgraph'
import type { NodeProps } from '@xyflow/react'
import { ReactFlowProvider } from '@xyflow/react'

// Wrapper component for React Flow context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('ResizableSubgraph', () => {
  const defaultProps: NodeProps = {
    id: 'subgraph1',
    type: 'subgraph',
    data: { label: 'Test Subgraph' },
    xPos: 0,
    yPos: 0,
    selected: false,
    zIndex: 0,
    isConnectable: true,
    targetPosition: undefined,
    sourcePosition: undefined,
    dragging: false,
  }

  it('should render with label', () => {
    render(<ResizableSubgraph {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.getByText('Test Subgraph')).toBeDefined()
  })

  it('should render with default label when no label provided', () => {
    const props = { ...defaultProps, data: {} }
    render(<ResizableSubgraph {...props} />, { wrapper: Wrapper })
    expect(screen.getByText('Subgraph')).toBeDefined()
  })

  it('should show resize handles when selected', () => {
    const { container } = render(
      <ResizableSubgraph {...defaultProps} selected={true} />,
      { wrapper: Wrapper },
    )
    const resizer = container.querySelector('.react-flow__resize-control')
    expect(resizer).toBeTruthy()
  })

  it('should not show resize handles when not selected', () => {
    const { container } = render(
      <ResizableSubgraph {...defaultProps} selected={false} />,
      { wrapper: Wrapper },
    )
    // When not selected, resize controls are not rendered in the DOM
    const resizer = container.querySelector('.react-flow__resize-control')
    expect(resizer).toBeFalsy()
  })

  it('should have input and output handles', () => {
    const { container } = render(<ResizableSubgraph {...defaultProps} />, {
      wrapper: Wrapper,
    })
    const handles = container.querySelectorAll('.react-flow__handle')
    expect(handles.length).toBe(8) // 4 positions × 2 types

    // Check all four sides have handles
    const topHandle = container.querySelector('.react-flow__handle-top')
    const rightHandle = container.querySelector('.react-flow__handle-right')
    const bottomHandle = container.querySelector('.react-flow__handle-bottom')
    const leftHandle = container.querySelector('.react-flow__handle-left')
    
    expect(topHandle).toBeTruthy()
    expect(rightHandle).toBeTruthy()
    expect(bottomHandle).toBeTruthy()
    expect(leftHandle).toBeTruthy()
    
    // Each handle should be either source or target
    handles.forEach(handle => {
      const isSource = handle.classList.contains('source')
      const isTarget = handle.classList.contains('target')
      expect(isSource || isTarget).toBe(true)
    })
  })
})

