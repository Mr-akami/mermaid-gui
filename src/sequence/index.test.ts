import { describe, it, expect } from 'vitest'
import * as exports from './index'

describe('sequence module exports', () => {
  it('should export all necessary types', () => {
    // Check type exports exist (will be undefined at runtime but TypeScript will validate)
    expect(exports).toBeDefined()
  })

  it('should export atoms', () => {
    expect(exports.participantsAtom).toBeDefined()
    expect(exports.messagesAtom).toBeDefined()
    expect(exports.notesAtom).toBeDefined()
    expect(exports.loopsAtom).toBeDefined()
    expect(exports.activationsAtom).toBeDefined()
    expect(exports.sequenceStateAtom).toBeDefined()
    expect(exports.sequenceMermaidCodeAtom).toBeDefined()
  })

  it('should export operation atoms', () => {
    expect(exports.addParticipantAtom).toBeDefined()
    expect(exports.updateParticipantAtom).toBeDefined()
    expect(exports.removeParticipantAtom).toBeDefined()
    expect(exports.addMessageAtom).toBeDefined()
    expect(exports.updateMessageAtom).toBeDefined()
    expect(exports.removeMessageAtom).toBeDefined()
  })

  it('should export sync atoms', () => {
    expect(exports.syncRawCodeToSequenceAtom).toBeDefined()
    expect(exports.syncSequenceToRawCodeAtom).toBeDefined()
  })

  it('should export enums', () => {
    expect(exports.ArrowType).toBeDefined()
    expect(exports.NotePosition).toBeDefined()
  })
})