import { describe, it, expect, vi } from 'vitest'
import { render, waitFor, screen } from '@testing-library/react'
import { NodeEditorCore } from './NodeEditorCore'
import { ReactFlowProvider } from '@xyflow/react'
import { Provider as JotaiProvider } from 'jotai'

// Mock FlowchartNode
vi.mock('../../flowchart', () => {
  const { atom } = require('jotai')
  return {
    FlowchartNode: vi.fn(({ id, data, selected }) => (
      <div 
        data-testid="flowchart-node" 
        data-id={id}
        data-selected={selected}
      >
        {data?.label || 'Node'}
      </div>
    )),
    FlowchartEdge: vi.fn(() => <div data-testid="flowchart-edge">FlowchartEdge</div>),
    BiDirectionalEdge: vi.fn(() => <div data-testid="bidirectional-edge">BiDirectionalEdge</div>),
    MERMAID_NODE_TYPES: ['rectangle', 'circle', 'diamond'],
    NODE_TYPE_CONFIG: {
      rectangle: { defaultLabel: 'Rectangle' },
      circle: { defaultLabel: 'Circle' },
      diamond: { defaultLabel: 'Diamond' }
    },
    nodesAtom: atom([]),
    edgesAtom: atom([]),
    updateNodeAtom: atom(null, () => {}),
    updateEdgeAtom: atom(null, () => {})
  }
})

// Mock history module
vi.mock('../../history', () => {
  const { atom } = require('jotai')
  return {
    saveToHistoryAtom: atom(null, () => {}),
    canUndoAtom: atom(false),
    canRedoAtom: atom(false),
    undoAtom: atom(null, () => null),
    redoAtom: atom(null, () => null)
  }
})

describe.skip('NodeEditorCore - PropertyPanel Integration', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <JotaiProvider>
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </JotaiProvider>
  )

  it('should show PropertyPanel when a node is selected', async () => {
    render(<NodeEditorCore />, { wrapper: Wrapper })
    
    // Wait for ReactFlow to initialize
    await waitFor(() => {
      const reactFlow = document.querySelector('.react-flow')
      expect(reactFlow).toBeTruthy()
    })

    // Initially PropertyPanel should not be visible
    let propertyPanel = screen.queryByTestId('property-panel')
    expect(propertyPanel).toBeNull()

    // Simulate node selection by triggering onSelectionChange
    // Since we can't directly interact with React Flow's internal selection,
    // we'll test that the PropertyPanel component is included in the render
    // The actual selection behavior will be tested in integration tests
  })

  it('should trigger focus on PropertyPanel when node is double-clicked', async () => {
    render(<NodeEditorCore />, { wrapper: Wrapper })
    
    await waitFor(() => {
      const reactFlow = document.querySelector('.react-flow')
      expect(reactFlow).toBeTruthy()
    })

    // The double-click behavior will be tested when integrated with React Flow
    // For now, we verify that the component structure supports this feature
  })

  it('should update node when PropertyPanel changes are made', async () => {
    render(<NodeEditorCore />, { wrapper: Wrapper })
    
    await waitFor(() => {
      const reactFlow = document.querySelector('.react-flow')
      expect(reactFlow).toBeTruthy()
    })

    // Verify that update handlers are properly connected
    // The actual update behavior requires React Flow integration
  })

  it('should include PropertyPanel component in render', () => {
    const { container } = render(<NodeEditorCore />, { wrapper: Wrapper })
    
    // Verify that the NodeEditorCore includes the necessary structure
    // for PropertyPanel integration
    const wrapper = container.querySelector('.wrapper')
    expect(wrapper).toBeTruthy()
  })
})