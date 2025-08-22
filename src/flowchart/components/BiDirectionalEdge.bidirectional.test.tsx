import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { BiDirectionalEdge } from './BiDirectionalEdge'
import { ReactFlowProvider, useStore } from '@xyflow/react'
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
        markerEnd={markerEnd}
        data-curvature={style?.curvature}
      />
    ),
    EdgeLabelRenderer: ({ children }: any) => <>{children}</>,
    getBezierPath: ({ curvature }: any) => {
      const pathData = curvature 
        ? 'M0,0 C25,0 25,100 50,100' // Curved path
        : 'M0,0 C50,0 50,100 100,100' // Straight path
      return [pathData, 50, 50]
    },
    useStore: vi.fn(),
  }
})

describe('BiDirectionalEdge - Bidirectional Detection', () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render straight path when no reverse edge exists', () => {
    const mockUseStore = vi.mocked(useStore)
    mockUseStore.mockReturnValue([
      { id: 'e1-2', source: '1', target: '2' }
    ])

    const { container } = render(
      <BiDirectionalEdge {...defaultProps} />,
      { wrapper }
    )

    const path = container.querySelector('path')
    expect(path?.getAttribute('d')).toBe('M0,0 C50,0 50,100 100,100')
  })

  it('should render curved path when reverse edge exists', () => {
    const mockUseStore = vi.mocked(useStore)
    mockUseStore.mockReturnValue([
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-1', source: '2', target: '1' } // Reverse edge
    ])

    const { container } = render(
      <BiDirectionalEdge {...defaultProps} />,
      { wrapper }
    )

    const path = container.querySelector('path')
    expect(path?.getAttribute('d')).toBe('M0,0 C25,0 25,100 50,100')
  })

  it('should not consider same edge as bidirectional', () => {
    const mockUseStore = vi.mocked(useStore)
    mockUseStore.mockReturnValue([
      { id: 'e1-2', source: '1', target: '2' } // Only the same edge
    ])

    const { container } = render(
      <BiDirectionalEdge {...defaultProps} />,
      { wrapper }
    )

    const path = container.querySelector('path')
    expect(path?.getAttribute('d')).toBe('M0,0 C50,0 50,100 100,100')
  })

  it('should handle multiple edges correctly', () => {
    const mockUseStore = vi.mocked(useStore)
    mockUseStore.mockReturnValue([
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e2-1', source: '2', target: '1' }, // This is the reverse edge
      { id: 'e3-2', source: '3', target: '2' }
    ])

    const { container } = render(
      <BiDirectionalEdge {...defaultProps} />,
      { wrapper }
    )

    const path = container.querySelector('path')
    expect(path?.getAttribute('d')).toBe('M0,0 C25,0 25,100 50,100')
  })
})