import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GroupNode } from './GroupNode'
import type { NodeProps } from '@xyflow/react'
import { ReactFlowProvider } from '@xyflow/react'

// Mock NodeResizer since it's not available in test environment
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react')
  return {
    ...actual,
    NodeResizer: ({ children, isVisible, ...props }: any) => 
      isVisible ? (
        <div className="react-flow__resize-control" {...props}>{children}</div>
      ) : null,
  }
})

// Wrapper component for React Flow context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('GroupNode', () => {
  const defaultProps = {
    id: 'group1',
    type: 'group',
    data: { label: 'Test Group' },
    selected: false,
    isConnectable: true,
    targetPosition: undefined,
    sourcePosition: undefined,
    dragging: false,
    zIndex: 0,
    xPos: 0,
    yPos: 0,
    draggable: true,
    selectable: true,
    deletable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
  } as NodeProps

  it('should render with label', () => {
    render(<GroupNode {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.getByText('Test Group')).toBeDefined()
  })

  it('should render with default label when no label provided', () => {
    const props = { ...defaultProps, data: {} }
    render(<GroupNode {...props} />, { wrapper: Wrapper })
    expect(screen.getByText('Group')).toBeDefined()
  })

  it('should show resize handles when selected', () => {
    const { container } = render(
      <GroupNode {...defaultProps} selected={true} />,
      { wrapper: Wrapper },
    )
    const resizer = container.querySelector('.react-flow__resize-control')
    expect(resizer).toBeTruthy()
  })

  it('should not show resize handles when not selected', () => {
    const { container } = render(
      <GroupNode {...defaultProps} selected={false} />,
      { wrapper: Wrapper },
    )
    // When not selected, resize controls are not rendered in the DOM
    const resizer = container.querySelector('.react-flow__resize-control')
    expect(resizer).toBeFalsy()
  })

  it('should have proper styling for group nodes', () => {
    const { container } = render(<GroupNode {...defaultProps} />, {
      wrapper: Wrapper,
    })
    // Check for dashed border styling
    const groupElement = container.querySelector('.border-dashed')
    expect(groupElement).toBeTruthy()
    
    // Check for purple coloring
    const purpleElement = container.querySelector('.border-purple-500')
    expect(purpleElement).toBeTruthy()
  })

  it('should have lower z-index styling', () => {
    const { container } = render(<GroupNode {...defaultProps} />, {
      wrapper: Wrapper,
    })
    const groupContainer = container.firstChild as HTMLElement
    // Groups should appear behind regular nodes
    expect(groupContainer.style.zIndex).toBe('-1')
  })
})