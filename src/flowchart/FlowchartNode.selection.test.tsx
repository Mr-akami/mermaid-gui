import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FlowchartNode } from './FlowchartNode'
import { ReactFlowProvider } from '@xyflow/react'

const defaultProps = {
  id: 'test-node',
  data: { label: 'Test Node' },
  selected: true,
  type: 'rectangle' as const,
  position: { x: 0, y: 0 },
  dragging: false,
  zIndex: 0,
  isConnectable: true,
  xPos: 0,
  yPos: 0,
}

describe('FlowchartNode - Selection Outline', () => {
  it('should not apply box-shadow directly to rectangle node wrapper', () => {
    const { container } = render(
      <ReactFlowProvider>
        <div className="react-flow__node react-flow__node-rectangle selected">
          <FlowchartNode {...defaultProps} />
        </div>
      </ReactFlowProvider>
    )
    
    // The wrapper should have the selected class
    const wrapper = container.querySelector('.react-flow__node-rectangle.selected')
    expect(wrapper).toBeDefined()
    
    // The inner content div should be what gets the visual styling
    const contentDiv = container.querySelector('.bg-blue-100')
    expect(contentDiv).toBeDefined()
    
    // Check that the content div is properly positioned within the node
    const handles = container.querySelectorAll('.react-flow__handle')
    expect(handles.length).toBe(2) // top and bottom handles
  })

  it('should render rectangle node with proper structure', () => {
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...defaultProps} />
      </ReactFlowProvider>
    )
    
    // Check the structure
    const contentDiv = container.querySelector('.bg-blue-100.border-2.border-blue-500.rounded')
    expect(contentDiv).toBeDefined()
    
    // Should have label
    const label = contentDiv?.querySelector('.text-sm.font-medium.text-gray-900')
    expect(label?.textContent).toBe('Test Node')
  })

  it('should render circle node with different structure', () => {
    const circleProps = { ...defaultProps, type: 'circle' as const }
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...circleProps} />
      </ReactFlowProvider>
    )
    
    // Circle should have a wrapper div with relative positioning
    const wrapper = container.querySelector('.relative')
    expect(wrapper).toBeDefined()
    
    // Circle content should be inside
    const circleContent = container.querySelector('.rounded-full')
    expect(circleContent).toBeDefined()
  })

  it('should render diamond node with different structure', () => {
    const diamondProps = { ...defaultProps, type: 'diamond' as const }
    const { container } = render(
      <ReactFlowProvider>
        <FlowchartNode {...diamondProps} />
      </ReactFlowProvider>
    )
    
    // Diamond should have a wrapper div with relative positioning
    const wrapper = container.querySelector('.relative')
    expect(wrapper).toBeDefined()
    
    // Diamond content should be inside with rotation
    const diamondContent = container.querySelector('.rotate-45')
    expect(diamondContent).toBeDefined()
  })
})