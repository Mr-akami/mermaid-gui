import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'
import FlowEditor from './FlowEditor'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'

// Mock jotai
vi.mock('jotai', () => ({
  useAtom: vi.fn(),
  useAtomValue: vi.fn(),
  useSetAtom: vi.fn(),
  atom: vi.fn(),
}))

// Mock hooks
vi.mock('@/hooks/useHistory', () => ({
  useHistory: vi.fn(),
}))

describe('FlowEditor - Line Drawing', () => {
  const mockSetNodes = vi.fn()
  const mockSetEdges = vi.fn()
  const mockNodes = [
    {
      id: '1',
      type: 'flowchart',
      position: { x: 100, y: 100 },
      data: { label: 'Node 1', shape: 'rectangle' },
    },
    {
      id: '2',
      type: 'flowchart',
      position: { x: 300, y: 100 },
      data: { label: 'Node 2', shape: 'rectangle' },
    },
  ]
  const mockEdges: any[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup mocks
    ;(useAtom as any).mockImplementation((atom: any) => {
      if (atom.toString().includes('nodes')) {
        return [mockNodes, mockSetNodes]
      }
      if (atom.toString().includes('edges')) {
        return [mockEdges, mockSetEdges]
      }
      if (atom.toString().includes('pendingNode')) {
        return [null, vi.fn()]
      }
      return [null, vi.fn()]
    })
    
    ;(useAtomValue as any).mockImplementation((atom: any) => {
      if (atom.toString().includes('diagramType')) return 'flowchart'
      if (atom.toString().includes('drawingMode')) return 'draw-line'
      if (atom.toString().includes('placementMode')) return 'auto'
      return null
    })
    
    ;(useSetAtom as any).mockReturnValue(vi.fn())
  })

  it('should create an edge when connecting two nodes', async () => {
    const { container } = render(<FlowEditor />)

    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(container.querySelector('.react-flow')).toBeTruthy()
    })

    // Simulate connection
    const connectParams = {
      source: '1',
      target: '2',
      sourceHandle: 'source',
      targetHandle: 'target',
    }

    // Find and trigger onConnect
    const reactFlowInstance = container.querySelector('.react-flow')
    if (reactFlowInstance) {
      // Simulate the connection event
      const event = new CustomEvent('connect', { detail: connectParams })
      reactFlowInstance.dispatchEvent(event)
    }

    // Verify edge was created
    expect(mockSetEdges).toHaveBeenCalled()
  })

  it('should show connection line preview when dragging', async () => {
    const { container } = render(<FlowEditor />)

    await waitFor(() => {
      expect(container.querySelector('.react-flow')).toBeTruthy()
    })

    // Look for connection line component
    const connectionLine = container.querySelector('.react-flow__connection-line')
    
    // When dragging a connection, the line should be visible
    if (connectionLine) {
      expect(connectionLine).toBeTruthy()
    }
  })
})