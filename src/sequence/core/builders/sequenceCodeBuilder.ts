import { SequenceState, SequenceParticipant, SequenceNote, SequenceLoop } from '../../types'

/**
 * Builds Mermaid sequence diagram code from sequence state
 */
export function buildSequenceCode(state: SequenceState): string {
  const lines: string[] = ['sequenceDiagram']

  // Generate participants first (sorted by order)
  const sortedParticipants = [...state.participants].sort((a, b) => a.order - b.order)
  for (const participant of sortedParticipants) {
    lines.push(generateParticipant(participant))
  }

  // Generate messages with activations and loops
  generateMessagesWithActivationsAndLoops(state, lines)

  // Generate notes last
  for (const note of state.notes) {
    lines.push(generateNote(note))
  }

  return lines.join('\n') + '\n'
}

/**
 * Generates participant line
 */
function generateParticipant(participant: SequenceParticipant): string {
  const participantType = participant.type === 'actor' ? 'actor' : 'participant'
  
  // Use alias if provided, otherwise use label if different from id
  if (participant.alias) {
    return `    ${participantType} ${participant.id} as ${participant.alias}`
  } else if (participant.label !== participant.id) {
    return `    ${participantType} ${participant.id} as ${participant.label}`
  } else {
    return `    ${participantType} ${participant.id}`
  }
}



/**
 * Generates note line
 */
function generateNote(note: SequenceNote): string {
  let targets: string
  if (Array.isArray(note.target)) {
    targets = note.target.join(',')
  } else {
    targets = note.target
  }
  
  return `    Note ${note.position} ${targets}: ${note.text}`
}

/**
 * Generates messages with proper activation and loop placement
 */
function generateMessagesWithActivationsAndLoops(state: SequenceState, lines: string[]): void {
  const messages = state.messages
  const activations = state.activations
  const loops = state.loops

  // Track which messages are in loops
  const messageInLoop = new Map<string, SequenceLoop>()
  for (const loop of loops) {
    for (const messageId of loop.messages) {
      messageInLoop.set(messageId, loop)
    }
  }

  // Track active loops
  const activeLoops = new Set<string>()

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]

    // Check if we need to start a loop before this message
    const loop = messageInLoop.get(message.id)
    if (loop && !activeLoops.has(loop.id)) {
      lines.push(`    loop ${loop.label}`)
      activeLoops.add(loop.id)
    }

    // Generate the message
    const messageIsInLoop = messageInLoop.has(message.id)
    const indent = messageIsInLoop ? '        ' : '    '
    lines.push(`${indent}${message.from}${message.type}${message.to}: ${message.label}`)

    // Check if we need to start any activations after this message
    for (const activation of activations) {
      if (activation.startIndex === i) {
        lines.push(`    activate ${activation.participant}`)
      }
    }

    // Check if we need to end a loop after this message
    if (loop) {
      // Check if this is the last message in the loop
      const isLastMessageInLoop = loop.messages.every(msgId => {
        const msgIndex = messages.findIndex(m => m.id === msgId)
        return msgIndex <= i
      })
      
      if (isLastMessageInLoop) {
        lines.push(`    end`)
        activeLoops.delete(loop.id)
      }
    }

    // Check if we need to end any activations after this message
    for (const activation of activations) {
      if (activation.endIndex === i) {
        lines.push(`    deactivate ${activation.participant}`)
      }
    }
  }
}