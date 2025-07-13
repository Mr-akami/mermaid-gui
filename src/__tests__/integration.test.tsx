import { describe, it, expect, vi } from 'vitest'
import { createStore } from 'jotai'
import { nodesAtom, edgesAtom, mermaidCodeAtom } from '../store/flowStore'
import { diagramTypeAtom, diagramTypeClearEffectAtom } from '../store/diagramStore'
import { pushToHistoryAtom, undoAtom, redoAtom } from '../store/historyStore'
import { generateFlowchartCode, generateSequenceCode, generateClassCode } from '../utils/mermaidGenerators'

// Mock clipboard
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined)
}
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  configurable: true
})

describe('Integration Tests', () => {
  describe('Complete Workflow - Flowchart', () => {
    it('creates flowchart diagram and generates correct mermaid code', () => {
      const store = createStore()
      
      // Initialize history
      store.set(nodesAtom, [])
      store.set(edgesAtom, [])
      store.set(pushToHistoryAtom)
      
      // Step 1: Set diagram type to flowchart
      store.set(diagramTypeAtom, 'flowchart')
      
      // Step 2: Add nodes
      const nodeA = {
        id: 'A',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Start', shape: 'rectangle' }
      }
      
      const nodeB = {
        id: 'B', 
        type: 'flowchart',
        position: { x: 100, y: 100 },
        data: { label: 'Process', shape: 'rhombus' }
      }
      
      const nodeC = {
        id: 'C',
        type: 'flowchart', 
        position: { x: 200, y: 200 },
        data: { label: 'End', shape: 'circle' }
      }
      
      store.set(nodesAtom, [nodeA])
      store.set(pushToHistoryAtom)
      
      store.set(nodesAtom, [nodeA, nodeB])
      store.set(pushToHistoryAtom)
      
      store.set(nodesAtom, [nodeA, nodeB, nodeC])
      store.set(pushToHistoryAtom)
      
      // Step 3: Add edges
      const edgeAB = {
        id: 'A-B',
        source: 'A',
        target: 'B',
        type: 'flowchart',
        data: { style: 'solid', hasArrow: true, label: 'yes' }
      }
      
      const edgeBC = {
        id: 'B-C',
        source: 'B', 
        target: 'C',
        type: 'flowchart',
        data: { style: 'dotted', hasArrow: true }
      }
      
      store.set(edgesAtom, [edgeAB])
      store.set(pushToHistoryAtom)
      
      store.set(edgesAtom, [edgeAB, edgeBC])
      store.set(pushToHistoryAtom)
      
      // Step 4: Verify mermaid code generation
      const nodes = store.get(nodesAtom)
      const edges = store.get(edgesAtom)
      const diagramType = store.get(diagramTypeAtom)
      
      expect(nodes).toHaveLength(3)
      expect(edges).toHaveLength(2)
      expect(diagramType).toBe('flowchart')
      
      // Generate mermaid code
      const mermaidCode = generateFlowchartCode(nodes, edges, 'TD')
      
      expect(mermaidCode).toContain('graph TD')
      expect(mermaidCode).toContain('A[Start]')
      expect(mermaidCode).toContain('B{Process}')
      expect(mermaidCode).toContain('C((End))')
      expect(mermaidCode).toContain('A -->|yes| B')
      expect(mermaidCode).toContain('B -.-> C')
      
      // Step 5: Test undo/redo functionality
      expect(store.get(undoAtom)).toBe(true) // Can undo
      expect(store.get(redoAtom)).toBe(false) // Cannot redo
      
      // Undo last action (adding second edge)
      store.set(undoAtom)
      expect(store.get(edgesAtom)).toHaveLength(1)
      expect(store.get(redoAtom)).toBe(true) // Can redo now
      
      // Undo adding first edge
      store.set(undoAtom)
      expect(store.get(edgesAtom)).toHaveLength(0)
      
      // Undo adding third node
      store.set(undoAtom)
      expect(store.get(nodesAtom)).toHaveLength(2)
      
      // Redo operations
      store.set(redoAtom) // Add third node back
      expect(store.get(nodesAtom)).toHaveLength(3)
      
      store.set(redoAtom) // Add first edge back
      expect(store.get(edgesAtom)).toHaveLength(1)
      
      store.set(redoAtom) // Add second edge back
      expect(store.get(edgesAtom)).toHaveLength(2)
    })
  })

  describe('Complete Workflow - Sequence Diagram', () => {
    it('creates sequence diagram and generates correct mermaid code', () => {
      const store = createStore()
      
      // Initialize
      store.set(nodesAtom, [])
      store.set(edgesAtom, [])
      store.set(pushToHistoryAtom)
      
      // Step 1: Set diagram type to sequence
      store.set(diagramTypeAtom, 'sequence')
      
      // Step 2: Add participants
      const alice = {
        id: 'Alice',
        type: 'sequence',
        position: { x: 0, y: 0 },
        data: { label: 'Alice', type: 'actor' as const }
      }
      
      const bob = {
        id: 'Bob',
        type: 'sequence',
        position: { x: 100, y: 0 },
        data: { label: 'Bob', type: 'participant' as const }
      }
      
      const charlie = {
        id: 'Charlie',
        type: 'sequence',
        position: { x: 200, y: 0 },
        data: { label: 'Charlie', type: 'participant' as const }
      }
      
      store.set(nodesAtom, [alice, bob, charlie])
      store.set(pushToHistoryAtom)
      
      // Step 3: Add messages
      const message1 = {
        id: 'msg1',
        source: 'Alice',
        target: 'Bob',
        type: 'sequence',
        data: { messageType: 'solid' as const, label: 'Hello Bob' }
      }
      
      const message2 = {
        id: 'msg2',
        source: 'Bob',
        target: 'Charlie',
        type: 'sequence',
        data: { messageType: 'dotted' as const, label: 'Forward to Charlie' }
      }
      
      const message3 = {
        id: 'msg3',
        source: 'Charlie',
        target: 'Alice',
        type: 'sequence',
        data: { messageType: 'solidArrow' as const, label: 'Response' }
      }
      
      store.set(edgesAtom, [message1, message2, message3])
      store.set(pushToHistoryAtom)
      
      // Step 4: Verify mermaid code generation
      const nodes = store.get(nodesAtom)
      const edges = store.get(edgesAtom)
      const diagramType = store.get(diagramTypeAtom)
      
      expect(nodes).toHaveLength(3)
      expect(edges).toHaveLength(3)
      expect(diagramType).toBe('sequence')
      
      // Generate mermaid code
      const mermaidCode = generateSequenceCode(nodes, edges, [])
      
      expect(mermaidCode).toContain('sequenceDiagram')
      expect(mermaidCode).toContain('actor Alice')
      expect(mermaidCode).toContain('participant Bob')
      expect(mermaidCode).toContain('participant Charlie')
      expect(mermaidCode).toContain('Alice->Bob: Hello Bob')
      expect(mermaidCode).toContain('Bob-->>Charlie: Forward to Charlie')
      expect(mermaidCode).toContain('Charlie->>Alice: Response')
    })
  })

  describe('Diagram Type Switching', () => {
    it('clears canvas when switching diagram types', () => {
      const store = createStore()
      
      // Start with flowchart
      store.set(diagramTypeAtom, 'flowchart')
      
      const flowchartNodes = [
        {
          id: 'node1',
          type: 'flowchart',
          position: { x: 0, y: 0 },
          data: { label: 'Flowchart Node', shape: 'rectangle' }
        }
      ]
      
      const flowchartEdges = [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2'
        }
      ]
      
      store.set(nodesAtom, flowchartNodes)
      store.set(edgesAtom, flowchartEdges)
      
      expect(store.get(nodesAtom)).toHaveLength(1)
      expect(store.get(edgesAtom)).toHaveLength(1)
      
      // Switch to sequence diagram - should clear canvas
      store.set(diagramTypeAtom, 'sequence')
      
      // Canvas should still have content if we only set diagram type directly
      expect(store.get(nodesAtom)).toHaveLength(1)
      expect(store.get(edgesAtom)).toHaveLength(1)
      
      // But using the clear effect atom should clear the canvas
      store.set(diagramTypeClearEffectAtom, 'class')
      
      expect(store.get(nodesAtom)).toHaveLength(0)
      expect(store.get(edgesAtom)).toHaveLength(0)
      expect(store.get(diagramTypeAtom)).toBe('class')
    })
  })

  describe('History Edge Cases', () => {
    it('handles complex undo/redo scenarios', () => {
      const store = createStore()
      
      // Initialize
      store.set(nodesAtom, [])
      store.set(pushToHistoryAtom)
      
      // Build up complex history
      const states = [
        // State 1: Add node A
        [{ id: 'A', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'A', shape: 'rectangle' } }],
        // State 2: Add node B
        [
          { id: 'A', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'A', shape: 'rectangle' } },
          { id: 'B', type: 'flowchart', position: { x: 100, y: 0 }, data: { label: 'B', shape: 'rectangle' } }
        ],
        // State 3: Add node C
        [
          { id: 'A', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'A', shape: 'rectangle' } },
          { id: 'B', type: 'flowchart', position: { x: 100, y: 0 }, data: { label: 'B', shape: 'rectangle' } },
          { id: 'C', type: 'flowchart', position: { x: 200, y: 0 }, data: { label: 'C', shape: 'rectangle' } }
        ]
      ]
      
      states.forEach(state => {
        store.set(nodesAtom, state)
        store.set(pushToHistoryAtom)
      })
      
      // Verify final state
      expect(store.get(nodesAtom)).toHaveLength(3)
      
      // Undo to state 2
      store.set(undoAtom)
      expect(store.get(nodesAtom)).toHaveLength(2)
      expect(store.get(undoAtom)).toBe(true) // Can still undo
      expect(store.get(redoAtom)).toBe(true) // Can redo
      
      // Undo to state 1
      store.set(undoAtom)
      expect(store.get(nodesAtom)).toHaveLength(1)
      
      // Undo to initial state
      store.set(undoAtom)
      expect(store.get(nodesAtom)).toHaveLength(0)
      expect(store.get(undoAtom)).toBe(false) // Cannot undo further
      
      // Make a new change - this should clear redo history
      const newNode = { id: 'NEW', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'New', shape: 'rectangle' } }
      store.set(nodesAtom, [newNode])
      store.set(pushToHistoryAtom)
      
      expect(store.get(redoAtom)).toBe(false) // Redo history cleared
      expect(store.get(undoAtom)).toBe(true) // Can undo the new change
      
      // Verify the new branch
      store.set(undoAtom)
      expect(store.get(nodesAtom)).toHaveLength(0)
    })
  })

  describe('Mermaid Code Generation Integration', () => {
    it('generates correct code for complex diagrams', () => {
      const store = createStore()
      
      // Class diagram with inheritance
      store.set(diagramTypeAtom, 'class')
      
      const classNodes = [
        {
          id: 'Animal',
          type: 'class',
          position: { x: 0, y: 0 },
          data: {
            label: 'Animal',
            attributes: [
              { name: 'name', type: 'string', visibility: '+', isStatic: false, isAbstract: false },
              { name: 'age', type: 'int', visibility: '-', isStatic: false, isAbstract: false }
            ],
            methods: [
              { name: 'makeSound', parameters: [], returnType: 'void', visibility: '+', isStatic: false, isAbstract: true }
            ]
          }
        },
        {
          id: 'Dog',
          type: 'class',
          position: { x: 100, y: 100 },
          data: {
            label: 'Dog',
            attributes: [
              { name: 'breed', type: 'string', visibility: '+', isStatic: false, isAbstract: false }
            ],
            methods: [
              { name: 'makeSound', parameters: [], returnType: 'void', visibility: '+', isStatic: false, isAbstract: false },
              { name: 'bark', parameters: [], returnType: 'void', visibility: '+', isStatic: false, isAbstract: false }
            ]
          }
        }
      ]
      
      const classEdges = [
        {
          id: 'inheritance',
          source: 'Dog',
          target: 'Animal',
          type: 'class',
          data: { relationType: 'inheritance' }
        }
      ]
      
      store.set(nodesAtom, classNodes)
      store.set(edgesAtom, classEdges)
      
      // Verify through direct generation
      const mermaidCode = generateClassCode(classNodes, classEdges)
      
      expect(mermaidCode).toContain('classDiagram')
      expect(mermaidCode).toContain('class Animal {')
      expect(mermaidCode).toContain('+string name')
      expect(mermaidCode).toContain('-int age')
      expect(mermaidCode).toContain('+makeSound() void*')
      expect(mermaidCode).toContain('class Dog {')
      expect(mermaidCode).toContain('+string breed')
      expect(mermaidCode).toContain('+makeSound() void')
      expect(mermaidCode).toContain('+bark() void')
      expect(mermaidCode).toContain('Dog <|-- Animal')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles empty states gracefully', () => {
      const store = createStore()
      
      // Empty diagram should not crash
      expect(store.get(nodesAtom)).toEqual([])
      expect(store.get(edgesAtom)).toEqual([])
      
      // Mermaid code generation with empty state
      expect(store.get(mermaidCodeAtom)).toBe('')
      
      // History operations on empty state
      expect(store.get(undoAtom)).toBe(false)
      expect(store.get(redoAtom)).toBe(false)
      
      // Attempting undo/redo on empty state
      store.set(undoAtom) // Should do nothing
      store.set(redoAtom) // Should do nothing
      
      expect(store.get(nodesAtom)).toEqual([])
      expect(store.get(edgesAtom)).toEqual([])
    })

    it('handles invalid node data gracefully', () => {
      const store = createStore()
      
      // Node with minimal required data
      const minimalNode = {
        id: 'minimal',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Minimal' } // Missing shape, should use default
      }
      
      store.set(diagramTypeAtom, 'flowchart')
      store.set(nodesAtom, [minimalNode])
      
      // Should not crash and should generate code
      const mermaidCode = store.get(mermaidCodeAtom)
      
      expect(mermaidCode).toContain('graph TD')
      expect(mermaidCode).toContain('minimal[Minimal]') // Should use default rectangle shape
    })
  })
})