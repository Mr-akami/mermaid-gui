import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PropertyPanel } from './PropertyPanel'
import { Provider as JotaiProvider } from 'jotai'
import { Node } from '../../common/types'

describe('PropertyPanel - Focus Retention During Editing', () => {
  const mockOnNodeUpdate = vi.fn()
  const mockOnEdgeUpdate = vi.fn()

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <JotaiProvider>{children}</JotaiProvider>
  )

  it('should retain focus when typing in the label input', async () => {
    const selectedNode: Node = {
      id: '1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      data: { label: 'Initial Label' },
      childIds: [],
    }

    const { rerender } = render(
      <PropertyPanel
        selectedNode={selectedNode}
        selectedEdge={null}
        onNodeUpdate={mockOnNodeUpdate}
        onEdgeUpdate={mockOnEdgeUpdate}
      />,
      { wrapper: Wrapper }
    )

    const input = screen.getByLabelText('Label') as HTMLInputElement
    
    // Focus the input
    input.focus()
    expect(document.activeElement).toBe(input)
    
    // Start typing
    fireEvent.change(input, { target: { value: 'New' } })
    
    // Simulate prop update from parent (node label changed)
    const updatedNode: Node = {
      ...selectedNode,
      data: { label: 'New' },
    }
    
    rerender(
      <PropertyPanel
        selectedNode={updatedNode}
        selectedEdge={null}
        onNodeUpdate={mockOnNodeUpdate}
        onEdgeUpdate={mockOnEdgeUpdate}
      />
    )
    
    // Input should still have focus
    expect(document.activeElement).toBe(input)
    
    // Continue typing
    fireEvent.change(input, { target: { value: 'New Label' } })
    
    // Input should still have focus
    expect(document.activeElement).toBe(input)
    
    // Value should be updated
    expect(input.value).toBe('New Label')
  })

  it('should update state from props after blur', async () => {
    let selectedNode: Node = {
      id: '1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      data: { label: 'Initial' },
      childIds: [],
    }

    const { rerender } = render(
      <PropertyPanel
        selectedNode={selectedNode}
        selectedEdge={null}
        onNodeUpdate={mockOnNodeUpdate}
        onEdgeUpdate={mockOnEdgeUpdate}
      />,
      { wrapper: Wrapper }
    )

    const input = screen.getByLabelText('Label') as HTMLInputElement
    
    // Focus and type
    input.focus()
    fireEvent.change(input, { target: { value: 'Edited' } })
    expect(input.value).toBe('Edited')
    
    // Blur the input
    input.blur()
    
    // Now update the node from external source
    selectedNode = {
      ...selectedNode,
      data: { label: 'External Update' },
    }
    
    rerender(
      <PropertyPanel
        selectedNode={selectedNode}
        selectedEdge={null}
        onNodeUpdate={mockOnNodeUpdate}
        onEdgeUpdate={mockOnEdgeUpdate}
      />
    )
    
    // After blur, the state should update from props
    await waitFor(() => {
      expect(input.value).toBe('External Update')
    })
  })
})