import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BiDirectionalEdge } from './BiDirectionalEdge'
import { ReactFlowProvider } from '@xyflow/react'
import React from 'react'

// Mock ReactFlow components
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react')
  return {
    ...actual,
    BaseEdge: ({ path, style, markerEnd }: any) => (
      <path
        d={path}
        style={style}
        markerEnd={markerEnd ? 'url(#arrow)' : undefined}
        strokeWidth={style?.strokeWidth}
        strokeDasharray={style?.strokeDasharray}
      />
    ),
    EdgeLabelRenderer: ({ children }: any) => <>{children}</>,
    getBezierPath: () => ['M0,0 C50,0 50,100 100,100', 50, 50],
    useStore: () => [],
  }
})

describe('BiDirectionalEdge', () => {
  const defaultProps = {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: 'right' as const,
    targetPosition: 'left' as const,
  }

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ReactFlowProvider>{children}</ReactFlowProvider>
  )

  it('should render edge with default arrow type', () => {
    const { container } = render(
      <BiDirectionalEdge {...defaultProps} />,
      { wrapper }
    )

    const path = container.querySelector('path')
    expect(path).toBeTruthy()
  })

  it('should render edge label when provided', () => {
    const { getByText } = render(
      <BiDirectionalEdge
        {...defaultProps}
        data={{ label: 'Test Label', edgeType: 'normal-arrow' }}
      />,
      { wrapper }
    )

    expect(getByText('Test Label')).toBeTruthy()
  })

  it('should apply dotted style for dotted edge type', () => {
    const { container } = render(
      <BiDirectionalEdge
        {...defaultProps}
        data={{ edgeType: 'dotted' }}
      />,
      { wrapper }
    )

    const path = container.querySelector('path')
    expect(path?.getAttribute('stroke-dasharray')).toBe('5,5')
  })

  it('should apply thick style for thick edge type', () => {
    const { container } = render(
      <BiDirectionalEdge
        {...defaultProps}
        data={{ edgeType: 'thick' }}
      />,
      { wrapper }
    )

    const path = container.querySelector('path')
    expect(path?.getAttribute('stroke-width')).toBe('4')
  })

  it('should have marker end for arrow types', () => {
    const { container } = render(
      <BiDirectionalEdge
        {...defaultProps}
        data={{ edgeType: 'normal-arrow' }}
      />,
      { wrapper }
    )

    const path = container.querySelector('path')
    // Check that the path exists
    expect(path).toBeTruthy()
    // For arrow types, the BiDirectionalEdge component sets markerEnd
    // In the actual component, this is set as a prop, not an attribute
    expect(path?.getAttribute('marker-end')).toBe('url(#arrow)')
  })

  it('should not have marker end for non-arrow types', () => {
    const { container } = render(
      <BiDirectionalEdge
        {...defaultProps}
        data={{ edgeType: 'normal' }}
      />,
      { wrapper }
    )

    const path = container.querySelector('path')
    expect(path?.getAttribute('markerEnd')).toBeNull()
  })
})