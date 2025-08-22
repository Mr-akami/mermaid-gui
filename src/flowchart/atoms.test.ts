import { describe, it, expect } from 'vitest'
import { createStore } from 'jotai'
import {
  nodesAtom,
  edgesAtom,
  flowchartDataAtom,
  mermaidCodeAtom,
  addNodeAtom,
  removeNodeAtom,
  updateNodeAtom,
  addEdgeAtom,
  removeEdgeAtom,
} from './atoms'
import type { Node, Edge } from './deps'

describe('flowchart atoms', () => {
  it('should initialize with empty nodes and edges', () => {
    const store = createStore()

    expect(store.get(nodesAtom)).toEqual([])
    expect(store.get(edgesAtom)).toEqual([])
  })

  it('should compute flowchartData from nodes and edges', () => {
    const store = createStore()

    const node1: Node = {
      id: 'node1',
      type: 'rectangle',
      childIds: [],
      position: { x: 0, y: 0 },
      data: { label: 'Start' },
    }

    const edge1: Edge = {
      id: 'edge1',
      source: 'node1',
      target: 'node2',
      type: 'normal-arrow',
    }

    store.set(nodesAtom, [node1])
    store.set(edgesAtom, [edge1])

    const flowchartData = store.get(flowchartDataAtom)
    expect(flowchartData.nodes).toEqual([node1])
    expect(flowchartData.edges).toEqual([edge1])
  })

  it('should generate mermaid code from flowchart data', () => {
    const store = createStore()

    const node1: Node = {
      id: 'A',
      type: 'rectangle',
      childIds: [],
      position: { x: 0, y: 0 },
      data: { label: 'Start' },
    }

    store.set(nodesAtom, [node1])
    store.set(edgesAtom, [])

    const code = store.get(mermaidCodeAtom)
    expect(code).toBe(`flowchart TD
    A[Start]`)
  })

  describe('node operations', () => {
    it('should add a node', () => {
      const store = createStore()

      const newNode = {
        type: 'rectangle' as const,
        position: { x: 100, y: 100 },
        label: 'New Node',
      }

      store.set(addNodeAtom, newNode)

      const nodes = store.get(nodesAtom)
      expect(nodes).toHaveLength(1)
      expect(nodes[0]).toMatchObject({
        type: 'rectangle',
        position: { x: 100, y: 100 },
        data: { label: 'New Node' },
      })
      expect(nodes[0].id).toBeDefined()
    })

    it('should remove a node', () => {
      const store = createStore()

      const node1: Node = {
        id: 'node1',
        type: 'rectangle',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Node 1' },
      }

      store.set(nodesAtom, [node1])
      store.set(removeNodeAtom, 'node1')

      expect(store.get(nodesAtom)).toEqual([])
    })

    it('should update a node', () => {
      const store = createStore()

      const node1: Node = {
        id: 'node1',
        type: 'rectangle',
        childIds: [],
        position: { x: 0, y: 0 },
        data: { label: 'Old Label' },
      }

      store.set(nodesAtom, [node1])
      store.set(updateNodeAtom, {
        id: 'node1',
        data: { label: 'New Label' },
      })

      const updatedNode = store.get(nodesAtom)[0]
      expect(updatedNode.data.label).toBe('New Label')
    })
  })

  describe('edge operations', () => {
    it('should add an edge', () => {
      const store = createStore()

      const newEdge = {
        source: 'node1',
        target: 'node2',
        type: 'normal-arrow' as const,
      }

      store.set(addEdgeAtom, newEdge)

      const edges = store.get(edgesAtom)
      expect(edges).toHaveLength(1)
      expect(edges[0]).toMatchObject({
        source: 'node1',
        target: 'node2',
        type: 'normal-arrow',
      })
      expect(edges[0].id).toBeDefined()
    })

    it('should remove an edge', () => {
      const store = createStore()

      const edge1: Edge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        type: 'normal-arrow',
      }

      store.set(edgesAtom, [edge1])
      store.set(removeEdgeAtom, 'edge1')

      expect(store.get(edgesAtom)).toEqual([])
    })
  })
})
