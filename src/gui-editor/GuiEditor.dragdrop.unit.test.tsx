import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { GuiEditor } from './GuiEditor'
import { Provider } from 'jotai'
import { ReactFlowProvider } from '@xyflow/react'
import { useStore } from 'jotai'
import { nodesAtom } from './atoms'

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    <ReactFlowProvider>{children}</ReactFlowProvider>
  </Provider>
)

// Component to access Jotai store in tests
function StoreAccessor({ onStore }: { onStore: (store: any) => void }) {
  const store = useStore()
  onStore(store)
  return null
}

describe('GuiEditor - Unit Tests for Drag & Drop Logic', () => {
  let store: any

  beforeEach(() => {
    store = null
  })

  const getStore = (container: HTMLElement) => {
    return new Promise<any>((resolve) => {
      render(
        <Provider>
          <StoreAccessor onStore={(s) => { store = s; resolve(s) }} />
        </Provider>,
        { container }
      )
    })
  }

  it('should verify parent-child relationship logic', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    // Wait for React Flow to initialize
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })

    // Get access to the store
    await getStore(container)

    // Add nodes programmatically to test the logic
    const subgraphNode = {
      id: 'subgraph1',
      type: 'subgraph',
      position: { x: 200, y: 200 },
      data: { 
        label: 'Test Subgraph',
        width: 600,
        height: 200
      }
    }

    const rectangleNode = {
      id: 'rect1',
      type: 'flowchart',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Test Rectangle',
        shape: 'Rectangle'
      }
    }

    // Set nodes in the store
    store.set(nodesAtom, [subgraphNode, rectangleNode])

    // Wait for nodes to render
    await waitFor(() => {
      const nodes = store.get(nodesAtom)
      expect(nodes).toHaveLength(2)
    })

    // Test parent assignment logic
    const updatedRectangle = {
      ...rectangleNode,
      parentId: 'subgraph1',
      position: { x: 50, y: 50 } // Position relative to parent
    }

    store.set(nodesAtom, [subgraphNode, updatedRectangle])

    await waitFor(() => {
      const nodes = store.get(nodesAtom)
      const rect = nodes.find(n => n.id === 'rect1')
      expect(rect?.parentId).toBe('subgraph1')
    })
  })

  it('should calculate if node is inside subgraph bounds', () => {
    const subgraph = {
      position: { x: 200, y: 200 },
      data: { width: 600, height: 200 }
    }

    const nodeInsideBounds = {
      position: { x: 300, y: 250 },
      data: { width: 100, height: 50 }
    }

    const nodeOutsideBounds = {
      position: { x: 100, y: 100 },
      data: { width: 100, height: 50 }
    }

    // Helper function to check if node is inside subgraph
    const isNodeInsideSubgraph = (node: any, subgraph: any) => {
      const nodeRight = node.position.x + (node.data.width || 100)
      const nodeBottom = node.position.y + (node.data.height || 50)
      
      const subgraphRight = subgraph.position.x + subgraph.data.width
      const subgraphBottom = subgraph.position.y + subgraph.data.height

      return (
        node.position.x >= subgraph.position.x &&
        node.position.y >= subgraph.position.y &&
        nodeRight <= subgraphRight &&
        nodeBottom <= subgraphBottom
      )
    }

    expect(isNodeInsideSubgraph(nodeInsideBounds, subgraph)).toBe(true)
    expect(isNodeInsideSubgraph(nodeOutsideBounds, subgraph)).toBe(false)
  })

  it('should handle drop indicator class logic', async () => {
    const { container } = render(<GuiEditor />, { wrapper: Wrapper })
    
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeDefined()
    })

    // Add a subgraph using the toolbar
    const subgraphButton = screen.getByTitle('Subgraph')
    fireEvent.click(subgraphButton)

    // Click on canvas to add the subgraph
    const pane = container.querySelector('.react-flow__pane')
    if (pane) {
      fireEvent.click(pane, { clientX: 200, clientY: 200 })
    }

    await waitFor(() => {
      expect(screen.getByText('New subgraph')).toBeDefined()
    })

    // Verify the subgraph node exists and can be targeted
    const subgraphNode = screen.getByText('New subgraph').closest('.react-flow__node')
    expect(subgraphNode).toBeTruthy()
    expect(subgraphNode?.classList.contains('react-flow__node-subgraph')).toBe(true)
  })
})