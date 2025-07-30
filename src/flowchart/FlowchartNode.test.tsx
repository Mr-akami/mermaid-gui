import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FlowchartNode } from './FlowchartNode'
import { ReactFlowProvider } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'

// Wrapper component for React Flow context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('FlowchartNode', () => {
  const defaultProps: NodeProps = {
    id: 'node1',
    type: 'rectangle',
    data: { label: 'Test Node' },
    selected: false,
    isConnectable: true,
    targetPosition: undefined,
    sourcePosition: undefined,
    dragging: false,
  } as NodeProps

  describe('Rectangle Node', () => {
    it('should render rectangle node with label', () => {
      render(<FlowchartNode {...defaultProps} type="rectangle" />, { wrapper: Wrapper })
      expect(screen.getByText('Test Node')).toBeDefined()
    })

    it('should render rectangle node with default label when no label provided', () => {
      const props = { ...defaultProps, data: {}, type: 'rectangle' }
      render(<FlowchartNode {...props} />, { wrapper: Wrapper })
      expect(screen.getByText('Rectangle')).toBeDefined()
    })

    it('should have rectangle styling', () => {
      const { container } = render(<FlowchartNode {...defaultProps} type="rectangle" />, { wrapper: Wrapper })
      const node = container.querySelector('.bg-blue-100')
      expect(node).toBeTruthy()
      expect(node?.classList.contains('rounded')).toBeTruthy()
    })
  })

  describe('Circle Node', () => {
    it('should render circle node with label', () => {
      render(<FlowchartNode {...defaultProps} type="circle" />, { wrapper: Wrapper })
      expect(screen.getByText('Test Node')).toBeDefined()
    })

    it('should have circle styling', () => {
      const { container } = render(<FlowchartNode {...defaultProps} type="circle" />, { wrapper: Wrapper })
      const node = container.querySelector('.rounded-full')
      expect(node).toBeTruthy()
      expect(node?.classList.contains('bg-green-100')).toBeTruthy()
    })
  })

  describe('Diamond Node', () => {
    it('should render diamond node with label', () => {
      render(<FlowchartNode {...defaultProps} type="diamond" />, { wrapper: Wrapper })
      expect(screen.getByText('Test Node')).toBeDefined()
    })

    it('should have diamond styling with rotation', () => {
      const { container } = render(<FlowchartNode {...defaultProps} type="diamond" />, { wrapper: Wrapper })
      const node = container.querySelector('.rotate-45')
      expect(node).toBeTruthy()
      expect(node?.classList.contains('bg-yellow-100')).toBeTruthy()
    })
  })

  describe('Round Edges Node', () => {
    it('should render round edges node with label', () => {
      render(<FlowchartNode {...defaultProps} type="roundEdges" />, { wrapper: Wrapper })
      expect(screen.getByText('Test Node')).toBeDefined()
    })

    it('should have round edges styling', () => {
      const { container } = render(<FlowchartNode {...defaultProps} type="roundEdges" />, { wrapper: Wrapper })
      const node = container.querySelector('.rounded-lg')
      expect(node).toBeTruthy()
    })
  })

  describe('Stadium Node', () => {
    it('should render stadium node with label', () => {
      render(<FlowchartNode {...defaultProps} type="stadium" />, { wrapper: Wrapper })
      expect(screen.getByText('Test Node')).toBeDefined()
    })

    it('should have stadium styling', () => {
      const { container } = render(<FlowchartNode {...defaultProps} type="stadium" />, { wrapper: Wrapper })
      const node = container.querySelector('.rounded-full')
      expect(node).toBeTruthy()
    })
  })

  describe('Subroutine Node', () => {
    it('should render subroutine node with label', () => {
      render(<FlowchartNode {...defaultProps} type="subroutine" />, { wrapper: Wrapper })
      expect(screen.getByText('Test Node')).toBeDefined()
    })

    it('should have subroutine styling with double border', () => {
      const { container } = render(<FlowchartNode {...defaultProps} type="subroutine" />, { wrapper: Wrapper })
      const outerBorder = container.querySelector('.border-4')
      expect(outerBorder).toBeTruthy()
    })
  })

  describe('Cylindrical Node', () => {
    it('should render cylindrical node with label', () => {
      render(<FlowchartNode {...defaultProps} type="cylindrical" />, { wrapper: Wrapper })
      expect(screen.getByText('Test Node')).toBeDefined()
    })

    it('should have cylindrical styling', () => {
      const { container } = render(<FlowchartNode {...defaultProps} type="cylindrical" />, { wrapper: Wrapper })
      const node = container.querySelector('.rounded-t-full')
      expect(node).toBeTruthy()
    })
  })

  describe('Parallelogram Node', () => {
    it('should render parallelogram node with label', () => {
      render(<FlowchartNode {...defaultProps} type="parallelogram" />, { wrapper: Wrapper })
      expect(screen.getByText('Test Node')).toBeDefined()
    })

    it('should have parallelogram styling with skew', () => {
      const { container } = render(<FlowchartNode {...defaultProps} type="parallelogram" />, { wrapper: Wrapper })
      const node = container.querySelector('[style*="transform"]')
      expect(node).toBeTruthy()
    })
  })

  describe('Trapezoid Node', () => {
    it('should render trapezoid node with label', () => {
      render(<FlowchartNode {...defaultProps} type="trapezoid" />, { wrapper: Wrapper })
      expect(screen.getByText('Test Node')).toBeDefined()
    })

    it('should have trapezoid styling', () => {
      const { container } = render(<FlowchartNode {...defaultProps} type="trapezoid" />, { wrapper: Wrapper })
      const node = container.querySelector('.bg-teal-100')
      expect(node).toBeTruthy()
      // Check if clipPath is applied
      expect(node?.getAttribute('style')).toContain('clip-path')
    })
  })

  describe('Hexagon Node', () => {
    it('should render hexagon node with label', () => {
      render(<FlowchartNode {...defaultProps} type="hexagon" />, { wrapper: Wrapper })
      expect(screen.getByText('Test Node')).toBeDefined()
    })

    it('should have hexagon styling', () => {
      const { container } = render(<FlowchartNode {...defaultProps} type="hexagon" />, { wrapper: Wrapper })
      const node = container.querySelector('.bg-pink-100')
      expect(node).toBeTruthy()
      // Check if clipPath is applied
      expect(node?.getAttribute('style')).toContain('clip-path')
    })
  })

  describe('Double Circle Node', () => {
    it('should render double circle node with label', () => {
      render(<FlowchartNode {...defaultProps} type="doubleCircle" />, { wrapper: Wrapper })
      expect(screen.getByText('Test Node')).toBeDefined()
    })

    it('should have double circle styling', () => {
      const { container } = render(<FlowchartNode {...defaultProps} type="doubleCircle" />, { wrapper: Wrapper })
      const outerCircle = container.querySelector('.rounded-full.border-4')
      expect(outerCircle).toBeTruthy()
    })
  })

  describe('Connection Handles', () => {
    it('should have connection handles on all sides', () => {
      const { container } = render(<FlowchartNode {...defaultProps} />, { wrapper: Wrapper })
      const handles = container.querySelectorAll('.react-flow__handle')
      expect(handles.length).toBe(4)
    })
  })
})