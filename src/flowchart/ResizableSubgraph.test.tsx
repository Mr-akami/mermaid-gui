import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResizableSubgraph } from './ResizableSubgraph'
import type { NodeProps } from 'reactflow'

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
    render(<ResizableSubgraph {...defaultProps} />)
    expect(screen.getByText('Test Subgraph')).toBeInTheDocument()
  })

  it('should render with default label when no label provided', () => {
    const props = { ...defaultProps, data: {} }
    render(<ResizableSubgraph {...props} />)
    expect(screen.getByText('Subgraph')).toBeInTheDocument()
  })

  it('should show resize handles when selected', () => {
    const { container } = render(
      <ResizableSubgraph {...defaultProps} selected={true} />,
    )
    const resizer = container.querySelector('.react-flow__resize-control')
    expect(resizer).toBeInTheDocument()
  })

  it('should not show resize handles when not selected', () => {
    const { container } = render(
      <ResizableSubgraph {...defaultProps} selected={false} />,
    )
    const resizer = container.querySelector('.react-flow__resize-control')
    expect(resizer).not.toBeVisible()
  })

  it('should have input and output handles', () => {
    const { container } = render(<ResizableSubgraph {...defaultProps} />)
    const handles = container.querySelectorAll('.react-flow__handle')
    expect(handles).toHaveLength(2)

    const targetHandle = container.querySelector('.react-flow__handle-top')
    const sourceHandle = container.querySelector('.react-flow__handle-bottom')

    expect(targetHandle).toBeInTheDocument()
    expect(sourceHandle).toBeInTheDocument()
  })
})

