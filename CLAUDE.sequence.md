# CLAUDE.sequence.md

Compressed specification for Sequence Diagram implementation in Mermaid GUI.

## Core Concepts

### Participants
- **Types**: `participant` (box), `actor` (stick figure)
- **Alias**: `participant A as Alice`
- **Creation**: `create participant B` (dynamic)
- **Destruction**: `destroy B`
- **Order**: Declaration order = display order

### Message Arrows
```
->    solid line
-->   dotted line
->>   solid + arrow
-->>  dotted + arrow
<<->> solid bidirectional (v11.0.0+)
<<-->> dotted bidirectional (v11.0.0+)
-x    solid + cross
--x   dotted + cross
-)    solid + async
--)   dotted + async
```

### Activation
- `activate A` / `deactivate A`
- Shorthand: `A->>+B: msg` (activate B), `B-->>-A: reply` (deactivate B)
- Stack: Multiple activations create nested boxes

### Control Flow Blocks
```
loop [label]
  ...
end

alt [condition1]
  ...
else [condition2]
  ...
end

opt [condition]
  ...
end

par [action1]
  ...
and [action2]
  ...
end

critical [region]
  ...
option [handler]
  ...
end

break [condition]
  ...
end
```

### Notes & Annotations
- `Note right of A: text`
- `Note left of A: text`
- `Note over A: text`
- `Note over A,B: text` (spans participants)

### Visual Elements
- `rect rgb(r,g,b)` or `rect #hexcolor` - background highlight
- `box [color] [label]` - group participants
- `autonumber` - auto sequence numbers

### Links
```
link A: Display Text @ url
links A: {"text":"Google","url":"https://google.com"}
```

## GUI Implementation Architecture

### Component Types
1. **Participant Node** - Draggable boxes/actors at top
2. **Message Edge** - Different arrow types between participants
3. **Block Container** - loop/alt/opt/par visual blocks
4. **Note Node** - Attached to participants or floating
5. **Activation Bar** - Vertical bars on participant lifelines

### State Structure
```typescript
interface SequenceState {
  participants: {
    id: string
    type: 'participant' | 'actor'
    label: string
    alias?: string
    order: number
  }[]
  
  messages: {
    id: string
    from: string
    to: string
    type: ArrowType
    label: string
    activate?: boolean
    deactivate?: boolean
    sequenceNumber?: number
  }[]
  
  blocks: {
    id: string
    type: 'loop' | 'alt' | 'opt' | 'par' | 'critical' | 'break'
    label?: string
    messages: string[] // message ids
    children?: Block[] // for alt/par branches
  }[]
  
  notes: {
    id: string
    position: 'left' | 'right' | 'over'
    target: string | string[] // participant id(s)
    text: string
  }[]
  
  activations: {
    participant: string
    start: number // message index
    end: number   // message index
  }[]
}
```

### Code Generation Rules
1. Participants declared first (in order)
2. Messages in sequence with activations
3. Blocks wrap message sequences
4. Notes positioned relative to messages
5. Visual settings (rect/box) before content

### Parser Requirements
- Track participant order from declarations
- Match activation/deactivation pairs
- Nest blocks properly (alt/else, par/and)
- Associate notes with correct participants
- Handle implicit participant creation from messages

### GUI Interactions
1. **Add Participant**: Click toolbar → place at top
2. **Connect Message**: Drag from participant to participant
3. **Create Block**: Select messages → wrap in block
4. **Add Note**: Right-click participant → add note
5. **Reorder**: Drag participants horizontally
6. **Edit Labels**: Double-click any text

### Constraints
- Participants stay at top (fixed Y)
- Messages flow top-to-bottom chronologically
- Blocks must contain continuous message sequences
- Activations align with message positions
- Notes don't overlap with lifelines

## File Structure
```
src/sequence/
├── components/
│   ├── SequenceParticipant.tsx
│   ├── SequenceMessage.tsx
│   ├── SequenceBlock.tsx
│   ├── SequenceNote.tsx
│   └── SequenceActivation.tsx
├── editor/
│   ├── SequenceEditor.tsx
│   ├── SequenceToolbar.tsx
│   └── SequencePropertyPanel.tsx
├── core/
│   ├── builders/
│   │   └── sequenceCodeBuilder.ts
│   └── code-parser/
│       └── sequenceParser.ts
├── atoms.ts
├── types.ts
├── index.ts
└── deps.ts
```

## Priority Features (MVP)
1. Basic participants (participant/actor)
2. Simple messages (->>, -->>, return)
3. Activation boxes
4. Basic notes
5. Simple loops

## Future Features
- Alt/opt/par blocks
- Critical regions
- Participant creation/destruction
- Bidirectional arrows
- Background highlighting
- Sequence numbering
- Link/menu support