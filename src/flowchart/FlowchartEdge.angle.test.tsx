import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FlowchartEdge } from './FlowchartEdge'
import { ReactFlowProvider } from '@xyflow/react'

describe('FlowchartEdge - Dynamic Arrow Angle', () => {
  const createEdgeProps = (sourceX: number, sourceY: number, targetX: number, targetY: number) => ({
    id: 'test-edge',
    source: 'node1',
    target: 'node2',
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: 'bottom' as const,
    targetPosition: 'top' as const,
    data: {
      edgeType: 'normal-arrow' as const,
      label: 'Test',
    },
    selected: false,
  })

  it('should calculate arrow pointing downward when target is below source', () => {
    const props = createEdgeProps(100, 100, 100, 200)
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <g>
            <FlowchartEdge {...props} />
          </g>
        </svg>
      </ReactFlowProvider>
    )
    
    // Check that the edge path exists
    const path = container.querySelector('path')
    expect(path).toBeDefined()
    
    // Arrow should point downward
    const markerEnd = path?.getAttribute('marker-end')
    expect(markerEnd).toBe('url(#react-flow__arrow-down)')
  })

  it('should calculate arrow pointing upward when target is above source', () => {
    const props = createEdgeProps(100, 200, 100, 100)
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <g>
            <FlowchartEdge {...props} />
          </g>
        </svg>
      </ReactFlowProvider>
    )
    
    const path = container.querySelector('path')
    expect(path).toBeDefined()
    const markerEnd = path?.getAttribute('marker-end')
    expect(markerEnd).toBe('url(#react-flow__arrow-up)')
  })

  it('should calculate arrow pointing right when target is to the right', () => {
    const props = createEdgeProps(100, 100, 200, 100)
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <g>
            <FlowchartEdge {...props} />
          </g>
        </svg>
      </ReactFlowProvider>
    )
    
    const path = container.querySelector('path')
    expect(path).toBeDefined()
    const markerEnd = path?.getAttribute('marker-end')
    expect(markerEnd).toBe('url(#react-flow__arrow-right)')
  })

  it('should calculate arrow pointing left when target is to the left', () => {
    const props = createEdgeProps(200, 100, 100, 100)
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <g>
            <FlowchartEdge {...props} />
          </g>
        </svg>
      </ReactFlowProvider>
    )
    
    const path = container.querySelector('path')
    expect(path).toBeDefined()
    const markerEnd = path?.getAttribute('marker-end')
    expect(markerEnd).toBe('url(#react-flow__arrow-left)')
  })

  it('should calculate diagonal arrow angle correctly', () => {
    const props = createEdgeProps(100, 100, 200, 200)
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <g>
            <FlowchartEdge {...props} />
          </g>
        </svg>
      </ReactFlowProvider>
    )
    
    const path = container.querySelector('path')
    expect(path).toBeDefined()
    const markerEnd = path?.getAttribute('marker-end')
    // 45 degree angle should be arrow-down
    expect(markerEnd).toBe('url(#react-flow__arrow-down)')
  })
})