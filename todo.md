# Sequence Diagram Implementation Todo

## Phase 1: Core Infrastructure Setup

### 1.1 Create Basic Directory Structure
- [ ] Create `src/sequence/` directory
- [ ] Create `src/sequence/components/` directory
- [ ] Create `src/sequence/editor/` directory
- [ ] Create `src/sequence/core/` directory
- [ ] Create `src/sequence/core/builders/` directory
- [ ] Create `src/sequence/core/code-parser/` directory

### 1.2 Create Type Definitions
- [ ] Write test for participant interface structure
- [ ] Create `src/sequence/types.ts` with participant, message, and state interfaces
- [ ] Write test for ArrowType enum values
- [ ] Define ArrowType enum for all message arrow types
- [ ] Write test for BlockType enum values
- [ ] Define BlockType enum for control flow blocks
- [ ] Write test for NotePosition enum values
- [ ] Define NotePosition enum for note positioning

### 1.3 Create Initial Atoms
- [ ] Write test for participantsAtom initial state
- [ ] Create `src/sequence/atoms.ts` with participantsAtom
- [ ] Write test for messagesAtom initial state
- [ ] Add messagesAtom for message storage
- [ ] Write test for notesAtom initial state
- [ ] Add notesAtom for note storage
- [ ] Write test for sequenceMermaidCodeAtom initial state
- [ ] Add sequenceMermaidCodeAtom for generated code

### 1.4 Create Export Files
- [ ] Write test for public exports availability
- [ ] Create `src/sequence/index.ts` with public exports
- [ ] Write test for dependency imports
- [ ] Create `src/sequence/deps.ts` for external dependencies

## Phase 2: Parser Implementation

### 2.1 Basic Parser Structure
- [ ] Write test for parseSequenceDiagram with empty input
- [ ] Create `src/sequence/core/code-parser/sequenceParser.ts`
- [ ] Write test for parseSequenceDiagram with basic sequence
- [ ] Implement parseSequenceDiagram main function
- [ ] Write test for participant detection regex
- [ ] Add participant detection regex patterns
- [ ] Write test for message arrow detection regex
- [ ] Add message arrow detection regex patterns

### 2.2 Participant Parsing
- [ ] Write test for parsing "participant A"
- [ ] Implement parseParticipant function for explicit participants
- [ ] Write test for parsing "actor B"
- [ ] Implement parseActor function for actor declarations
- [ ] Write test for parsing "participant A as Alice"
- [ ] Add alias support parsing
- [ ] Write test for implicit participant from "A->>B: msg"
- [ ] Handle implicit participant creation from messages

### 2.3 Message Parsing
- [ ] Write test for parsing "A->>B: Hello"
- [ ] Implement parseMessage function for basic arrows
- [ ] Write test for each arrow type (->>, -->, -x, etc.)
- [ ] Add support for all arrow types (->>, -->, -x, etc.)
- [ ] Write test for message label extraction
- [ ] Parse message labels
- [ ] Write test for "+/-" activation markers
- [ ] Extract activation/deactivation markers (+/-)

### 2.4 Note Parsing
- [ ] Write test for "Note right of A: text"
- [ ] Implement parseNote function
- [ ] Write test for all positions (right/left/over)
- [ ] Support right/left/over positioning
- [ ] Write test for "Note over A,B: text"
- [ ] Handle multi-participant notes (over A,B)

### 2.5 Loop Parsing
- [ ] Write test for "loop label...end" block
- [ ] Implement parseLoop function for basic loops
- [ ] Write test for loop label extraction
- [ ] Extract loop labels and body content

## Phase 3: Builder Implementation

### 3.1 Basic Builder Structure
- [ ] Write test for buildSequenceCode with empty state
- [ ] Create `src/sequence/core/builders/sequenceCodeBuilder.ts`
- [ ] Write test for buildSequenceCode with participants only
- [ ] Implement buildSequenceCode main function
- [ ] Write test for participant ordering
- [ ] Add participant ordering logic

### 3.2 Participant Generation
- [ ] Write test for buildParticipant with basic participant
- [ ] Implement buildParticipant function
- [ ] Write test for participant vs actor type output
- [ ] Support participant vs actor types
- [ ] Write test for alias generation
- [ ] Handle aliases in output

### 3.3 Message Generation
- [ ] Write test for buildMessage with simple arrow
- [ ] Implement buildMessage function
- [ ] Write test for each arrow type generation
- [ ] Generate correct arrow syntax based on type
- [ ] Write test for activation/deactivation suffixes
- [ ] Include activation/deactivation suffixes
- [ ] Write test for message label inclusion
- [ ] Add message labels

### 3.4 Note Generation
- [ ] Write test for buildNote with right position
- [ ] Implement buildNote function
- [ ] Write test for all positioning syntax
- [ ] Generate correct positioning syntax
- [ ] Write test for multi-participant note generation
- [ ] Handle multi-participant notes

### 3.5 Loop Generation
- [ ] Write test for buildLoop with single message
- [ ] Implement buildLoop function
- [ ] Write test for wrapping multiple messages
- [ ] Wrap message sequences correctly
- [ ] Write test for proper indentation
- [ ] Maintain proper indentation

## Phase 4: React Components

### 4.1 Participant Component
- [ ] Write test for SequenceParticipant rendering
- [ ] Create `src/sequence/components/SequenceParticipant.tsx`
- [ ] Write test for drag functionality
- [ ] Implement draggable participant box
- [ ] Write test for actor variant rendering
- [ ] Add actor stick figure variant
- [ ] Write test for label and alias display
- [ ] Display labels and aliases

### 4.2 Message Component
- [ ] Write test for SequenceMessage rendering
- [ ] Create `src/sequence/components/SequenceMessage.tsx`
- [ ] Write test for solid vs dotted line styles
- [ ] Implement different arrow styles (solid/dotted)
- [ ] Write test for arrowhead variations
- [ ] Add arrowhead variations
- [ ] Write test for message label rendering
- [ ] Support message labels

### 4.3 Note Component
- [ ] Write test for SequenceNote rendering
- [ ] Create `src/sequence/components/SequenceNote.tsx`
- [ ] Write test for note box styling
- [ ] Implement note box styling
- [ ] Write test for position variations
- [ ] Support different positions (left/right/over)
- [ ] Write test for text editing
- [ ] Add text editing capability

### 4.4 Activation Component
- [ ] Write test for SequenceActivation rendering
- [ ] Create `src/sequence/components/SequenceActivation.tsx`
- [ ] Write test for activation bar display
- [ ] Implement vertical activation bars
- [ ] Write test for nested activation stacking
- [ ] Support nested activations
- [ ] Write test for message alignment
- [ ] Align with message positions

## Phase 5: Editor Components

### 5.1 Main Editor
- [ ] Write test for SequenceEditor rendering
- [ ] Create `src/sequence/editor/SequenceEditor.tsx`
- [ ] Write test for React Flow integration
- [ ] Set up React Flow with custom node/edge types
- [ ] Write test for participant lane layout
- [ ] Implement participant lane layout
- [ ] Write test for message ordering
- [ ] Add message chronological ordering

### 5.2 Toolbar
- [ ] Write test for SequenceToolbar rendering
- [ ] Create `src/sequence/editor/SequenceToolbar.tsx`
- [ ] Write test for participant type button clicks
- [ ] Add participant type buttons (box/actor)
- [ ] Write test for message type selection
- [ ] Add message type selector
- [ ] Write test for note and loop button clicks
- [ ] Add note and loop buttons

### 5.3 Property Panel
- [ ] Write test for SequencePropertyPanel rendering
- [ ] Create `src/sequence/editor/SequencePropertyPanel.tsx`
- [ ] Write test for participant property updates
- [ ] Implement participant property editing
- [ ] Write test for message property updates
- [ ] Add message property editing
- [ ] Write test for note text updates
- [ ] Support note text editing

## Phase 6: Data Synchronization

### 6.1 Sync Atoms
- [ ] Write test for syncRawCodeToSequenceAtom parsing
- [ ] Create syncRawCodeToSequenceAtom in `src/sequence/atoms.ts`
- [ ] Write test for syncSequenceToRawCodeAtom generation
- [ ] Create syncSequenceToRawCodeAtom
- [ ] Write test for sync loop prevention
- [ ] Add sync loop prevention flags

### 6.2 Editor Integration
- [ ] Write test for sequence case in EditorContainer
- [ ] Update `src/editor/common/EditorContainer.tsx` to include sequence case
- [ ] Write test for SequenceEditor lazy loading
- [ ] Add lazy loading for SequenceEditor
- [ ] Write test for 'sequence' diagram type
- [ ] Update diagramType to support 'sequence'

### 6.3 Connect Parser and Builder
- [ ] Write test for parser integration
- [ ] Wire parser to syncRawCodeToSequenceAtom
- [ ] Write test for builder integration
- [ ] Wire builder to sequenceMermaidCodeAtom
- [ ] Write integration test for bidirectional sync
- [ ] Test bidirectional sync

## Phase 7: Layout Engine

### 7.1 Participant Layout
- [ ] Write test for horizontal distribution algorithm
- [ ] Implement horizontal participant distribution
- [ ] Write test for fixed Y position constraint
- [ ] Fix participants at top of canvas
- [ ] Write test for lifeline position calculation
- [ ] Calculate lifeline positions

### 7.2 Message Layout
- [ ] Write test for chronological ordering
- [ ] Implement chronological message ordering
- [ ] Write test for Y position calculation
- [ ] Calculate Y positions based on sequence
- [ ] Write test for message spacing logic
- [ ] Handle message spacing

### 7.3 Activation Layout
- [ ] Write test for activation bar positioning
- [ ] Calculate activation bar positions
- [ ] Write test for nested activation stacking
- [ ] Handle nested activation stacking
- [ ] Write test for message endpoint alignment
- [ ] Align with message endpoints

### 7.4 Note Layout
- [ ] Write test for note relative positioning
- [ ] Position notes relative to participants
- [ ] Write test for lifeline overlap avoidance
- [ ] Avoid lifeline overlaps
- [ ] Write test for multi-participant spanning
- [ ] Handle over-participant spanning

## Phase 8: End-to-End Testing

### 8.1 Parser Integration Tests
- [ ] Create `src/sequence/core/code-parser/sequenceParser.integration.test.ts`
- [ ] Test complete sequence diagram parsing
- [ ] Test participant ordering preservation
- [ ] Test message sequence preservation
- [ ] Test nested block structures
- [ ] Test error handling for invalid syntax

### 8.2 Builder Integration Tests
- [ ] Create `src/sequence/core/builders/sequenceCodeBuilder.integration.test.ts`
- [ ] Test complete diagram generation
- [ ] Test round-trip (parse → build → parse)
- [ ] Test complex nested structures
- [ ] Test edge case handling

### 8.3 Component Integration Tests
- [ ] Create `src/sequence/editor/SequenceEditor.test.tsx`
- [ ] Test drag and drop interactions
- [ ] Test connection creation
- [ ] Test property panel updates
- [ ] Test toolbar actions

### 8.4 System Integration Tests
- [ ] Test full editor with sequence diagrams
- [ ] Test switching between diagram types
- [ ] Test sync loop prevention under load
- [ ] Test performance with large diagrams

## Phase 9: Advanced Features (Future)

### 9.1 Control Flow Blocks
- [ ] Write test for alt/else block parsing
- [ ] Implement alt/else blocks
- [ ] Write test for opt block parsing
- [ ] Add opt blocks
- [ ] Write test for par/and parallel blocks
- [ ] Support par/and parallel blocks
- [ ] Write test for critical region parsing
- [ ] Add critical regions

### 9.2 Advanced Messages
- [ ] Write test for bidirectional arrow parsing
- [ ] Support bidirectional arrows (<<->>)
- [ ] Write test for async message types
- [ ] Add async message types (-))
- [ ] Write test for create/destroy lifecycle
- [ ] Implement create/destroy participant

### 9.3 Visual Enhancements
- [ ] Write test for rect background parsing
- [ ] Add background highlighting (rect)
- [ ] Write test for box grouping
- [ ] Implement participant grouping (box)
- [ ] Write test for autonumber feature
- [ ] Add sequence numbering
- [ ] Write test for link parsing
- [ ] Support participant links/menus

## Implementation Order

1. **Start with Phase 1-3**: Core infrastructure, types, parser, and builder
2. **Then Phase 4-5**: React components and editors
3. **Then Phase 6-7**: Data sync and layout
4. **Finally Phase 8**: Testing
5. **Future: Phase 9**: Advanced features

## Notes for Sub-agents

- Each checkbox item is an independent task
- Complete tasks in order within each phase
- Parser and builder can be developed in parallel after types are defined
- React components can be developed independently after types are defined
- Always check existing flowchart implementation for patterns to follow
- Maintain consistency with existing architecture patterns