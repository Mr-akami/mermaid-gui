import { describe, it, expect } from 'vitest'
import { parseSequenceCode } from './sequenceParser'
import { ArrowType, NotePosition } from '../../types'

describe('sequenceParser', () => {
  describe('basic parsing', () => {
    it('should parse empty sequence diagram', () => {
      const code = 'sequenceDiagram'
      const result = parseSequenceCode(code)
      
      expect(result.participants).toHaveLength(0)
      expect(result.messages).toHaveLength(0)
      expect(result.notes).toHaveLength(0)
      expect(result.loops).toHaveLength(0)
    })

    it('should parse simple sequence with participants and messages', () => {
      const code = `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob!
    B-->>A: Hi Alice!`
      
      const result = parseSequenceCode(code)
      
      expect(result.participants).toHaveLength(2)
      expect(result.messages).toHaveLength(2)
      
      // Check participants
      const alice = result.participants.find(p => p.id === 'A')
      expect(alice).toBeDefined()
      expect(alice?.type).toBe('participant')
      expect(alice?.label).toBe('Alice')
      expect(alice?.order).toBe(0)
      
      const bob = result.participants.find(p => p.id === 'B')
      expect(bob).toBeDefined()
      expect(bob?.type).toBe('participant')
      expect(bob?.label).toBe('Bob')
      expect(bob?.order).toBe(1)
      
      // Check messages
      const msg1 = result.messages.find(m => m.from === 'A' && m.to === 'B')
      expect(msg1).toBeDefined()
      expect(msg1?.type).toBe(ArrowType.SOLID_ARROW)
      expect(msg1?.label).toBe('Hello Bob!')
      
      const msg2 = result.messages.find(m => m.from === 'B' && m.to === 'A')
      expect(msg2).toBeDefined()
      expect(msg2?.type).toBe(ArrowType.DOTTED_ARROW)
      expect(msg2?.label).toBe('Hi Alice!')
    })
  })

  describe('participant parsing', () => {
    it('should parse actors', () => {
      const code = `sequenceDiagram
    actor A as Alice
    participant B as Bob`
      
      const result = parseSequenceCode(code)
      
      expect(result.participants).toHaveLength(2)
      
      const alice = result.participants.find(p => p.id === 'A')
      expect(alice?.type).toBe('actor')
      
      const bob = result.participants.find(p => p.id === 'B')
      expect(bob?.type).toBe('participant')
    })

    it('should parse participants without aliases', () => {
      const code = `sequenceDiagram
    participant Alice
    participant Bob`
      
      const result = parseSequenceCode(code)
      
      expect(result.participants).toHaveLength(2)
      
      const alice = result.participants.find(p => p.id === 'Alice')
      expect(alice?.label).toBe('Alice')
      
      const bob = result.participants.find(p => p.id === 'Bob')
      expect(bob?.label).toBe('Bob')
    })

    it('should maintain participant order', () => {
      const code = `sequenceDiagram
    participant C as Charlie
    participant A as Alice
    participant B as Bob`
      
      const result = parseSequenceCode(code)
      
      const charlie = result.participants.find(p => p.id === 'C')
      const alice = result.participants.find(p => p.id === 'A')
      const bob = result.participants.find(p => p.id === 'B')
      
      expect(charlie?.order).toBe(0)
      expect(alice?.order).toBe(1)
      expect(bob?.order).toBe(2)
    })
  })

  describe('message parsing', () => {
    it('should parse all arrow types', () => {
      const code = `sequenceDiagram
    participant A
    participant B
    A->B: Solid
    A-->B: Dotted
    A->>B: Solid Arrow
    A-->>B: Dotted Arrow
    A-xB: Solid Cross
    A--xB: Dotted Cross
    A-)B: Solid Async
    A--)B: Dotted Async`
      
      const result = parseSequenceCode(code)
      
      expect(result.messages).toHaveLength(8)
      
      const messages = result.messages
      expect(messages[0].type).toBe(ArrowType.SOLID)
      expect(messages[1].type).toBe(ArrowType.DOTTED)
      expect(messages[2].type).toBe(ArrowType.SOLID_ARROW)
      expect(messages[3].type).toBe(ArrowType.DOTTED_ARROW)
      expect(messages[4].type).toBe(ArrowType.SOLID_CROSS)
      expect(messages[5].type).toBe(ArrowType.DOTTED_CROSS)
      expect(messages[6].type).toBe(ArrowType.SOLID_ASYNC)
      expect(messages[7].type).toBe(ArrowType.DOTTED_ASYNC)
    })

    it('should parse activation and deactivation', () => {
      const code = `sequenceDiagram
    participant A
    participant B
    A->>B: Hello
    activate B
    B-->>A: Hi
    deactivate B`
      
      const result = parseSequenceCode(code)
      
      expect(result.messages).toHaveLength(2)
      
      const msg1 = result.messages[0]
      expect(msg1.activate).toBe(true)
      
      const msg2 = result.messages[1]
      expect(msg2.deactivate).toBe(true)
    })
  })

  describe('note parsing', () => {
    it('should parse notes with different positions', () => {
      const code = `sequenceDiagram
    participant A
    participant B
    Note left of A: Left note
    Note right of B: Right note
    Note over A: Over note
    Note over A,B: Over multiple`
      
      const result = parseSequenceCode(code)
      
      expect(result.notes).toHaveLength(4)
      
      const leftNote = result.notes[0]
      expect(leftNote.position).toBe(NotePosition.LEFT)
      expect(leftNote.target).toBe('A')
      expect(leftNote.text).toBe('Left note')
      
      const rightNote = result.notes[1]
      expect(rightNote.position).toBe(NotePosition.RIGHT)
      expect(rightNote.target).toBe('B')
      expect(rightNote.text).toBe('Right note')
      
      const overNote = result.notes[2]
      expect(overNote.position).toBe(NotePosition.OVER)
      expect(overNote.target).toBe('A')
      expect(overNote.text).toBe('Over note')
      
      const overMultiple = result.notes[3]
      expect(overMultiple.position).toBe(NotePosition.OVER)
      expect(overMultiple.target).toEqual(['A', 'B'])
      expect(overMultiple.text).toBe('Over multiple')
    })
  })

  describe('loop parsing', () => {
    it('should parse simple loops', () => {
      const code = `sequenceDiagram
    participant A
    participant B
    loop Every minute
        A->>B: Check
        B-->>A: OK
    end`
      
      const result = parseSequenceCode(code)
      
      expect(result.loops).toHaveLength(1)
      expect(result.messages).toHaveLength(2)
      
      const loop = result.loops[0]
      expect(loop.label).toBe('Every minute')
      expect(loop.messages).toHaveLength(2)
      
      // Messages should be associated with the loop
      const loopMessages = result.messages.filter(m => loop.messages.includes(m.id))
      expect(loopMessages).toHaveLength(2)
    })
  })

  describe('complex parsing', () => {
    it('should parse comprehensive sequence diagram', () => {
      const code = `sequenceDiagram
    participant A as Alice
    actor B as Bob
    A->>B: Hello Bob!
    activate B
    Note right of B: Bob thinks
    B-->>A: Hi Alice!
    deactivate B
    Note over A,B: They greet each other
    loop Every minute
        B->>B: Check time
    end`
      
      const result = parseSequenceCode(code)
      
      expect(result.participants).toHaveLength(2)
      expect(result.messages).toHaveLength(3)
      expect(result.notes).toHaveLength(2)
      expect(result.loops).toHaveLength(1)
      
      // Check participant types
      const alice = result.participants.find(p => p.id === 'A')
      const bob = result.participants.find(p => p.id === 'B')
      expect(alice?.type).toBe('participant')
      expect(bob?.type).toBe('actor')
      
      // Check activation
      const helloMsg = result.messages.find(m => m.label === 'Hello Bob!')
      expect(helloMsg?.activate).toBe(true)
      
      const hiMsg = result.messages.find(m => m.label === 'Hi Alice!')
      expect(hiMsg?.deactivate).toBe(true)
      
      // Check loop
      const loop = result.loops[0]
      expect(loop.label).toBe('Every minute')
      expect(loop.messages).toHaveLength(1)
    })
  })

  describe('error handling', () => {
    it('should handle invalid sequence diagrams gracefully', () => {
      const code = 'invalid sequence'
      const result = parseSequenceCode(code)
      
      expect(result.error).toBeDefined()
      expect(result.participants).toHaveLength(0)
      expect(result.messages).toHaveLength(0)
    })

    it('should handle malformed messages', () => {
      const code = `sequenceDiagram
    participant A
    A-invalid->B: Bad message`
      
      const result = parseSequenceCode(code)
      
      // Should skip malformed messages but continue parsing
      expect(result.participants).toHaveLength(1)
      expect(result.messages).toHaveLength(0)
    })
  })
})