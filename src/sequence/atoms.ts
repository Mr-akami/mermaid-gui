import { atom } from 'jotai'
import type {
  SequenceParticipant,
  SequenceMessage,
  SequenceNote,
  SequenceLoop,
  SequenceActivation,
  SequenceState
} from './types'

// Base atoms for storing sequence diagram data
export const participantsAtom = atom<SequenceParticipant[]>([])
export const messagesAtom = atom<SequenceMessage[]>([])
export const notesAtom = atom<SequenceNote[]>([])
export const loopsAtom = atom<SequenceLoop[]>([])
export const activationsAtom = atom<SequenceActivation[]>([])

// UI state atoms
export const placementModeAtom = atom<'participant' | 'actor' | 'note' | null>(null)

// Edge creation state
export const edgeCreationAtom = atom<{
  sourceNode: string | null
  sourceHandle: string | null
} | null>(null)

// Combined state atom
export const sequenceStateAtom = atom<SequenceState>((get) => ({
  participants: get(participantsAtom),
  messages: get(messagesAtom),
  notes: get(notesAtom),
  loops: get(loopsAtom),
  activations: get(activationsAtom)
}))

// Participant operations
export const addParticipantAtom = atom(
  null,
  (get, set, participant: SequenceParticipant) => {
    const participants = get(participantsAtom)
    set(participantsAtom, [...participants, participant])
  }
)

export const updateParticipantAtom = atom(
  null,
  (get, set, updatedParticipant: SequenceParticipant) => {
    const participants = get(participantsAtom)
    const index = participants.findIndex(p => p.id === updatedParticipant.id)
    if (index !== -1) {
      const newParticipants = [...participants]
      newParticipants[index] = updatedParticipant
      set(participantsAtom, newParticipants)
    }
  }
)

export const removeParticipantAtom = atom(
  null,
  (get, set, participantId: string) => {
    const participants = get(participantsAtom)
    set(participantsAtom, participants.filter(p => p.id !== participantId))
  }
)

// Message operations
export const addMessageAtom = atom(
  null,
  (get, set, message: SequenceMessage) => {
    const messages = get(messagesAtom)
    set(messagesAtom, [...messages, message])
  }
)

export const updateMessageAtom = atom(
  null,
  (get, set, updatedMessage: SequenceMessage) => {
    const messages = get(messagesAtom)
    const index = messages.findIndex(m => m.id === updatedMessage.id)
    if (index !== -1) {
      const newMessages = [...messages]
      newMessages[index] = updatedMessage
      set(messagesAtom, newMessages)
    }
  }
)

export const removeMessageAtom = atom(
  null,
  (get, set, messageId: string) => {
    const messages = get(messagesAtom)
    set(messagesAtom, messages.filter(m => m.id !== messageId))
  }
)

// Note operations
export const addNoteAtom = atom(
  null,
  (get, set, note: SequenceNote) => {
    const notes = get(notesAtom)
    set(notesAtom, [...notes, note])
  }
)

export const updateNoteAtom = atom(
  null,
  (get, set, updatedNote: SequenceNote) => {
    const notes = get(notesAtom)
    const index = notes.findIndex(n => n.id === updatedNote.id)
    if (index !== -1) {
      const newNotes = [...notes]
      newNotes[index] = updatedNote
      set(notesAtom, newNotes)
    }
  }
)

export const removeNoteAtom = atom(
  null,
  (get, set, noteId: string) => {
    const notes = get(notesAtom)
    set(notesAtom, notes.filter(n => n.id !== noteId))
  }
)

// Loop operations
export const addLoopAtom = atom(
  null,
  (get, set, loop: SequenceLoop) => {
    const loops = get(loopsAtom)
    set(loopsAtom, [...loops, loop])
  }
)

export const updateLoopAtom = atom(
  null,
  (get, set, updatedLoop: SequenceLoop) => {
    const loops = get(loopsAtom)
    const index = loops.findIndex(l => l.id === updatedLoop.id)
    if (index !== -1) {
      const newLoops = [...loops]
      newLoops[index] = updatedLoop
      set(loopsAtom, newLoops)
    }
  }
)

export const removeLoopAtom = atom(
  null,
  (get, set, loopId: string) => {
    const loops = get(loopsAtom)
    set(loopsAtom, loops.filter(l => l.id !== loopId))
  }
)

// Mermaid code generation atom (simplified for now)
export const sequenceMermaidCodeAtom = atom<string>((get) => {
  const state = get(sequenceStateAtom)
  
  let code = 'sequenceDiagram\n'
  
  // Add participants
  for (const participant of state.participants.sort((a, b) => a.order - b.order)) {
    code += `    ${participant.type} ${participant.id} as ${participant.label}\n`
  }
  
  // Add messages
  for (const message of state.messages) {
    code += `    ${message.from}${message.type}${message.to}: ${message.label}\n`
  }
  
  // Add notes
  for (const note of state.notes) {
    const target = Array.isArray(note.target) ? note.target.join(',') : note.target
    code += `    Note ${note.position} of ${target}: ${note.text}\n`
  }
  
  // Add loops
  for (const loop of state.loops) {
    code += `    loop ${loop.label}\n`
    // For now, just add a placeholder - will be implemented properly with the builder
    code += `        # Loop content for messages: ${loop.messages.join(', ')}\n`
    code += `    end\n`
  }
  
  return code
})

// Sync atoms (simplified for now - will be implemented properly later)
export const syncRawCodeToSequenceAtom = atom(
  null,
  (_get, _set, rawCode: string) => {
    // TODO: Implement parsing of raw code to sequence state
    console.log('Sync raw code to sequence:', rawCode)
  }
)

export const syncSequenceToRawCodeAtom = atom(
  null,
  (get, _set) => {
    // TODO: Implement syncing sequence state to raw code
    const mermaidCode = get(sequenceMermaidCodeAtom)
    console.log('Sync sequence to raw code:', mermaidCode)
  }
)