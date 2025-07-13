import { describe, it, expect } from 'vitest'
import {
  generateFlowchartCode,
  generateSequenceCode,
  generateClassCode,
  generateERCode,
  generateStateCode,
} from '../mermaidGenerators'
import {
  FlowchartNode,
  SequenceNode,
  ClassNode,
  ERNode,
  StateNode,
  FlowchartEdge,
  SequenceEdge,
  ClassEdge,
  EREdge,
  StateEdge,
} from '../../types/diagram'

describe('Flowchart Generator', () => {
  it('generates basic flowchart with default direction', () => {
    const nodes: FlowchartNode[] = [
      {
        id: 'A',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Start', shape: 'rectangle' },
      },
      {
        id: 'B',
        type: 'flowchart',
        position: { x: 100, y: 100 },
        data: { label: 'Process', shape: 'roundedRectangle' },
      },
    ]

    const edges: FlowchartEdge[] = [
      {
        id: 'A-B',
        source: 'A',
        target: 'B',
        type: 'flowchart',
        data: { style: 'solid', hasArrow: true },
      },
    ]

    const result = generateFlowchartCode(nodes, edges)
    
    expect(result).toContain('graph TD')
    expect(result).toContain('A[Start]')
    expect(result).toContain('B(Process)')
    expect(result).toContain('A --> B')
  })

  it('generates flowchart with custom direction', () => {
    const nodes: FlowchartNode[] = [
      {
        id: 'A',
        type: 'flowchart',
        position: { x: 0, y: 0 },
        data: { label: 'Start', shape: 'rectangle' },
      },
    ]

    const result = generateFlowchartCode(nodes, [], 'LR')
    
    expect(result).toContain('graph LR')
  })

  it('generates different node shapes correctly', () => {
    const nodes: FlowchartNode[] = [
      { id: 'rect', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Rectangle', shape: 'rectangle' } },
      { id: 'round', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Round', shape: 'roundedRectangle' } },
      { id: 'stadium', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Stadium', shape: 'stadium' } },
      { id: 'sub', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Sub', shape: 'subroutine' } },
      { id: 'cyl', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Cylinder', shape: 'cylindrical' } },
      { id: 'circle', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Circle', shape: 'circle' } },
      { id: 'asym', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Asymmetric', shape: 'asymmetric' } },
      { id: 'rhombus', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Diamond', shape: 'rhombus' } },
      { id: 'hex', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Hexagon', shape: 'hexagon' } },
      { id: 'para', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Parallel', shape: 'parallelogram' } },
      { id: 'trap', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Trapezoid', shape: 'trapezoid' } },
      { id: 'double', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'Double', shape: 'doubleCircle' } },
    ]

    const result = generateFlowchartCode(nodes, [])
    
    expect(result).toContain('rect[Rectangle]')
    expect(result).toContain('round(Round)')
    expect(result).toContain('stadium([Stadium])')
    expect(result).toContain('sub[[Sub]]')
    expect(result).toContain('cyl[(Cylinder)]')
    expect(result).toContain('circle((Circle))')
    expect(result).toContain('asym>>Asymmetric]')
    expect(result).toContain('rhombus{Diamond}')
    expect(result).toContain('hex{{Hexagon}}')
    expect(result).toContain('para[/Parallel/]')
    expect(result).toContain('trap[\\Trapezoid/]')
    expect(result).toContain('double(((Double)))')
  })

  it('generates different edge styles correctly', () => {
    const nodes: FlowchartNode[] = [
      { id: 'A', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'A', shape: 'rectangle' } },
      { id: 'B', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'B', shape: 'rectangle' } },
      { id: 'C', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'C', shape: 'rectangle' } },
      { id: 'D', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'D', shape: 'rectangle' } },
    ]

    const edges: FlowchartEdge[] = [
      { id: 'A-B', source: 'A', target: 'B', type: 'flowchart', data: { style: 'solid', hasArrow: true } },
      { id: 'A-C', source: 'A', target: 'C', type: 'flowchart', data: { style: 'dotted', hasArrow: true } },
      { id: 'A-D', source: 'A', target: 'D', type: 'flowchart', data: { style: 'thick', hasArrow: false } },
    ]

    const result = generateFlowchartCode(nodes, edges)
    
    expect(result).toContain('A --> B')
    expect(result).toContain('A -.-> C')
    expect(result).toContain('A === D')
  })

  it('generates edge labels correctly', () => {
    const nodes: FlowchartNode[] = [
      { id: 'A', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'A', shape: 'rectangle' } },
      { id: 'B', type: 'flowchart', position: { x: 0, y: 0 }, data: { label: 'B', shape: 'rectangle' } },
    ]

    const edges: FlowchartEdge[] = [
      { 
        id: 'A-B', 
        source: 'A', 
        target: 'B', 
        type: 'flowchart', 
        data: { style: 'solid', hasArrow: true, label: 'success' } 
      },
    ]

    const result = generateFlowchartCode(nodes, edges)
    
    expect(result).toContain('A -->|success| B')
  })
})

describe('Sequence Diagram Generator', () => {
  it('generates basic sequence diagram', () => {
    const nodes: SequenceNode[] = [
      {
        id: 'Alice',
        type: 'sequence',
        position: { x: 0, y: 0 },
        data: { label: 'Alice', type: 'participant' },
      },
      {
        id: 'Bob',
        type: 'sequence',
        position: { x: 100, y: 0 },
        data: { label: 'Bob', type: 'participant' },
      },
    ]

    const edges: SequenceEdge[] = [
      {
        id: 'msg1',
        source: 'Alice',
        target: 'Bob',
        type: 'sequence',
        data: { messageType: 'solid', label: 'Hello Bob' },
      },
    ]

    const result = generateSequenceCode(nodes, edges)
    
    expect(result).toContain('sequenceDiagram')
    expect(result).toContain('participant Alice')
    expect(result).toContain('participant Bob')
    expect(result).toContain('Alice->Bob: Hello Bob')
  })

  it('generates actor and participant types correctly', () => {
    const nodes: SequenceNode[] = [
      {
        id: 'User',
        type: 'sequence',
        position: { x: 0, y: 0 },
        data: { label: 'User', type: 'actor' },
      },
      {
        id: 'System',
        type: 'sequence',
        position: { x: 100, y: 0 },
        data: { label: 'System', type: 'participant' },
      },
    ]

    const result = generateSequenceCode(nodes, [])
    
    expect(result).toContain('actor User')
    expect(result).toContain('participant System')
  })

  it('generates different message types correctly', () => {
    const nodes: SequenceNode[] = [
      { id: 'A', type: 'sequence', position: { x: 0, y: 0 }, data: { label: 'A', type: 'participant' } },
      { id: 'B', type: 'sequence', position: { x: 0, y: 0 }, data: { label: 'B', type: 'participant' } },
    ]

    const edges: SequenceEdge[] = [
      { id: '1', source: 'A', target: 'B', type: 'sequence', data: { messageType: 'solid', label: 'solid' } },
      { id: '2', source: 'A', target: 'B', type: 'sequence', data: { messageType: 'dotted', label: 'dotted' } },
      { id: '3', source: 'A', target: 'B', type: 'sequence', data: { messageType: 'solidArrow', label: 'solidArrow' } },
      { id: '4', source: 'A', target: 'B', type: 'sequence', data: { messageType: 'cross', label: 'cross' } },
      { id: '5', source: 'A', target: 'B', type: 'sequence', data: { messageType: 'async', label: 'async' } },
    ]

    const result = generateSequenceCode(nodes, edges)
    
    expect(result).toContain('A->B: solid')
    expect(result).toContain('A-->>B: dotted')
    expect(result).toContain('A->>B: solidArrow')
    expect(result).toContain('A-xB: cross')
    expect(result).toContain('A-)B: async')
  })
})

describe('Class Diagram Generator', () => {
  it('generates basic class diagram', () => {
    const nodes: ClassNode[] = [
      {
        id: 'User',
        type: 'class',
        position: { x: 0, y: 0 },
        data: {
          label: 'User',
          attributes: [
            { name: 'name', type: 'string', visibility: '+', isStatic: false, isAbstract: false },
            { name: 'email', type: 'string', visibility: '-', isStatic: false, isAbstract: false },
          ],
          methods: [
            { 
              name: 'getName', 
              parameters: [], 
              returnType: 'string', 
              visibility: '+', 
              isStatic: false, 
              isAbstract: false 
            },
          ],
        },
      },
    ]

    const result = generateClassCode(nodes, [])
    
    expect(result).toContain('classDiagram')
    expect(result).toContain('class User {')
    expect(result).toContain('+string name')
    expect(result).toContain('-string email')
    expect(result).toContain('+getName() string')
  })

  it('generates class relationships correctly', () => {
    const nodes: ClassNode[] = [
      { 
        id: 'Animal', 
        type: 'class', 
        position: { x: 0, y: 0 }, 
        data: { label: 'Animal', attributes: [], methods: [] } 
      },
      { 
        id: 'Dog', 
        type: 'class', 
        position: { x: 0, y: 0 }, 
        data: { label: 'Dog', attributes: [], methods: [] } 
      },
    ]

    const edges: ClassEdge[] = [
      {
        id: 'inheritance',
        source: 'Dog',
        target: 'Animal',
        type: 'class',
        data: { relationType: 'inheritance' },
      },
    ]

    const result = generateClassCode(nodes, edges)
    
    expect(result).toContain('Dog <|-- Animal')
  })
})

describe('ER Diagram Generator', () => {
  it('generates basic ER diagram', () => {
    const nodes: ERNode[] = [
      {
        id: 'User',
        type: 'er',
        position: { x: 0, y: 0 },
        data: {
          label: 'User',
          attributes: [
            { name: 'id', type: 'int', isPrimaryKey: true, isForeignKey: false, isUnique: false, isNullable: false },
            { name: 'name', type: 'varchar', isPrimaryKey: false, isForeignKey: false, isUnique: false, isNullable: false },
          ],
        },
      },
    ]

    const result = generateERCode(nodes, [])
    
    expect(result).toContain('erDiagram')
    expect(result).toContain('User {')
    expect(result).toContain('int id PK')
    expect(result).toContain('varchar name')
  })

  it('generates ER relationships correctly', () => {
    const nodes: ERNode[] = [
      { 
        id: 'User', 
        type: 'er', 
        position: { x: 0, y: 0 }, 
        data: { label: 'User', attributes: [] } 
      },
      { 
        id: 'Order', 
        type: 'er', 
        position: { x: 0, y: 0 }, 
        data: { label: 'Order', attributes: [] } 
      },
    ]

    const edges: EREdge[] = [
      {
        id: 'user-order',
        source: 'User',
        target: 'Order',
        type: 'er',
        data: {
          relationshipType: 'identifying',
          sourceCardinality: '1..1',
          targetCardinality: '1..*',
          label: 'places',
        },
      },
    ]

    const result = generateERCode(nodes, edges)
    
    expect(result).toContain('User ||--}| Order : "places"')
  })
})

describe('State Diagram Generator', () => {
  it('generates basic state diagram', () => {
    const nodes: StateNode[] = [
      {
        id: 'start',
        type: 'state',
        position: { x: 0, y: 0 },
        data: { label: 'Start', type: 'start', isComposite: false },
      },
      {
        id: 'idle',
        type: 'state',
        position: { x: 100, y: 0 },
        data: { label: 'Idle', type: 'state', isComposite: false },
      },
      {
        id: 'end',
        type: 'state',
        position: { x: 200, y: 0 },
        data: { label: 'End', type: 'end', isComposite: false },
      },
    ]

    const edges: StateEdge[] = [
      {
        id: 'start-idle',
        source: 'start',
        target: 'idle',
        type: 'state',
        data: { transitionType: 'normal', label: 'initialize' },
      },
      {
        id: 'idle-end',
        source: 'idle',
        target: 'end',
        type: 'state',
        data: { transitionType: 'normal', label: 'complete' },
      },
    ]

    const result = generateStateCode(nodes, edges)
    
    expect(result).toContain('stateDiagram-v2')
    expect(result).toContain('idle : Idle')
    expect(result).toContain('[*] --> idle : initialize')
    expect(result).toContain('idle --> [*] : complete')
  })

  it('generates special state types correctly', () => {
    const nodes: StateNode[] = [
      { 
        id: 'choice1', 
        type: 'state', 
        position: { x: 0, y: 0 }, 
        data: { label: 'Choice', type: 'choice', isComposite: false } 
      },
      { 
        id: 'fork1', 
        type: 'state', 
        position: { x: 0, y: 0 }, 
        data: { label: 'Fork', type: 'fork', isComposite: false } 
      },
      { 
        id: 'join1', 
        type: 'state', 
        position: { x: 0, y: 0 }, 
        data: { label: 'Join', type: 'join', isComposite: false } 
      },
    ]

    const result = generateStateCode(nodes, [])
    
    expect(result).toContain('state choice1 <<choice>>')
    expect(result).toContain('state fork1 <<fork>>')
    expect(result).toContain('state join1 <<join>>')
  })
})