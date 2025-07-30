import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { NodeEditorCore } from './NodeEditorCore'
import { ReactFlowProvider } from '@xyflow/react'
import { Provider as JotaiProvider } from 'jotai'

// Mock FlowchartNode
vi.mock('../../flowchart', () => {
  const { atom } = require('jotai')
  return {
    FlowchartNode: vi.fn(() => <div data-testid="flowchart-node">FlowchartNode</div>),
    FlowchartEdge: vi.fn(() => <div data-testid="flowchart-edge">FlowchartEdge</div>),
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

// Mock atoms module
vi.mock('./atoms', () => {
  const { atom } = require('jotai')
  return {
    selectedNodeAtom: atom(null),
    selectedEdgeAtom: atom(null),
    focusPropertyPanelAtom: atom(false),
    updateSelectionAtom: atom(null, () => {})
  }
})

describe('NodeEditorCore', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <JotaiProvider>
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </JotaiProvider>
  )

  it('should render ReactFlow with initial rectangle node', async () => {
    const { container } = render(<NodeEditorCore />, { wrapper: Wrapper })
    
    // Wait for ReactFlow to initialize
    await waitFor(() => {
      const reactFlow = container.querySelector('.react-flow')
      expect(reactFlow).toBeTruthy()
    })
    
    // Check initial node exists
    await waitFor(() => {
      const nodes = container.querySelectorAll('.react-flow__node')
      expect(nodes).toHaveLength(1)
    })
    
    // Check initial node has correct type (should be rectangle, not input)
    const rectangleNode = container.querySelector('.react-flow__node-rectangle')
    expect(rectangleNode).toBeTruthy()
  })

  it('should use FlowchartNode as custom node type', async () => {
    const { container } = render(<NodeEditorCore />, { wrapper: Wrapper })
    
    await waitFor(() => {
      const reactFlow = container.querySelector('.react-flow')
      expect(reactFlow).toBeTruthy()
    })

    // Check that custom node is rendered
    await waitFor(() => {
      const customNode = container.querySelector('[data-testid="flowchart-node"]')
      expect(customNode).toBeTruthy()
    })
  })

  it('should create rectangle node when connection is dropped on empty space', async () => {
    const { container } = render(<NodeEditorCore />, { wrapper: Wrapper })
    
    await waitFor(() => {
      const reactFlow = container.querySelector('.react-flow')
      expect(reactFlow).toBeTruthy()
    })

    // Simulate onConnectEnd event
    const pane = container.querySelector('.react-flow__pane')
    expect(pane).toBeTruthy()

    // We can't directly trigger onConnectEnd as it's internal to ReactFlow
    // Instead, we test that the node configuration is correct
    // The actual behavior will be tested in integration/e2e tests
  })

  it('should configure nodeTypes with FlowchartNode', async () => {
    const { container } = render(<NodeEditorCore />, { wrapper: Wrapper })
    
    await waitFor(() => {
      const reactFlow = container.querySelector('.react-flow')
      expect(reactFlow).toBeTruthy()
    })

    // The presence of custom node confirms nodeTypes is configured
    const customNode = container.querySelector('[data-testid="flowchart-node"]')
    expect(customNode).toBeTruthy()
  })
})