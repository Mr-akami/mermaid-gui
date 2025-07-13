import { describe, it, expect } from 'vitest'
import { createStore } from 'jotai'
import { 
  diagramTypeAtom, 
  flowchartDirectionAtom, 
  diagramTypeClearEffectAtom,
  diagramTypes,
  type DiagramType,
  type FlowchartDirection
} from '../diagramStore'
import { nodesAtom, edgesAtom } from '../flowStore'

describe('Diagram Store Atoms', () => {
  it('initializes with default values', () => {
    const store = createStore()
    
    expect(store.get(diagramTypeAtom)).toBe('flowchart')
    expect(store.get(flowchartDirectionAtom)).toBe('TD')
  })

  it('stores and retrieves diagram type correctly', () => {
    const store = createStore()
    
    store.set(diagramTypeAtom, 'sequence')
    expect(store.get(diagramTypeAtom)).toBe('sequence')
    
    store.set(diagramTypeAtom, 'class')
    expect(store.get(diagramTypeAtom)).toBe('class')
    
    store.set(diagramTypeAtom, 'er')
    expect(store.get(diagramTypeAtom)).toBe('er')
    
    store.set(diagramTypeAtom, 'state')
    expect(store.get(diagramTypeAtom)).toBe('state')
  })

  it('stores and retrieves flowchart direction correctly', () => {
    const store = createStore()
    
    const directions: FlowchartDirection[] = ['TB', 'TD', 'BT', 'LR', 'RL']
    
    directions.forEach(direction => {
      store.set(flowchartDirectionAtom, direction)
      expect(store.get(flowchartDirectionAtom)).toBe(direction)
    })
  })

  it('has correct diagram types configuration', () => {
    expect(diagramTypes).toHaveLength(5)
    
    const expectedTypes = [
      { value: 'flowchart', label: 'Flowchart', icon: '📊' },
      { value: 'sequence', label: 'Sequence', icon: '🔄' },
      { value: 'class', label: 'Class', icon: '📦' },
      { value: 'er', label: 'Entity Relationship', icon: '🗂️' },
      { value: 'state', label: 'State', icon: '🔲' },
    ]
    
    expectedTypes.forEach((expected, index) => {
      expect(diagramTypes[index]).toEqual(expected)
    })
  })

  it('validates diagram types are valid', () => {
    const validTypes: DiagramType[] = ['flowchart', 'sequence', 'class', 'er', 'state']
    
    diagramTypes.forEach(diagramType => {
      expect(validTypes).toContain(diagramType.value)
    })
  })
})

describe('Diagram Type Clear Effect Atom', () => {
  it('reads current diagram type', () => {
    const store = createStore()
    
    store.set(diagramTypeAtom, 'sequence')
    expect(store.get(diagramTypeClearEffectAtom)).toBe('sequence')
  })

  it('clears nodes and edges when diagram type changes', () => {
    const store = createStore()
    
    // Set up initial state with nodes and edges
    const initialNodes = [
      {
        id: 'node1',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Test Node' }
      }
    ]
    
    const initialEdges = [
      {
        id: 'edge1',
        source: 'node1',
        target: 'node2'
      }
    ]
    
    store.set(nodesAtom, initialNodes)
    store.set(edgesAtom, initialEdges)
    store.set(diagramTypeAtom, 'flowchart')
    
    // Verify initial state
    expect(store.get(nodesAtom)).toEqual(initialNodes)
    expect(store.get(edgesAtom)).toEqual(initialEdges)
    expect(store.get(diagramTypeAtom)).toBe('flowchart')
    
    // Change diagram type using the effect atom
    store.set(diagramTypeClearEffectAtom, 'sequence')
    
    // Verify nodes and edges are cleared and diagram type is updated
    expect(store.get(nodesAtom)).toEqual([])
    expect(store.get(edgesAtom)).toEqual([])
    expect(store.get(diagramTypeAtom)).toBe('sequence')
  })

  it('clears canvas for each diagram type transition', () => {
    const store = createStore()
    
    const testNodes = [
      {
        id: 'test',
        type: 'test',
        position: { x: 0, y: 0 },
        data: { label: 'Test' }
      }
    ]
    
    const testEdges = [
      {
        id: 'test-edge',
        source: 'test1',
        target: 'test2'
      }
    ]
    
    const diagramTypeSequence: DiagramType[] = ['flowchart', 'sequence', 'class', 'er', 'state']
    
    diagramTypeSequence.forEach(diagramType => {
      // Set up some content
      store.set(nodesAtom, testNodes)
      store.set(edgesAtom, testEdges)
      
      // Change diagram type
      store.set(diagramTypeClearEffectAtom, diagramType)
      
      // Verify canvas is cleared and type is set
      expect(store.get(nodesAtom)).toEqual([])
      expect(store.get(edgesAtom)).toEqual([])
      expect(store.get(diagramTypeAtom)).toBe(diagramType)
    })
  })

  it('preserves diagram type when set directly without clearing', () => {
    const store = createStore()
    
    const testNodes = [
      {
        id: 'node1',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Test Node' }
      }
    ]
    
    store.set(nodesAtom, testNodes)
    store.set(diagramTypeAtom, 'sequence')
    
    // When setting diagram type directly (not through effect atom),
    // nodes should not be cleared
    expect(store.get(nodesAtom)).toEqual(testNodes)
    expect(store.get(diagramTypeAtom)).toBe('sequence')
  })

  it('effect atom returns updated diagram type after change', () => {
    const store = createStore()
    
    expect(store.get(diagramTypeClearEffectAtom)).toBe('flowchart')
    
    store.set(diagramTypeClearEffectAtom, 'class')
    
    expect(store.get(diagramTypeClearEffectAtom)).toBe('class')
    expect(store.get(diagramTypeAtom)).toBe('class')
  })

  it('handles multiple rapid diagram type changes', () => {
    const store = createStore()
    
    // Set up initial content
    const nodes = [{ id: 'test', type: 'test', position: { x: 0, y: 0 }, data: { label: 'Test' } }]
    store.set(nodesAtom, nodes)
    
    // Rapid changes
    store.set(diagramTypeClearEffectAtom, 'sequence')
    expect(store.get(nodesAtom)).toEqual([])
    expect(store.get(diagramTypeAtom)).toBe('sequence')
    
    store.set(nodesAtom, nodes) // Add content again
    store.set(diagramTypeClearEffectAtom, 'class')
    expect(store.get(nodesAtom)).toEqual([])
    expect(store.get(diagramTypeAtom)).toBe('class')
    
    store.set(nodesAtom, nodes) // Add content again
    store.set(diagramTypeClearEffectAtom, 'er')
    expect(store.get(nodesAtom)).toEqual([])
    expect(store.get(diagramTypeAtom)).toBe('er')
  })
})