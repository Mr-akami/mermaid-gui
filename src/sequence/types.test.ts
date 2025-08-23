import { describe, it, expect } from 'vitest'
import {
  ArrowType,
  NotePosition,
  type IRSequenceParticipant,
  type IRSequenceMessage,
  type IRSequenceNote,
  type IRSequenceLoop,
  type IRSequenceState,
  type IRSequenceActivation
} from './core/types'

describe('Sequence Diagram Types', () => {
  describe('ArrowType enum', () => {
    it('should have all arrow type values', () => {
      expect(ArrowType.SOLID).toBe('->')
      expect(ArrowType.DOTTED).toBe('-->')
      expect(ArrowType.SOLID_ARROW).toBe('->>')
      expect(ArrowType.DOTTED_ARROW).toBe('-->>')
      expect(ArrowType.SOLID_CROSS).toBe('-x')
      expect(ArrowType.DOTTED_CROSS).toBe('--x')
      expect(ArrowType.SOLID_ASYNC).toBe('-)')
      expect(ArrowType.DOTTED_ASYNC).toBe('--)')
    })
  })

  describe('NotePosition enum', () => {
    it('should have all position values', () => {
      expect(NotePosition.LEFT).toBe('left of')
      expect(NotePosition.RIGHT).toBe('right of')
      expect(NotePosition.OVER).toBe('over')
    })
  })

  describe('SequenceParticipant interface', () => {
    it('should create a valid participant', () => {
      const participant: IRSequenceParticipant = {
        id: 'p1',
        type: 'participant',
        label: 'Alice',
        order: 0,
        x: 100
      }
      
      expect(participant.id).toBe('p1')
      expect(participant.type).toBe('participant')
      expect(participant.label).toBe('Alice')
      expect(participant.order).toBe(0)
      expect(participant.x).toBe(100)
    })

    it('should create an actor with alias', () => {
      const actor: IRSequenceParticipant = {
        id: 'a1',
        type: 'actor',
        label: 'A',
        alias: 'Alice',
        order: 1
      }
      
      expect(actor.type).toBe('actor')
      expect(actor.alias).toBe('Alice')
    })
  })

  describe('SequenceMessage interface', () => {
    it('should create a valid message', () => {
      const message: IRSequenceMessage = {
        id: 'm1',
        from: 'p1',
        to: 'p2',
        type: ArrowType.SOLID_ARROW,
        label: 'Hello',
        sequenceNumber: 1
      }
      
      expect(message.from).toBe('p1')
      expect(message.to).toBe('p2')
      expect(message.type).toBe('->>')
      expect(message.label).toBe('Hello')
    })

    it('should support activation markers', () => {
      const message: IRSequenceMessage = {
        id: 'm2',
        from: 'p1',
        to: 'p2',
        type: ArrowType.SOLID_ARROW,
        label: 'Activate',
        activate: true,
        deactivate: false
      }
      
      expect(message.activate).toBe(true)
      expect(message.deactivate).toBe(false)
    })
  })

  describe('SequenceNote interface', () => {
    it('should create a note for single participant', () => {
      const note: IRSequenceNote = {
        id: 'n1',
        position: NotePosition.RIGHT,
        target: 'p1',
        text: 'This is a note'
      }
      
      expect(note.position).toBe('right of')
      expect(note.target).toBe('p1')
    })

    it('should create a note over multiple participants', () => {
      const note: IRSequenceNote = {
        id: 'n2',
        position: NotePosition.OVER,
        target: ['p1', 'p2'],
        text: 'Spanning note'
      }
      
      expect(note.position).toBe('over')
      expect(note.target).toEqual(['p1', 'p2'])
    })
  })

  describe('SequenceLoop interface', () => {
    it('should create a valid loop', () => {
      const loop: IRSequenceLoop = {
        id: 'l1',
        label: 'Every minute',
        messages: ['m1', 'm2', 'm3']
      }
      
      expect(loop.label).toBe('Every minute')
      expect(loop.messages).toHaveLength(3)
    })
  })

  describe('SequenceActivation interface', () => {
    it('should create a valid activation', () => {
      const activation: IRSequenceActivation = {
        participant: 'p1',
        startIndex: 2,
        endIndex: 5
      }
      
      expect(activation.participant).toBe('p1')
      expect(activation.startIndex).toBe(2)
      expect(activation.endIndex).toBe(5)
    })
  })

  describe('SequenceState interface', () => {
    it('should create a valid complete state', () => {
      const state: IRSequenceState = {
        participants: [
          { id: 'p1', type: 'participant', label: 'Alice', order: 0 },
          { id: 'p2', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'p1', to: 'p2', type: ArrowType.SOLID_ARROW, label: 'Hello' }
        ],
        notes: [
          { id: 'n1', position: NotePosition.RIGHT, target: 'p1', text: 'Note' }
        ],
        loops: [
          { id: 'l1', label: 'Loop', messages: ['m1'] }
        ],
        activations: [
          { participant: 'p2', startIndex: 0, endIndex: 1 }
        ]
      }
      
      expect(state.participants).toHaveLength(2)
      expect(state.messages).toHaveLength(1)
      expect(state.notes).toHaveLength(1)
      expect(state.loops).toHaveLength(1)
      expect(state.activations).toHaveLength(1)
    })
  })
})