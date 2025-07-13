import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'jotai'
import { createStore } from 'jotai'
import MermaidPanel from '../MermaidPanel'
import { nodesAtom, edgesAtom } from '../../store/flowStore'
import { diagramTypeAtom } from '../../store/diagramStore'

// Mock the navigator.clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined)
}

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  configurable: true
})

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mocked-blob-url'),
  configurable: true
})
Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  configurable: true
})

describe('MermaidPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state when no nodes exist', () => {
    const store = createStore()
    
    render(
      <Provider store={store}>
        <MermaidPanel />
      </Provider>
    )

    expect(screen.getByText('Mermaid Code')).toBeInTheDocument()
    expect(screen.getByText(/No diagram created yet/)).toBeInTheDocument()
    expect(screen.queryByText('Copy')).not.toBeInTheDocument()
    expect(screen.queryByText('Save')).not.toBeInTheDocument()
  })

  it('displays generated mermaid code when nodes exist', () => {
    const store = createStore()
    
    // Set up flowchart with nodes
    const nodes = [
      {
        id: 'A',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Start', shape: 'rectangle' }
      },
      {
        id: 'B',
        type: 'flowchart',
        position: { x: 100, y: 100 },
        data: { label: 'End', shape: 'circle' }
      }
    ]
    
    const edges = [
      {
        id: 'A-B',
        source: 'A',
        target: 'B',
        type: 'flowchart'
      }
    ]
    
    store.set(diagramTypeAtom, 'flowchart')
    store.set(nodesAtom, nodes)
    store.set(edgesAtom, edges)
    
    render(
      <Provider store={store}>
        <MermaidPanel />
      </Provider>
    )

    // Should show the generated mermaid code
    expect(screen.getByText(/graph TD/)).toBeInTheDocument()
    expect(screen.getByText(/A\[Start\]/)).toBeInTheDocument()
    expect(screen.getByText(/B\(\(End\)\)/)).toBeInTheDocument()
    expect(screen.getByText(/A --> B/)).toBeInTheDocument()
    
    // Should show copy and save buttons
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('updates mermaid code when diagram type changes', () => {
    const store = createStore()
    
    // Set up sequence diagram
    const nodes = [
      {
        id: 'Alice',
        type: 'sequence',
        position: { x: 0, y: 0 },
        data: { label: 'Alice', type: 'participant' }
      },
      {
        id: 'Bob',
        type: 'sequence',
        position: { x: 100, y: 0 },
        data: { label: 'Bob', type: 'actor' }
      }
    ]
    
    store.set(diagramTypeAtom, 'sequence')
    store.set(nodesAtom, nodes)
    
    render(
      <Provider store={store}>
        <MermaidPanel />
      </Provider>
    )

    // Should show sequence diagram code
    expect(screen.getByText(/sequenceDiagram/)).toBeInTheDocument()
    expect(screen.getByText(/participant Alice/)).toBeInTheDocument()
    expect(screen.getByText(/actor Bob/)).toBeInTheDocument()
  })

  it('copies mermaid code to clipboard when copy button clicked', async () => {
    const store = createStore()
    
    const nodes = [
      {
        id: 'A',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Test', shape: 'rectangle' }
      }
    ]
    
    store.set(diagramTypeAtom, 'flowchart')
    store.set(nodesAtom, nodes)
    
    render(
      <Provider store={store}>
        <MermaidPanel />
      </Provider>
    )

    const copyButton = screen.getByText('Copy')
    fireEvent.click(copyButton)
    
    // Should have called clipboard API
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('graph TD')
    )
    
    // Should show "Copied!" feedback
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
    
    // Should revert back to "Copy" after timeout
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows save button when mermaid code exists', () => {
    const store = createStore()
    
    const nodes = [
      {
        id: 'A',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Test', shape: 'rectangle' }
      }
    ]
    
    store.set(diagramTypeAtom, 'flowchart')
    store.set(nodesAtom, nodes)
    
    render(
      <Provider store={store}>
        <MermaidPanel />
      </Provider>
    )

    // Should show save button when content exists
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('displays mermaid code content correctly', () => {
    const store = createStore()
    
    const nodes = [
      {
        id: 'TestNode',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Test Node', shape: 'rectangle' }
      }
    ]
    
    store.set(diagramTypeAtom, 'flowchart')
    store.set(nodesAtom, nodes)
    
    render(
      <Provider store={store}>
        <MermaidPanel />
      </Provider>
    )

    // Should show the generated mermaid code
    expect(screen.getByText(/graph TD/)).toBeInTheDocument()
    expect(screen.getByText(/TestNode\[Test Node\]/)).toBeInTheDocument()
  })

  it('shows buttons when content exists', () => {
    const store = createStore()
    
    const nodes = [
      {
        id: 'A',
        type: 'sequence',
        position: { x: 0, y: 0 },
        data: { label: 'Participant A', type: 'participant' }
      }
    ]
    
    store.set(diagramTypeAtom, 'sequence')
    store.set(nodesAtom, nodes)
    
    render(
      <Provider store={store}>
        <MermaidPanel />
      </Provider>
    )

    // Should show both copy and save buttons
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText(/sequenceDiagram/)).toBeInTheDocument()
  })
})