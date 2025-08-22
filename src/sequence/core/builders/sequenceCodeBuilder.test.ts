import { describe, test, expect } from 'vitest'
import { buildSequenceCode } from './sequenceCodeBuilder'
import { SequenceState, ArrowType, NotePosition } from '../../types'

describe('sequenceCodeBuilder', () => {
  describe('Basic Builder Structure', () => {
    test('should generate basic sequence diagram for empty state', () => {
      const state: SequenceState = {
        participants: [],
        messages: [],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe('sequenceDiagram\n')
    })

    test('should generate sequence diagram with participants only', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 }
        ],
        messages: [],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe('sequenceDiagram\n    participant A as Alice\n')
    })
  })

  describe('Participant Generation', () => {
    test('should generate participant with alias', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', alias: 'Alice User', order: 0 }
        ],
        messages: [],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe('sequenceDiagram\n    participant A as Alice User\n')
    })

    test('should generate participant without alias', () => {
      const state: SequenceState = {
        participants: [
          { id: 'Alice', type: 'participant', label: 'Alice', order: 0 }
        ],
        messages: [],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe('sequenceDiagram\n    participant Alice\n')
    })

    test('should generate actor type', () => {
      const state: SequenceState = {
        participants: [
          { id: 'B', type: 'actor', label: 'Bob', order: 0 }
        ],
        messages: [],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe('sequenceDiagram\n    actor B as Bob\n')
    })

    test('should maintain correct order based on order field', () => {
      const state: SequenceState = {
        participants: [
          { id: 'C', type: 'participant', label: 'Charlie', order: 2 },
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'actor', label: 'Bob', order: 1 }
        ],
        messages: [],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    actor B as Bob\n' +
        '    participant C as Charlie\n'
      )
    })
  })

  describe('Message Generation', () => {
    test('should generate solid arrow message', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.SOLID, label: 'Hello' }
        ],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    A->B: Hello\n'
      )
    })

    test('should generate dotted arrow message', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.DOTTED, label: 'Hello' }
        ],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    A-->B: Hello\n'
      )
    })

    test('should generate solid arrow with head message', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.SOLID_ARROW, label: 'Hello' }
        ],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    A->>B: Hello\n'
      )
    })

    test('should generate dotted arrow with head message', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.DOTTED_ARROW, label: 'Hello' }
        ],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    A-->>B: Hello\n'
      )
    })

    test('should generate cross arrow messages', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.SOLID_CROSS, label: 'Reject' },
          { id: 'm2', from: 'B', to: 'A', type: ArrowType.DOTTED_CROSS, label: 'Ignore' }
        ],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    A-xB: Reject\n' +
        '    B--xA: Ignore\n'
      )
    })

    test('should generate async arrow messages', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.SOLID_ASYNC, label: 'Async call' },
          { id: 'm2', from: 'B', to: 'A', type: ArrowType.DOTTED_ASYNC, label: 'Async response' }
        ],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    A-)B: Async call\n' +
        '    B--)A: Async response\n'
      )
    })

    test('should handle messages without labels', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.SOLID_ARROW, label: '' }
        ],
        notes: [],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    A->>B: \n'
      )
    })
  })

  describe('Activation Generation', () => {
    test('should generate activation around messages', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.SOLID_ARROW, label: 'Hello' },
          { id: 'm2', from: 'B', to: 'A', type: ArrowType.DOTTED_ARROW, label: 'Hi' }
        ],
        notes: [],
        loops: [],
        activations: [
          { participant: 'B', startIndex: 0, endIndex: 1 }
        ]
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    A->>B: Hello\n' +
        '    activate B\n' +
        '    B-->>A: Hi\n' +
        '    deactivate B\n'
      )
    })

    test('should handle multiple overlapping activations', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 },
          { id: 'C', type: 'participant', label: 'Charlie', order: 2 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.SOLID_ARROW, label: 'Start B' },
          { id: 'm2', from: 'B', to: 'C', type: ArrowType.SOLID_ARROW, label: 'Start C' },
          { id: 'm3', from: 'C', to: 'B', type: ArrowType.DOTTED_ARROW, label: 'Response' },
          { id: 'm4', from: 'B', to: 'A', type: ArrowType.DOTTED_ARROW, label: 'Done' }
        ],
        notes: [],
        loops: [],
        activations: [
          { participant: 'B', startIndex: 0, endIndex: 3 },
          { participant: 'C', startIndex: 1, endIndex: 2 }
        ]
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    participant C as Charlie\n' +
        '    A->>B: Start B\n' +
        '    activate B\n' +
        '    B->>C: Start C\n' +
        '    activate C\n' +
        '    C-->>B: Response\n' +
        '    deactivate C\n' +
        '    B-->>A: Done\n' +
        '    deactivate B\n'
      )
    })
  })

  describe('Note Generation', () => {
    test('should generate left note', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 }
        ],
        messages: [],
        notes: [
          { id: 'n1', position: NotePosition.LEFT, target: 'A', text: 'Thinking' }
        ],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    Note left of A: Thinking\n'
      )
    })

    test('should generate right note', () => {
      const state: SequenceState = {
        participants: [
          { id: 'B', type: 'participant', label: 'Bob', order: 0 }
        ],
        messages: [],
        notes: [
          { id: 'n1', position: NotePosition.RIGHT, target: 'B', text: 'Processing' }
        ],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant B as Bob\n' +
        '    Note right of B: Processing\n'
      )
    })

    test('should generate note over single participant', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 }
        ],
        messages: [],
        notes: [
          { id: 'n1', position: NotePosition.OVER, target: 'A', text: 'Working' }
        ],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    Note over A: Working\n'
      )
    })

    test('should generate note over multiple participants', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [],
        notes: [
          { id: 'n1', position: NotePosition.OVER, target: ['A', 'B'], text: 'Collaboration' }
        ],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    Note over A,B: Collaboration\n'
      )
    })
  })

  describe('Loop Generation', () => {
    test('should generate simple loop', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.SOLID_ARROW, label: 'Hello' },
          { id: 'm2', from: 'B', to: 'A', type: ArrowType.DOTTED_ARROW, label: 'Hi' }
        ],
        notes: [],
        loops: [
          { id: 'l1', label: 'Every minute', messages: ['m2'] }
        ],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    A->>B: Hello\n' +
        '    loop Every minute\n' +
        '        B-->>A: Hi\n' +
        '    end\n'
      )
    })

    test('should generate loop with multiple messages', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'participant', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.SOLID_ARROW, label: 'Start' },
          { id: 'm2', from: 'B', to: 'A', type: ArrowType.DOTTED_ARROW, label: 'Working' },
          { id: 'm3', from: 'A', to: 'B', type: ArrowType.SOLID_ARROW, label: 'Continue' },
          { id: 'm4', from: 'B', to: 'A', type: ArrowType.DOTTED_ARROW, label: 'Done' }
        ],
        notes: [],
        loops: [
          { id: 'l1', label: 'Processing', messages: ['m2', 'm3'] }
        ],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    participant B as Bob\n' +
        '    A->>B: Start\n' +
        '    loop Processing\n' +
        '        B-->>A: Working\n' +
        '        A->>B: Continue\n' +
        '    end\n' +
        '    B-->>A: Done\n'
      )
    })
  })

  describe('Complete Integration', () => {
    test('should generate complete diagram with all features', () => {
      const state: SequenceState = {
        participants: [
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'actor', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.SOLID_ARROW, label: 'Hello' },
          { id: 'm2', from: 'B', to: 'A', type: ArrowType.DOTTED_ARROW, label: 'Hi' }
        ],
        notes: [
          { id: 'n1', position: NotePosition.RIGHT, target: 'B', text: 'Thinking' }
        ],
        loops: [
          { id: 'l1', label: 'Every minute', messages: ['m2'] }
        ],
        activations: [
          { participant: 'B', startIndex: 0, endIndex: 1 }
        ]
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    actor B as Bob\n' +
        '    A->>B: Hello\n' +
        '    activate B\n' +
        '    loop Every minute\n' +
        '        B-->>A: Hi\n' +
        '    end\n' +
        '    deactivate B\n' +
        '    Note right of B: Thinking\n'
      )
    })

    test('should handle empty labels and complex order', () => {
      const state: SequenceState = {
        participants: [
          { id: 'C', type: 'participant', label: 'Charlie', order: 2 },
          { id: 'A', type: 'participant', label: 'Alice', order: 0 },
          { id: 'B', type: 'actor', label: 'Bob', order: 1 }
        ],
        messages: [
          { id: 'm1', from: 'A', to: 'B', type: ArrowType.SOLID_ARROW, label: '' },
          { id: 'm2', from: 'B', to: 'C', type: ArrowType.DOTTED_CROSS, label: 'Error' },
          { id: 'm3', from: 'C', to: 'A', type: ArrowType.SOLID_ASYNC, label: 'Done' }
        ],
        notes: [
          { id: 'n1', position: NotePosition.OVER, target: ['A', 'C'], text: 'Process complete' }
        ],
        loops: [],
        activations: []
      }

      const result = buildSequenceCode(state)
      expect(result).toBe(
        'sequenceDiagram\n' +
        '    participant A as Alice\n' +
        '    actor B as Bob\n' +
        '    participant C as Charlie\n' +
        '    A->>B: \n' +
        '    B--xC: Error\n' +
        '    C-)A: Done\n' +
        '    Note over A,C: Process complete\n'
      )
    })
  })
})