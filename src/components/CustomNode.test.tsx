import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'
import CustomNode from './CustomNode'
import { useAtomValue, useSetAtom } from 'jotai'
import { NodeProps } from 'reactflow'

// Mock jotai
vi.mock('jotai', () => ({
  useAtomValue: vi.fn(),
  useSetAtom: vi.fn(),
  atom: vi.fn(),
}))

// Mock reactflow store
vi.mock('reactflow', async () => {
  const actual = await vi.importActual('reactflow')
  return {
    ...actual,
    useStore: vi.fn(() => null),
  }
})

describe('CustomNode', () => {
  const mockSetNodes = vi.fn()
  const defaultProps: NodeProps = {
    id: 'node-1',
    data: { label: 'Test Node', shape: 'rectangle' },
    type: 'custom',
    selected: false,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    zIndex: 1,
    dragging: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useSetAtom as any).mockReturnValue(mockSetNodes)
  })

  describe('Drawing Mode', () => {
    it('should render edge handles when in draw-line mode', () => {
      ;(useAtomValue as any).mockReturnValue('draw-line')
      
      render(
        <ReactFlowProvider>
          <CustomNode {...defaultProps} />
        </ReactFlowProvider>
      )

      // Check for handles using class name instead of role
      const handles = document.querySelectorAll('.react-flow__handle')
      expect(handles.length).toBeGreaterThan(0) // Should have handles in draw-line mode
    })

    it('should not render edge handles when in select mode', () => {
      ;(useAtomValue as any).mockReturnValue('select')
      
      render(
        <ReactFlowProvider>
          <CustomNode {...defaultProps} />
        </ReactFlowProvider>
      )

      // Should only have top and bottom handles
      const handles = document.querySelectorAll('.react-flow__handle')
      expect(handles.length).toBe(2)
    })
  })

  describe('Node Interaction', () => {
    it('should show hover effect when hovering over edge handle', () => {
      ;(useAtomValue as any).mockReturnValue('draw-line')
      
      const { container } = render(
        <ReactFlowProvider>
          <CustomNode {...defaultProps} />
        </ReactFlowProvider>
      )

      const handle = container.querySelector('.react-flow__handle-top')
      expect(handle).toBeTruthy()
      
      // Simulate hover
      if (handle) {
        fireEvent.mouseEnter(handle)
        const style = window.getComputedStyle(handle)
        // Handle should have hover styling
        expect(handle.getAttribute('style')).toContain('background')
      }
    })
  })

  describe('Connection Feedback', () => {
    it('should show connection feedback when node is being connected to', async () => {
      ;(useAtomValue as any).mockReturnValue('draw-line')
      
      const { useStore } = await import('reactflow')
      ;(useStore as any).mockReturnValue('node-1')
      
      const { container } = render(
        <ReactFlowProvider>
          <CustomNode {...defaultProps} />
        </ReactFlowProvider>
      )

      // Node should have connection styling
      const nodeElement = container.querySelector('[style*="border"]')
      expect(nodeElement).toBeTruthy()
      if (nodeElement) {
        const style = nodeElement.getAttribute('style')
        expect(style).toContain('rgb(59, 130, 246)') // Blue border color
      }
    })
  })
})