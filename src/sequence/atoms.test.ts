import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'jotai'
import {
  participantsAtom,
  messagesAtom,
  notesAtom,
  loopsAtom,
  activationsAtom,
  sequenceStateAtom,
  sequenceMermaidCodeAtom,
  addParticipantAtom,
  addMessageAtom,
  addNoteAtom,
  addLoopAtom,
  updateParticipantAtom,
  updateMessageAtom,
  updateNoteAtom,
  updateLoopAtom,
  removeParticipantAtom,
  removeMessageAtom,
  removeNoteAtom,
  removeLoopAtom
} from './atoms'
import { ArrowType, NotePosition, type IRSequenceParticipant, type IRSequenceMessage, type IRSequenceNote, type IRSequenceLoop } from './core/types'

describe('sequence atoms', () => {
  let store = createStore()

  beforeEach(() => {
    store = createStore()
  })

  describe('base atoms', () => {
    it('should initialize with empty arrays', () => {
      expect(store.get(participantsAtom)).toEqual([])
      expect(store.get(messagesAtom)).toEqual([])
      expect(store.get(notesAtom)).toEqual([])
      expect(store.get(loopsAtom)).toEqual([])
      expect(store.get(activationsAtom)).toEqual([])
    })

    it('should provide combined sequence state', () => {
      const state = store.get(sequenceStateAtom)
      
      expect(state).toEqual({
        participants: [],
        messages: [],
        notes: [],
        loops: [],
        activations: []
      })
    })
  })

  describe('participant operations', () => {
    it('should add participant', () => {
      const participant: IRSequenceParticipant = {
        id: 'A',
        type: 'participant',
        label: 'Alice',
        order: 0
      }

      store.set(addParticipantAtom, participant)
      const participants = store.get(participantsAtom)

      expect(participants).toHaveLength(1)
      expect(participants[0]).toEqual(participant)
    })

    it('should update participant', () => {
      const participant: IRSequenceParticipant = {
        id: 'A',
        type: 'participant',
        label: 'Alice',
        order: 0
      }

      store.set(addParticipantAtom, participant)
      
      const updatedParticipant: IRSequenceParticipant = {
        ...participant,
        label: 'Alice Updated'
      }

      store.set(updateParticipantAtom, updatedParticipant)
      const participants = store.get(participantsAtom)

      expect(participants[0].label).toBe('Alice Updated')
    })

    it('should remove participant', () => {
      const participant: IRSequenceParticipant = {
        id: 'A',
        type: 'participant',
        label: 'Alice',
        order: 0
      }

      store.set(addParticipantAtom, participant)
      expect(store.get(participantsAtom)).toHaveLength(1)

      store.set(removeParticipantAtom, 'A')
      expect(store.get(participantsAtom)).toHaveLength(0)
    })
  })

  describe('message operations', () => {
    it('should add message', () => {
      const message: IRSequenceMessage = {
        id: 'msg1',
        from: 'A',
        to: 'B',
        type: ArrowType.SOLID,
        label: 'Hello'
      }

      store.set(addMessageAtom, message)
      const messages = store.get(messagesAtom)

      expect(messages).toHaveLength(1)
      expect(messages[0]).toEqual(message)
    })

    it('should update message', () => {
      const message: IRSequenceMessage = {
        id: 'msg1',
        from: 'A',
        to: 'B',
        type: ArrowType.SOLID,
        label: 'Hello'
      }

      store.set(addMessageAtom, message)
      
      const updatedMessage: IRSequenceMessage = {
        ...message,
        label: 'Hello Updated'
      }

      store.set(updateMessageAtom, updatedMessage)
      const messages = store.get(messagesAtom)

      expect(messages[0].label).toBe('Hello Updated')
    })

    it('should remove message', () => {
      const message: IRSequenceMessage = {
        id: 'msg1',
        from: 'A',
        to: 'B',
        type: ArrowType.SOLID,
        label: 'Hello'
      }

      store.set(addMessageAtom, message)
      expect(store.get(messagesAtom)).toHaveLength(1)

      store.set(removeMessageAtom, 'msg1')
      expect(store.get(messagesAtom)).toHaveLength(0)
    })
  })

  describe('note operations', () => {
    it('should add note', () => {
      const note: IRSequenceNote = {
        id: 'note1',
        position: NotePosition.RIGHT,
        target: 'A',
        text: 'Note text'
      }

      store.set(addNoteAtom, note)
      const notes = store.get(notesAtom)

      expect(notes).toHaveLength(1)
      expect(notes[0]).toEqual(note)
    })

    it('should update note', () => {
      const note: IRSequenceNote = {
        id: 'note1',
        position: NotePosition.RIGHT,
        target: 'A',
        text: 'Note text'
      }

      store.set(addNoteAtom, note)
      
      const updatedNote: IRSequenceNote = {
        ...note,
        text: 'Updated note text'
      }

      store.set(updateNoteAtom, updatedNote)
      const notes = store.get(notesAtom)

      expect(notes[0].text).toBe('Updated note text')
    })

    it('should remove note', () => {
      const note: IRSequenceNote = {
        id: 'note1',
        position: NotePosition.RIGHT,
        target: 'A',
        text: 'Note text'
      }

      store.set(addNoteAtom, note)
      expect(store.get(notesAtom)).toHaveLength(1)

      store.set(removeNoteAtom, 'note1')
      expect(store.get(notesAtom)).toHaveLength(0)
    })
  })

  describe('loop operations', () => {
    it('should add loop', () => {
      const loop: IRSequenceLoop = {
        id: 'loop1',
        label: 'Every minute',
        messages: ['msg1']
      }

      store.set(addLoopAtom, loop)
      const loops = store.get(loopsAtom)

      expect(loops).toHaveLength(1)
      expect(loops[0]).toEqual(loop)
    })

    it('should update loop', () => {
      const loop: IRSequenceLoop = {
        id: 'loop1',
        label: 'Every minute',
        messages: ['msg1']
      }

      store.set(addLoopAtom, loop)
      
      const updatedLoop: IRSequenceLoop = {
        ...loop,
        label: 'Every hour'
      }

      store.set(updateLoopAtom, updatedLoop)
      const loops = store.get(loopsAtom)

      expect(loops[0].label).toBe('Every hour')
    })

    it('should remove loop', () => {
      const loop: IRSequenceLoop = {
        id: 'loop1',
        label: 'Every minute',
        messages: ['msg1']
      }

      store.set(addLoopAtom, loop)
      expect(store.get(loopsAtom)).toHaveLength(1)

      store.set(removeLoopAtom, 'loop1')
      expect(store.get(loopsAtom)).toHaveLength(0)
    })
  })

  describe('sequenceMermaidCodeAtom', () => {
    it('should generate basic mermaid code', () => {
      // Add participants
      store.set(addParticipantAtom, {
        id: 'A',
        type: 'participant',
        label: 'Alice',
        order: 0
      })
      
      store.set(addParticipantAtom, {
        id: 'B',
        type: 'participant',
        label: 'Bob',
        order: 1
      })

      // Add message
      store.set(addMessageAtom, {
        id: 'msg1',
        from: 'A',
        to: 'B',
        type: ArrowType.SOLID_ARROW,
        label: 'Hello Bob!'
      })

      const mermaidCode = store.get(sequenceMermaidCodeAtom)
      
      expect(mermaidCode).toContain('sequenceDiagram')
      expect(mermaidCode).toContain('participant A as Alice')
      expect(mermaidCode).toContain('participant B as Bob')
      expect(mermaidCode).toContain('A->>B: Hello Bob!')
    })

    it('should handle empty state', () => {
      const mermaidCode = store.get(sequenceMermaidCodeAtom)
      
      expect(mermaidCode).toBe('sequenceDiagram\n')
    })
  })
})