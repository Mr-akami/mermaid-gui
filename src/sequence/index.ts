// Public exports for the sequence module

// Re-export types
export type {
  IRSequenceParticipant,
  IRSequenceMessage,
  IRSequenceNote,
  IRSequenceLoop,
  IRSequenceActivation,
  IRSequenceState,
  IRSequenceMermaidParseResult
} from './core/types'

// Re-export enums
export { ArrowType, NotePosition } from './core/types'

// Re-export atoms
export {
  participantsAtom,
  messagesAtom,
  notesAtom,
  loopsAtom,
  activationsAtom,
  sequenceStateAtom,
  sequenceMermaidCodeAtom,
  addParticipantAtom,
  updateParticipantAtom,
  removeParticipantAtom,
  addMessageAtom,
  updateMessageAtom,
  removeMessageAtom,
  addNoteAtom,
  updateNoteAtom,
  removeNoteAtom,
  addLoopAtom,
  updateLoopAtom,
  removeLoopAtom,
  syncRawCodeToSequenceAtom,
  syncSequenceToRawCodeAtom,
  placementModeAtom
} from './atoms'

// Future exports will include:
// - SequenceEditor component
// - parseSequenceDiagram function
// - buildSequenceCode function