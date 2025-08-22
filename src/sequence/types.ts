// Enums for arrow types
export enum ArrowType {
  SOLID = '->',
  DOTTED = '-->',
  SOLID_ARROW = '->>',
  DOTTED_ARROW = '-->>',
  SOLID_CROSS = '-x',
  DOTTED_CROSS = '--x',
  SOLID_ASYNC = '-)',
  DOTTED_ASYNC = '--)'
}

// Enum for note positions
export enum NotePosition {
  LEFT = 'left of',
  RIGHT = 'right of',
  OVER = 'over'
}

// Participant in sequence diagram
export interface SequenceParticipant {
  id: string
  type: 'participant' | 'actor'
  label: string
  alias?: string
  order: number
  x?: number // GUI position
}

// Message between participants
export interface SequenceMessage {
  id: string
  from: string // participant id
  to: string // participant id
  type: ArrowType
  label: string
  activate?: boolean
  deactivate?: boolean
  sequenceNumber?: number
}

// Note in sequence diagram
export interface SequenceNote {
  id: string
  position: NotePosition
  target: string | string[] // participant id(s)
  text: string
}

// Loop block
export interface SequenceLoop {
  id: string
  label: string
  messages: string[] // message ids contained in loop
}

// Activation bar for a participant
export interface SequenceActivation {
  participant: string // participant id
  startIndex: number // message index where activation starts
  endIndex: number // message index where activation ends
}

// Complete state of sequence diagram
export interface SequenceState {
  participants: SequenceParticipant[]
  messages: SequenceMessage[]
  notes: SequenceNote[]
  loops: SequenceLoop[]
  activations: SequenceActivation[]
}

// Parse result interface similar to flowchart
export interface SequenceMermaidParseResult {
  participants: SequenceParticipant[]
  messages: SequenceMessage[]
  notes: SequenceNote[]
  loops: SequenceLoop[]
  activations: SequenceActivation[]
  error?: string
}