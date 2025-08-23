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

// Participant in sequence diagram (Intermediate Representation)
export interface IRSequenceParticipant {
  id: string
  type: 'participant' | 'actor'
  label: string
  alias?: string
  order: number
  x?: number // GUI position
}

// Message between participants (Intermediate Representation)
export interface IRSequenceMessage {
  id: string
  from: string // participant id
  to: string // participant id
  type: ArrowType
  label: string
  activate?: boolean
  deactivate?: boolean
  sequenceNumber?: number
}

// Note in sequence diagram (Intermediate Representation)
export interface IRSequenceNote {
  id: string
  position: NotePosition
  target: string | string[] // participant id(s)
  text: string
}

// Loop block (Intermediate Representation)
export interface IRSequenceLoop {
  id: string
  label: string
  messages: string[] // message ids contained in loop
}

// Activation bar for a participant (Intermediate Representation)
export interface IRSequenceActivation {
  participant: string // participant id
  startIndex: number // message index where activation starts
  endIndex: number // message index where activation ends
}

// Complete state of sequence diagram (Intermediate Representation)
export interface IRSequenceState {
  participants: IRSequenceParticipant[]
  messages: IRSequenceMessage[]
  notes: IRSequenceNote[]
  loops: IRSequenceLoop[]
  activations: IRSequenceActivation[]
}

// Parse result interface similar to flowchart (Intermediate Representation)
export interface IRSequenceMermaidParseResult {
  participants: IRSequenceParticipant[]
  messages: IRSequenceMessage[]
  notes: IRSequenceNote[]
  loops: IRSequenceLoop[]
  activations: IRSequenceActivation[]
  error?: string
}