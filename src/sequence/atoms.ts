import { atom } from 'jotai'
import { buildSequenceCode } from './core/builders/sequenceCodeBuilder'
import { parseSequenceCode } from './core/code-parser/sequenceParser'
import { rawCodeAtom, isEditingAtom } from '../editor/atoms'
import type {
  IRSequenceParticipant,
  IRSequenceMessage,
  IRSequenceNote,
  IRSequenceLoop,
  IRSequenceActivation,
  IRSequenceState
} from './core/types'

// Base atoms for storing sequence diagram data
export const participantsAtom = atom<IRSequenceParticipant[]>([])
export const messagesAtom = atom<IRSequenceMessage[]>([])
export const notesAtom = atom<IRSequenceNote[]>([])
export const loopsAtom = atom<IRSequenceLoop[]>([])
export const activationsAtom = atom<IRSequenceActivation[]>([])

// UI state atoms
export const placementModeAtom = atom<'participant' | 'actor' | 'note' | null>(null)

// Edge creation state
export const edgeCreationAtom = atom<{
  sourceNode: string | null
  sourceHandle: string | null
} | null>(null)

// Combined state atom
export const sequenceStateAtom = atom<IRSequenceState>((get) => ({
  participants: get(participantsAtom),
  messages: get(messagesAtom),
  notes: get(notesAtom),
  loops: get(loopsAtom),
  activations: get(activationsAtom)
}))

// Participant operations
export const addParticipantAtom = atom(
  null,
  (get, set, participant: IRSequenceParticipant) => {
    const participants = get(participantsAtom)
    set(participantsAtom, [...participants, participant])
  }
)

export const updateParticipantAtom = atom(
  null,
  (get, set, updatedParticipant: IRSequenceParticipant) => {
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
  (get, set, message: IRSequenceMessage) => {
    const messages = get(messagesAtom)
    set(messagesAtom, [...messages, message])
  }
)

export const updateMessageAtom = atom(
  null,
  (get, set, updatedMessage: IRSequenceMessage) => {
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
  (get, set, note: IRSequenceNote) => {
    const notes = get(notesAtom)
    set(notesAtom, [...notes, note])
  }
)

export const updateNoteAtom = atom(
  null,
  (get, set, updatedNote: IRSequenceNote) => {
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
  (get, set, loop: IRSequenceLoop) => {
    const loops = get(loopsAtom)
    set(loopsAtom, [...loops, loop])
  }
)

export const updateLoopAtom = atom(
  null,
  (get, set, updatedLoop: IRSequenceLoop) => {
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
  return buildSequenceCode(state)
})

// Sync atoms (simplified for now - will be implemented properly later)
export const syncRawCodeToSequenceAtom = atom(
  null,
  (_get, set, rawCode: string) => {
    const result = parseSequenceCode(rawCode)
    
    if (result.error) {
      console.error('Failed to parse sequence code:', result.error)
      return
    }
    
    set(participantsAtom, result.participants)
    set(messagesAtom, result.messages)
    set(notesAtom, result.notes)
    set(loopsAtom, result.loops)
    set(activationsAtom, result.activations)
  }
)

export const syncSequenceToRawCodeAtom = atom(
  null,
  (get, set) => {
    const isEditing = get(isEditingAtom)
    
    // Only sync if user is not editing
    if (isEditing) {
      return
    }
    
    const mermaidCode = get(sequenceMermaidCodeAtom)
    set(rawCodeAtom, mermaidCode)
  }
)