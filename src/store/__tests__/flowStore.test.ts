import { describe, it, expect } from 'vitest'
import { createStore } from 'jotai'
import { Node, Edge } from 'reactflow'
import { nodesAtom, edgesAtom, sequenceBlocksAtom, mermaidCodeAtom } from '../flowStore'
import { diagramTypeAtom, flowchartDirectionAtom } from '../diagramStore'
import { FlowchartNode, SequenceNode, SequenceBlock } from '../../types/diagram'

describe('Flow Store Atoms', () => {
  it('initializes with empty arrays', () => {
    const store = createStore()
    
    expect(store.get(nodesAtom)).toEqual([])
    expect(store.get(edgesAtom)).toEqual([])
    expect(store.get(sequenceBlocksAtom)).toEqual([])
  })

  it('stores and retrieves nodes correctly', () => {
    const store = createStore()
    const testNodes: Node[] = [
      {
        id: 'node1',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Test Node' }
      }
    ]

    store.set(nodesAtom, testNodes)
    expect(store.get(nodesAtom)).toEqual(testNodes)
  })

  it('stores and retrieves edges correctly', () => {
    const store = createStore()
    const testEdges: Edge[] = [
      {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        type: 'flowchart'
      }
    ]

    store.set(edgesAtom, testEdges)
    expect(store.get(edgesAtom)).toEqual(testEdges)
  })

  it('stores and retrieves sequence blocks correctly', () => {
    const store = createStore()
    const testBlocks: SequenceBlock[] = [
      {
        id: 'block1',
        type: 'loop',
        label: 'Test Loop',
        children: ['node1', 'node2']
      }
    ]

    store.set(sequenceBlocksAtom, testBlocks)
    expect(store.get(sequenceBlocksAtom)).toEqual(testBlocks)
  })
})

describe('Mermaid Code Atom', () => {
  it('returns empty string when no nodes exist', () => {
    const store = createStore()
    
    expect(store.get(mermaidCodeAtom)).toBe('')
  })

  it('generates flowchart code correctly', () => {
    const store = createStore()
    const flowchartNodes: FlowchartNode[] = [
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

    const flowchartEdges: Edge[] = [
      {
        id: 'A-B',
        source: 'A',
        target: 'B',
        type: 'flowchart',
        data: { style: 'solid', hasArrow: true }
      }
    ]

    store.set(diagramTypeAtom, 'flowchart')
    store.set(nodesAtom, flowchartNodes)
    store.set(edgesAtom, flowchartEdges)

    const mermaidCode = store.get(mermaidCodeAtom)
    
    expect(mermaidCode).toContain('graph TD')
    expect(mermaidCode).toContain('A[Start]')
    expect(mermaidCode).toContain('B((End))')
    expect(mermaidCode).toContain('A --> B')
  })

  it('generates sequence diagram code correctly', () => {
    const store = createStore()
    const sequenceNodes: SequenceNode[] = [
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

    const sequenceEdges: Edge[] = [
      {
        id: 'msg1',
        source: 'Alice',
        target: 'Bob',
        type: 'sequence',
        data: { messageType: 'solid', label: 'Hello' }
      }
    ]

    store.set(diagramTypeAtom, 'sequence')
    store.set(nodesAtom, sequenceNodes)
    store.set(edgesAtom, sequenceEdges)

    const mermaidCode = store.get(mermaidCodeAtom)
    
    expect(mermaidCode).toContain('sequenceDiagram')
    expect(mermaidCode).toContain('participant Alice')
    expect(mermaidCode).toContain('actor Bob')
    expect(mermaidCode).toContain('Alice->Bob: Hello')
  })

  it('respects flowchart direction setting', () => {
    const store = createStore()
    const nodes: FlowchartNode[] = [
      {
        id: 'A',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Node A', shape: 'rectangle' }
      }
    ]

    store.set(diagramTypeAtom, 'flowchart')
    store.set(flowchartDirectionAtom, 'LR')
    store.set(nodesAtom, nodes)

    const mermaidCode = store.get(mermaidCodeAtom)
    
    expect(mermaidCode).toContain('graph LR')
  })

  it('includes sequence blocks in sequence diagram', () => {
    const store = createStore()
    const nodes: SequenceNode[] = [
      {
        id: 'A',
        type: 'sequence',
        position: { x: 0, y: 0 },
        data: { label: 'A', type: 'participant' }
      }
    ]

    const blocks: SequenceBlock[] = [
      {
        id: 'loop1',
        type: 'loop',
        label: 'while condition',
        children: ['A']
      }
    ]

    store.set(diagramTypeAtom, 'sequence')
    store.set(nodesAtom, nodes)
    store.set(sequenceBlocksAtom, blocks)

    const mermaidCode = store.get(mermaidCodeAtom)
    
    expect(mermaidCode).toContain('sequenceDiagram')
    expect(mermaidCode).toContain('loop while condition')
    expect(mermaidCode).toContain('end')
  })

  it('defaults to flowchart for unknown diagram types', () => {
    const store = createStore()
    const nodes: FlowchartNode[] = [
      {
        id: 'A',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Node A', shape: 'rectangle' }
      }
    ]

    // Set an invalid diagram type (will fall through to default)
    store.set(diagramTypeAtom, 'flowchart')
    store.set(nodesAtom, nodes)

    const mermaidCode = store.get(mermaidCodeAtom)
    
    expect(mermaidCode).toContain('graph TD')
    expect(mermaidCode).toContain('A[Node A]')
  })

  it('handles all diagram types correctly', () => {
    const store = createStore()
    
    // Test each diagram type generates some output
    const diagramTypes = ['flowchart', 'sequence', 'class', 'er', 'state'] as const
    
    diagramTypes.forEach(type => {
      store.set(diagramTypeAtom, type)
      
      // Create appropriate node structure for each type
      let testNode: any
      switch (type) {
        case 'flowchart':
          testNode = {
            id: 'test',
            type: 'flowchart',
            position: { x: 0, y: 0 },
            data: { label: 'Test', shape: 'rectangle' }
          }
          break
        case 'sequence':
          testNode = {
            id: 'test',
            type: 'sequence',
            position: { x: 0, y: 0 },
            data: { label: 'Test', type: 'participant' }
          }
          break
        case 'class':
          testNode = {
            id: 'test',
            type: 'class',
            position: { x: 0, y: 0 },
            data: { label: 'Test', attributes: [], methods: [] }
          }
          break
        case 'er':
          testNode = {
            id: 'test',
            type: 'er',
            position: { x: 0, y: 0 },
            data: { label: 'Test', attributes: [] }
          }
          break
        case 'state':
          testNode = {
            id: 'test',
            type: 'state',
            position: { x: 0, y: 0 },
            data: { label: 'Test', type: 'state', isComposite: false }
          }
          break
      }
      
      store.set(nodesAtom, [testNode])
      
      const mermaidCode = store.get(mermaidCodeAtom)
      expect(mermaidCode.length).toBeGreaterThan(0)
      
      // Each diagram type should have its specific header
      switch (type) {
        case 'flowchart':
          expect(mermaidCode).toContain('graph')
          break
        case 'sequence':
          expect(mermaidCode).toContain('sequenceDiagram')
          break
        case 'class':
          expect(mermaidCode).toContain('classDiagram')
          break
        case 'er':
          expect(mermaidCode).toContain('erDiagram')
          break
        case 'state':
          expect(mermaidCode).toContain('stateDiagram-v2')
          break
      }
    })
  })

  it('recomputes when nodes change', () => {
    const store = createStore()
    
    store.set(diagramTypeAtom, 'flowchart')
    store.set(nodesAtom, [])
    
    expect(store.get(mermaidCodeAtom)).toBe('')
    
    const nodes: FlowchartNode[] = [
      {
        id: 'A',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Node A', shape: 'rectangle' }
      }
    ]
    
    store.set(nodesAtom, nodes)
    
    const mermaidCode = store.get(mermaidCodeAtom)
    expect(mermaidCode).toContain('A[Node A]')
  })

  it('recomputes when edges change', () => {
    const store = createStore()
    
    const nodes: FlowchartNode[] = [
      {
        id: 'A',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'A', shape: 'rectangle' }
      },
      {
        id: 'B',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'B', shape: 'rectangle' }
      }
    ]
    
    store.set(diagramTypeAtom, 'flowchart')
    store.set(nodesAtom, nodes)
    store.set(edgesAtom, [])
    
    let mermaidCode = store.get(mermaidCodeAtom)
    expect(mermaidCode).not.toContain('A --> B')
    
    const edges: Edge[] = [
      {
        id: 'A-B',
        source: 'A',
        target: 'B',
        type: 'flowchart'
      }
    ]
    
    store.set(edgesAtom, edges)
    
    mermaidCode = store.get(mermaidCodeAtom)
    expect(mermaidCode).toContain('A --> B')
  })

  it('recomputes when diagram type changes', () => {
    const store = createStore()
    
    const nodes = [
      {
        id: 'A',
        type: 'test',
        position: { x: 0, y: 0 },
        data: { label: 'A' }
      }
    ]
    
    store.set(nodesAtom, nodes)
    
    store.set(diagramTypeAtom, 'flowchart')
    let mermaidCode = store.get(mermaidCodeAtom)
    expect(mermaidCode).toContain('graph')
    
    store.set(diagramTypeAtom, 'sequence')
    mermaidCode = store.get(mermaidCodeAtom)
    expect(mermaidCode).toContain('sequenceDiagram')
  })
})