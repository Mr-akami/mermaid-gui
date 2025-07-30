import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PropertyPanel } from './PropertyPanel'
import { Provider as JotaiProvider } from 'jotai'
import { Node, Edge } from '../../common/types'

describe('PropertyPanel', () => {
  const mockOnNodeUpdate = vi.fn()
  const mockOnEdgeUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <JotaiProvider>{children}</JotaiProvider>
  )

  describe('visibility', () => {
    it('should not be visible when no selection', () => {
      const { container } = render(
        <PropertyPanel
          selectedNode={null}
          selectedEdge={null}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
        />,
        { wrapper: Wrapper }
      )

      const panel = container.querySelector('.property-panel')
      expect(panel).toBeNull()
    })

    it('should be visible when a node is selected', () => {
      const selectedNode: Node = {
        id: '1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'Test Node' },
        childIds: [],
      }

      render(
        <PropertyPanel
          selectedNode={selectedNode}
          selectedEdge={null}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
        />,
        { wrapper: Wrapper }
      )

      const panel = screen.getByTestId('property-panel')
      expect(panel).toBeTruthy()
    })

    it('should be visible when an edge is selected', () => {
      const selectedEdge: Edge = {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'normal-arrow',
        data: { label: 'Test Edge' },
      }

      render(
        <PropertyPanel
          selectedNode={null}
          selectedEdge={selectedEdge}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
        />,
        { wrapper: Wrapper }
      )

      const panel = screen.getByTestId('property-panel')
      expect(panel).toBeTruthy()
    })
  })

  describe('node editing', () => {
    it('should display current node label', () => {
      const selectedNode: Node = {
        id: '1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'My Rectangle' },
        childIds: [],
      }

      render(
        <PropertyPanel
          selectedNode={selectedNode}
          selectedEdge={null}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
        />,
        { wrapper: Wrapper }
      )

      const input = screen.getByLabelText('Label') as HTMLInputElement
      expect(input.value).toBe('My Rectangle')
    })

    it('should display node type selector', () => {
      const selectedNode: Node = {
        id: '1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'Test' },
        childIds: [],
      }

      render(
        <PropertyPanel
          selectedNode={selectedNode}
          selectedEdge={null}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
        />,
        { wrapper: Wrapper }
      )

      const typeSelect = screen.getByLabelText('Type') as HTMLSelectElement
      expect(typeSelect).toBeTruthy()
      expect(typeSelect.value).toBe('rectangle')
    })

    it('should call onNodeUpdate immediately when label is changed', async () => {
      const selectedNode: Node = {
        id: '1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'Old Label' },
        childIds: [],
      }

      render(
        <PropertyPanel
          selectedNode={selectedNode}
          selectedEdge={null}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
        />,
        { wrapper: Wrapper }
      )

      const input = screen.getByLabelText('Label')
      fireEvent.change(input, { target: { value: 'New Label' } })

      // Should be called immediately without blur
      await waitFor(() => {
        expect(mockOnNodeUpdate).toHaveBeenCalledWith({
          id: '1',
          data: { label: 'New Label' },
        })
      })
    })

    it('should call onNodeUpdate when type is changed', async () => {
      const selectedNode: Node = {
        id: '1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'Test' },
        childIds: [],
      }

      render(
        <PropertyPanel
          selectedNode={selectedNode}
          selectedEdge={null}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
        />,
        { wrapper: Wrapper }
      )

      const typeSelect = screen.getByLabelText('Type')
      fireEvent.change(typeSelect, { target: { value: 'circle' } })

      await waitFor(() => {
        expect(mockOnNodeUpdate).toHaveBeenCalledWith({
          id: '1',
          type: 'circle',
        })
      })
    })
  })

  describe('edge editing', () => {
    it('should display current edge label', () => {
      const selectedEdge: Edge = {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'normal-arrow',
        data: { label: 'My Edge' },
      }

      render(
        <PropertyPanel
          selectedNode={null}
          selectedEdge={selectedEdge}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
        />,
        { wrapper: Wrapper }
      )

      const input = screen.getByLabelText('Label') as HTMLInputElement
      expect(input.value).toBe('My Edge')
    })

    it('should display edge type selector', () => {
      const selectedEdge: Edge = {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'normal-arrow',
      }

      render(
        <PropertyPanel
          selectedNode={null}
          selectedEdge={selectedEdge}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
        />,
        { wrapper: Wrapper }
      )

      const typeSelect = screen.getByLabelText('Type') as HTMLSelectElement
      expect(typeSelect).toBeTruthy()
      expect(typeSelect.value).toBe('normal-arrow')
    })

    it('should call onEdgeUpdate immediately when label is changed', async () => {
      const selectedEdge: Edge = {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'normal-arrow',
        data: { label: 'Old Label' },
      }

      render(
        <PropertyPanel
          selectedNode={null}
          selectedEdge={selectedEdge}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
        />,
        { wrapper: Wrapper }
      )

      const input = screen.getByLabelText('Label')
      fireEvent.change(input, { target: { value: 'New Label' } })

      // Should be called immediately without blur
      await waitFor(() => {
        expect(mockOnEdgeUpdate).toHaveBeenCalledWith({
          id: 'e1-2',
          data: { label: 'New Label' },
        })
      })
    })

    it('should call onEdgeUpdate when type is changed', async () => {
      const selectedEdge: Edge = {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'normal-arrow',
      }

      render(
        <PropertyPanel
          selectedNode={null}
          selectedEdge={selectedEdge}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
        />,
        { wrapper: Wrapper }
      )

      const typeSelect = screen.getByLabelText('Type')
      fireEvent.change(typeSelect, { target: { value: 'dotted-arrow' } })

      await waitFor(() => {
        expect(mockOnEdgeUpdate).toHaveBeenCalledWith({
          id: 'e1-2',
          type: 'dotted-arrow',
        })
      })
    })
  })

  describe('auto-focus', () => {
    it('should auto-focus label input when autoFocus prop is true', async () => {
      const selectedNode: Node = {
        id: '1',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        data: { label: 'Test' },
        childIds: [],
      }

      render(
        <PropertyPanel
          selectedNode={selectedNode}
          selectedEdge={null}
          onNodeUpdate={mockOnNodeUpdate}
          onEdgeUpdate={mockOnEdgeUpdate}
          autoFocus={true}
        />,
        { wrapper: Wrapper }
      )

      await waitFor(() => {
        const input = screen.getByLabelText('Label') as HTMLInputElement
        expect(document.activeElement).toBe(input)
      })
    })
  })
})