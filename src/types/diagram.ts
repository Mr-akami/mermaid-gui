import { Node } from 'reactflow'

// Common types
export interface DiagramNode extends Node {
  data: {
    label: string
    [key: string]: any
  }
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  type?: string
  data?: {
    label?: string
    [key: string]: any
  }
  [key: string]: any
}

// Sequence Diagram Types
export interface SequenceNode extends DiagramNode {
  data: {
    label: string
    type: 'participant' | 'actor'
    alias?: string
  }
}

export interface SequenceEdge extends DiagramEdge {
  data: {
    label?: string
    messageType: 'solid' | 'dotted' | 'solidArrow' | 'dottedArrow' | 'cross' | 'async'
    activate?: boolean
    deactivate?: boolean
  }
}

export interface SequenceBlock {
  id: string
  type: 'loop' | 'alt' | 'opt' | 'par' | 'critical' | 'rect'
  label: string
  color?: string
  children: string[]  // node ids
}

// Class Diagram Types
export interface ClassAttribute {
  name: string
  type: string
  visibility: '+' | '-' | '#' | '~'
  isStatic?: boolean
  isAbstract?: boolean
}

export interface ClassMethod {
  name: string
  parameters: string[]
  returnType?: string
  visibility: '+' | '-' | '#' | '~'
  isStatic?: boolean
  isAbstract?: boolean
}

export interface ClassNode extends DiagramNode {
  data: {
    label: string
    stereotype?: 'interface' | 'abstract' | 'enumeration'
    attributes: ClassAttribute[]
    methods: ClassMethod[]
  }
}

export interface ClassEdge extends DiagramEdge {
  data: {
    label?: string
    relationType: 'inheritance' | 'composition' | 'aggregation' | 'association' | 'dependency' | 'realization'
    sourceCardinality?: string
    targetCardinality?: string
  }
}

// State Diagram Types
export interface StateNode extends DiagramNode {
  data: {
    label: string
    type: 'state' | 'start' | 'end' | 'choice' | 'fork' | 'join'
    isComposite?: boolean
    children?: string[]  // for composite states
  }
}

export interface StateEdge extends DiagramEdge {
  data: {
    label?: string
    guard?: string
  }
}

// ER Diagram Types
export interface ERAttribute {
  name: string
  type: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  isUnique?: boolean
  isNullable?: boolean
}

export interface ERNode extends DiagramNode {
  data: {
    label: string
    attributes: ERAttribute[]
  }
}

export interface EREdge extends DiagramEdge {
  data: {
    label?: string
    relationshipType: 'identifying' | 'non-identifying'
    sourceCardinality: '0..1' | '1..1' | '0..*' | '1..*'
    targetCardinality: '0..1' | '1..1' | '0..*' | '1..*'
  }
}

// Flowchart Types
export interface FlowchartNode extends DiagramNode {
  data: {
    label: string
    shape: 'rectangle' | 'roundedRectangle' | 'stadium' | 'subroutine' | 
           'cylindrical' | 'circle' | 'asymmetric' | 'rhombus' | 
           'hexagon' | 'parallelogram' | 'trapezoid' | 'doubleCircle'
  }
}

export interface FlowchartEdge extends DiagramEdge {
  data: {
    label?: string
    style?: 'solid' | 'dotted' | 'thick'
    hasArrow?: boolean // false for no arrow
  }
}