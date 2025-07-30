import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PropertyPanel } from './PropertyPanel'
import { Provider as JotaiProvider } from 'jotai'
import { Edge } from '../../common/types'
import { MERMAID_EDGE_TYPES } from '../../flowchart'

describe('PropertyPanel - Edge Type Changes', () => {
  const mockOnNodeUpdate = vi.fn()
  const mockOnEdgeUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <JotaiProvider>{children}</JotaiProvider>
  )

  it('should display all available edge types in the dropdown', () => {
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
    const options = Array.from(typeSelect.options).map(option => option.value)
    
    // Verify all edge types are available
    expect(options).toEqual(MERMAID_EDGE_TYPES)
  })

  it('should call onEdgeUpdate with correct type when edge type is changed', async () => {
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
    
    // Change from normal-arrow to dotted-arrow
    fireEvent.change(typeSelect, { target: { value: 'dotted-arrow' } })

    await waitFor(() => {
      expect(mockOnEdgeUpdate).toHaveBeenCalledWith({
        id: 'e1-2',
        type: 'dotted-arrow',
      })
    })
  })

  it('should update displayed type when edge type changes', async () => {
    let selectedEdge: Edge = {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'normal-arrow',
    }

    const { rerender } = render(
      <PropertyPanel
        selectedNode={null}
        selectedEdge={selectedEdge}
        onNodeUpdate={mockOnNodeUpdate}
        onEdgeUpdate={mockOnEdgeUpdate}
      />,
      { wrapper: Wrapper }
    )

    const typeSelect = screen.getByLabelText('Type') as HTMLSelectElement
    expect(typeSelect.value).toBe('normal-arrow')

    // Update the edge type
    selectedEdge = {
      ...selectedEdge,
      type: 'thick',
    }

    rerender(
      <PropertyPanel
        selectedNode={null}
        selectedEdge={selectedEdge}
        onNodeUpdate={mockOnNodeUpdate}
        onEdgeUpdate={mockOnEdgeUpdate}
      />
    )

    await waitFor(() => {
      expect(typeSelect.value).toBe('thick')
    })
  })

  it('should handle changing from arrow to non-arrow edge types', async () => {
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
    
    // Change from arrow to non-arrow
    fireEvent.change(typeSelect, { target: { value: 'normal' } })

    await waitFor(() => {
      expect(mockOnEdgeUpdate).toHaveBeenCalledWith({
        id: 'e1-2',
        type: 'normal',
      })
    })

    vi.clearAllMocks()

    // Change from non-arrow to arrow
    fireEvent.change(typeSelect, { target: { value: 'thick-arrow' } })

    await waitFor(() => {
      expect(mockOnEdgeUpdate).toHaveBeenCalledWith({
        id: 'e1-2',
        type: 'thick-arrow',
      })
    })
  })
})