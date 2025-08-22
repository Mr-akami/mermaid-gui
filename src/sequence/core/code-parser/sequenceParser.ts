import { nanoid } from 'nanoid'
import {
  ArrowType,
  NotePosition,
  type SequenceParticipant,
  type SequenceMessage,
  type SequenceNote,
  type SequenceLoop,
  type SequenceMermaidParseResult
} from '../../types'

// Regex patterns for parsing sequence diagrams
const PARTICIPANT_PATTERNS = {
  withAlias: /^\s*(?:participant|actor)\s+([A-Za-z][A-Za-z0-9_]*)\s+as\s+(.+)$/,
  withoutAlias: /^\s*(?:participant|actor)\s+([A-Za-z][A-Za-z0-9_]*)$/,
  type: /^\s*(participant|actor)\s+/
}

const MESSAGE_PATTERNS = {
  arrow: /^\s*([A-Za-z][A-Za-z0-9_]*)\s*(-->?>>?|--?>|->?>|--x|-x|--\)|-\))\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/,
  activate: /^\s*activate\s+([A-Za-z][A-Za-z0-9_]*)$/,
  deactivate: /^\s*deactivate\s+([A-Za-z][A-Za-z0-9_]*)$/
}

const NOTE_PATTERNS = {
  single: /^\s*Note\s+(left|right)\s+of\s+([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/,
  over: /^\s*Note\s+over\s+([A-Za-z][A-Za-z0-9_,\s]*)\s*:\s*(.*)$/
}

const LOOP_PATTERNS = {
  start: /^\s*loop\s+(.*)$/,
  end: /^\s*end$/
}

// Arrow type mapping
const ARROW_TYPE_MAP: Record<string, ArrowType> = {
  '->': ArrowType.SOLID,
  '-->': ArrowType.DOTTED,
  '->>': ArrowType.SOLID_ARROW,
  '-->>': ArrowType.DOTTED_ARROW,
  '-x': ArrowType.SOLID_CROSS,
  '--x': ArrowType.DOTTED_CROSS,
  '-)': ArrowType.SOLID_ASYNC,
  '--)': ArrowType.DOTTED_ASYNC
}

interface ParseContext {
  participants: SequenceParticipant[]
  messages: SequenceMessage[]
  notes: SequenceNote[]
  loops: SequenceLoop[]
  currentLoop: SequenceLoop | null
  participantOrder: number
}

export function parseSequenceCode(code: string): SequenceMermaidParseResult {
  try {
    const lines = code.split('\n').map(line => line.trim()).filter(Boolean)
    
    if (lines.length === 0 || !lines[0].includes('sequenceDiagram')) {
      return {
        participants: [],
        messages: [],
        notes: [],
        loops: [],
        activations: [],
        error: 'Invalid sequence diagram format'
      }
    }

    const context: ParseContext = {
      participants: [],
      messages: [],
      notes: [],
      loops: [],
      currentLoop: null,
      participantOrder: 0
    }

    // Skip the first line (sequenceDiagram)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      
      if (tryParseParticipant(line, context)) continue
      if (tryParseMessage(line, context)) continue
      if (tryParseNote(line, context)) continue
      if (tryParseLoop(line, context)) continue
      if (tryParseActivation(line, context)) continue
    }

    return {
      participants: context.participants,
      messages: context.messages,
      notes: context.notes,
      loops: context.loops,
      activations: []
    }
  } catch (error) {
    return {
      participants: [],
      messages: [],
      notes: [],
      loops: [],
      activations: [],
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    }
  }
}

function tryParseParticipant(line: string, context: ParseContext): boolean {
  const typeMatch = line.match(PARTICIPANT_PATTERNS.type)
  if (!typeMatch) return false

  const type = typeMatch[1] as 'participant' | 'actor'

  // Try with alias first
  const withAliasMatch = line.match(PARTICIPANT_PATTERNS.withAlias)
  if (withAliasMatch) {
    const [, id, label] = withAliasMatch
    const participant: SequenceParticipant = {
      id: nanoid(),
      type,
      label,
      alias: id,
      order: context.participantOrder++
    }
    
    // Use alias as the actual id for referencing
    participant.id = id
    context.participants.push(participant)
    return true
  }

  // Try without alias
  const withoutAliasMatch = line.match(PARTICIPANT_PATTERNS.withoutAlias)
  if (withoutAliasMatch) {
    const [, id] = withoutAliasMatch
    const participant: SequenceParticipant = {
      id,
      type,
      label: id,
      order: context.participantOrder++
    }
    context.participants.push(participant)
    return true
  }

  return false
}

function tryParseMessage(line: string, context: ParseContext): boolean {
  const match = line.match(MESSAGE_PATTERNS.arrow)
  if (!match) return false

  const [, from, arrowType, to, label] = match
  
  const messageType = ARROW_TYPE_MAP[arrowType]
  if (!messageType) return false

  // Ensure participants exist (create implicit ones if needed)
  ensureParticipantExists(from, context)
  ensureParticipantExists(to, context)

  const message: SequenceMessage = {
    id: nanoid(),
    from,
    to,
    type: messageType,
    label: label.trim()
  }

  context.messages.push(message)

  // Add to current loop if we're in one
  if (context.currentLoop) {
    context.currentLoop.messages.push(message.id)
  }

  return true
}

function tryParseNote(line: string, context: ParseContext): boolean {
  // Try single participant note
  const singleMatch = line.match(NOTE_PATTERNS.single)
  if (singleMatch) {
    const [, position, target, text] = singleMatch
    const note: SequenceNote = {
      id: nanoid(),
      position: position === 'left' ? NotePosition.LEFT : NotePosition.RIGHT,
      target,
      text: text.trim()
    }
    context.notes.push(note)
    return true
  }

  // Try over note
  const overMatch = line.match(NOTE_PATTERNS.over)
  if (overMatch) {
    const [, targets, text] = overMatch
    const targetList = targets.split(',').map(t => t.trim())
    
    const note: SequenceNote = {
      id: nanoid(),
      position: NotePosition.OVER,
      target: targetList.length === 1 ? targetList[0] : targetList,
      text: text.trim()
    }
    context.notes.push(note)
    return true
  }

  return false
}

function tryParseLoop(line: string, context: ParseContext): boolean {
  // Try loop start
  const startMatch = line.match(LOOP_PATTERNS.start)
  if (startMatch) {
    const [, label] = startMatch
    const loop: SequenceLoop = {
      id: nanoid(),
      label: label.trim(),
      messages: []
    }
    context.currentLoop = loop
    context.loops.push(loop)
    return true
  }

  // Try loop end
  if (line.match(LOOP_PATTERNS.end)) {
    context.currentLoop = null
    return true
  }

  return false
}

function tryParseActivation(line: string, context: ParseContext): boolean {
  // Try activate
  const activateMatch = line.match(MESSAGE_PATTERNS.activate)
  if (activateMatch) {
    const [, participant] = activateMatch
    // Find the last message to this participant and mark it as activating
    const lastMessage = [...context.messages].reverse().find(m => m.to === participant)
    if (lastMessage) {
      lastMessage.activate = true
    }
    return true
  }

  // Try deactivate
  const deactivateMatch = line.match(MESSAGE_PATTERNS.deactivate)
  if (deactivateMatch) {
    const [, participant] = deactivateMatch
    // Find the last message from this participant and mark it as deactivating
    const lastMessage = [...context.messages].reverse().find(m => m.from === participant)
    if (lastMessage) {
      lastMessage.deactivate = true
    }
    return true
  }

  return false
}

function ensureParticipantExists(id: string, context: ParseContext): void {
  const exists = context.participants.some(p => p.id === id)
  if (!exists) {
    const participant: SequenceParticipant = {
      id,
      type: 'participant',
      label: id,
      order: context.participantOrder++
    }
    context.participants.push(participant)
  }
}