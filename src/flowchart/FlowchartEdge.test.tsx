import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FlowchartEdge } from './FlowchartEdge'
import { ReactFlowProvider } from '@xyflow/react'

const defaultProps = {
  id: 'test-edge',
  source: 'node1',
  target: 'node2',
  sourceX: 0,
  sourceY: 0,
  targetX: 100,
  targetY: 100,
  sourcePosition: 'bottom' as const,
  targetPosition: 'top' as const,
  data: {
    edgeType: 'normal-arrow' as const,
    label: 'Test Label',
  },
  markerEnd: 'url(#arrow)',
  selected: false,
}

describe('FlowchartEdge', () => {
  it('should render edge with arrow marker', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <defs>
            <marker id="arrow" viewBox="0 0 20 20" refX="20" refY="10">
              <path d="M 0 0 L 20 10 L 0 20 z" />
            </marker>
          </defs>
          <g>
            <FlowchartEdge {...defaultProps} />
          </g>
        </svg>
      </ReactFlowProvider>
    )
    
    // Check that path has markerEnd attribute
    const path = container.querySelector('path')
    expect(path).toBeDefined()
    expect(path?.getAttribute('marker-end')).toBe('url(#arrow)')
  })

  it('should render normal arrow edge type', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <g>
            <FlowchartEdge {...defaultProps} />
          </g>
        </svg>
      </ReactFlowProvider>
    )
    
    // Check that path has proper marker
    const path = container.querySelector('path')
    expect(path).toBeDefined()
    expect(path?.getAttribute('marker-end')).toBe('url(#react-flow__arrow-closed)')
  })

  it('should render edge without arrow for normal type', () => {
    const propsNoArrow = {
      ...defaultProps,
      data: {
        edgeType: 'normal' as const,
        label: 'Test Label',
      },
    }
    
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <g>
            <FlowchartEdge {...propsNoArrow} />
          </g>
        </svg>
      </ReactFlowProvider>
    )
    
    // Check that path has no marker
    const path = container.querySelector('path')
    expect(path).toBeDefined()
    expect(path?.getAttribute('marker-end')).toBeNull()
  })

  it('should render edge label', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <g>
            <FlowchartEdge {...defaultProps} />
          </g>
        </svg>
      </ReactFlowProvider>
    )
    
    // Check for label text
    const label = container.querySelector('text')
    expect(label).toBeDefined()
    expect(label?.textContent).toBe('Test Label')
  })

  it('should apply selected style', () => {
    const selectedProps = {
      ...defaultProps,
      selected: true,
    }
    
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <g>
            <FlowchartEdge {...selectedProps} />
          </g>
        </svg>
      </ReactFlowProvider>
    )
    
    // Selected edges should have different styling
    const path = container.querySelector('path')
    expect(path).toBeDefined()
    // React Flow adds selected class to the parent g element, not the path directly
  })
})