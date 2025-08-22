import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ParticipantLifeline } from './ParticipantLifeline'
import { ReactFlowProvider } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'

// Mock the ReactFlow hooks
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react')
  return {
    ...actual,
    useUpdateNodeInternals: () => vi.fn(),
    useStore: vi.fn(() => [])
  }
})

// Wrapper component for React Flow context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('ParticipantLifeline - Context Menu Handle System', () => {
  const defaultProps: NodeProps = {
    id: 'test-node',
    data: {
      type: 'participant',
      label: 'Test Participant'
    },
    selected: false,
    type: 'participantLifeline',
    isConnectable: true,
    dragging: false
  } as NodeProps

  it('should start with no handles', () => {
    const { container } = render(<ParticipantLifeline {...defaultProps} />, { wrapper: Wrapper })
    
    const handles = container.querySelectorAll('.react-flow__handle')
    expect(handles.length).toBe(0)
  })

  it('should show plus button when hovering over lifeline', () => {
    const { container } = render(<ParticipantLifeline {...defaultProps} />, { wrapper: Wrapper })
    
    const lifeline = container.querySelector('.lifeline') as HTMLElement
    expect(lifeline).toBeTruthy()
    
    // Hover over lifeline
    fireEvent.mouseEnter(lifeline)
    
    const plusButton = container.querySelector('.add-handle-btn')
    expect(plusButton).toBeTruthy()
    expect(plusButton?.textContent).toBe('+')
  })

  it('should show context menu when plus button is clicked', () => {
    const { container } = render(<ParticipantLifeline {...defaultProps} />, { wrapper: Wrapper })
    
    const lifeline = container.querySelector('.lifeline') as HTMLElement
    fireEvent.mouseEnter(lifeline)
    
    const plusButton = container.querySelector('.add-handle-btn') as HTMLElement
    fireEvent.click(plusButton)
    
    // Check context menu appears
    const contextMenu = container.querySelector('.handle-context-menu')
    expect(contextMenu).toBeTruthy()
    
    // Check both options are present
    expect(screen.getByText('Left (Target)')).toBeDefined()
    expect(screen.getByText('Right (Source)')).toBeDefined()
  })

  it('should add left handle when left option is selected', async () => {
    const { container } = render(<ParticipantLifeline {...defaultProps} />, { wrapper: Wrapper })
    
    const lifeline = container.querySelector('.lifeline') as HTMLElement
    
    // Simulate mouse movement with clientY
    const rect = lifeline.getBoundingClientRect()
    fireEvent.mouseMove(lifeline, { 
      clientY: rect.top + 100,
      currentTarget: lifeline
    })
    fireEvent.mouseEnter(lifeline)
    
    const plusButton = container.querySelector('.add-handle-btn') as HTMLElement
    fireEvent.click(plusButton)
    
    const leftOption = screen.getByText('Left (Target)')
    fireEvent.click(leftOption)
    
    await waitFor(() => {
      const handles = container.querySelectorAll('[data-handlepos="left"]')
      expect(handles.length).toBe(1)
      
      const handle = handles[0] as HTMLElement
      expect(handle.style.top).toBe('100px')
    })
  })

  it('should add right handle when right option is selected', async () => {
    const { container } = render(<ParticipantLifeline {...defaultProps} />, { wrapper: Wrapper })
    
    const lifeline = container.querySelector('.lifeline') as HTMLElement
    
    // Simulate mouse movement with clientY
    const rect = lifeline.getBoundingClientRect()
    fireEvent.mouseMove(lifeline, { 
      clientY: rect.top + 150,
      currentTarget: lifeline
    })
    fireEvent.mouseEnter(lifeline)
    
    const plusButton = container.querySelector('.add-handle-btn') as HTMLElement
    fireEvent.click(plusButton)
    
    const rightOption = screen.getByText('Right (Source)')
    fireEvent.click(rightOption)
    
    await waitFor(() => {
      const handles = container.querySelectorAll('[data-handlepos="right"]')
      expect(handles.length).toBe(1)
      
      const handle = handles[0] as HTMLElement
      expect(handle.style.top).toBe('150px')
    })
  })

  it('should maintain offset between handles', async () => {
    const { container } = render(<ParticipantLifeline {...defaultProps} />, { wrapper: Wrapper })
    
    const lifeline = container.querySelector('.lifeline') as HTMLElement
    const rect = lifeline.getBoundingClientRect()
    
    // Add first handle at Y=100
    fireEvent.mouseMove(lifeline, { 
      clientY: rect.top + 100,
      currentTarget: lifeline
    })
    fireEvent.mouseEnter(lifeline)
    let plusButton = container.querySelector('.add-handle-btn') as HTMLElement
    fireEvent.click(plusButton)
    fireEvent.click(screen.getByText('Left (Target)'))
    
    // Try to add second handle at Y=110 (too close)
    fireEvent.mouseMove(lifeline, { 
      clientY: rect.top + 110,
      currentTarget: lifeline
    })
    plusButton = container.querySelector('.add-handle-btn') as HTMLElement
    fireEvent.click(plusButton)
    fireEvent.click(screen.getByText('Left (Target)'))
    
    await waitFor(() => {
      const handles = container.querySelectorAll('[data-handlepos="left"]')
      expect(handles.length).toBe(2)
      
      const handle1 = handles[0] as HTMLElement
      const handle2 = handles[1] as HTMLElement
      
      const y1 = parseInt(handle1.style.top)
      const y2 = parseInt(handle2.style.top)
      
      // Second handle should be at least OFFSET pixels away
      expect(Math.abs(y2 - y1)).toBeGreaterThanOrEqual(30) // Assuming 30px offset
    })
  })

  it('should push down existing handles when inserting above', async () => {
    const { container } = render(<ParticipantLifeline {...defaultProps} />, { wrapper: Wrapper })
    
    const lifeline = container.querySelector('.lifeline') as HTMLElement
    const rect = lifeline.getBoundingClientRect()
    
    // Add first handle at Y=150
    fireEvent.mouseMove(lifeline, { 
      clientY: rect.top + 150,
      currentTarget: lifeline
    })
    fireEvent.mouseEnter(lifeline)
    let plusButton = container.querySelector('.add-handle-btn') as HTMLElement
    fireEvent.click(plusButton)
    fireEvent.click(screen.getByText('Left (Target)'))
    
    await waitFor(() => {
      const handles = container.querySelectorAll('[data-handlepos="left"]')
      expect(handles.length).toBe(1)
    })
    
    // Add second handle at Y=100 (above first)
    fireEvent.mouseMove(lifeline, { 
      clientY: rect.top + 100,
      currentTarget: lifeline
    })
    plusButton = container.querySelector('.add-handle-btn') as HTMLElement
    fireEvent.click(plusButton)
    fireEvent.click(screen.getByText('Left (Target)'))
    
    await waitFor(() => {
      const handles = container.querySelectorAll('[data-handlepos="left"]')
      expect(handles.length).toBe(2)
      
      // First handle should be at Y=100
      // Second handle should be pushed down to Y=180 (150 + 30px offset when pushed)
      const positions = Array.from(handles).map(h => parseInt((h as HTMLElement).style.top))
      expect(positions).toContain(100)
      expect(positions).toContain(180)
    })
  })
})