# Architecture Patterns

## Data Flow Architecture

### Code → GUI Sync
```
rawCodeAtom → syncRawCodeToFlowchartAtom → parseFlowchartCode → nodesAtom/edgesAtom → ReactFlow
```

### GUI → Code Sync  
```
nodesAtom/edgesAtom → flowchartMermaidCodeAtom → syncFlowchartToRawCodeAtom → rawCodeAtom → CodeEditor
```

## Sync Loop Prevention
- `isCodeUpdateRef` - Flag for code-initiated updates
- `isGUIUpdateRef` - Flag for GUI-initiated updates  
- Each sync checks flags to avoid circular updates

## Key Atom Patterns

### Generic Editor Atoms (src/editor/atoms.ts)
- `rawCodeAtom` - Raw text in code editor
- `diagramTypeAtom` - Current diagram type  
- `parseErrorAtom` - Parse error messages
- `isEditingAtom` - Whether user is editing code

### Feature-Specific Atoms (e.g., src/flowchart/atoms.ts)
- Data atoms (nodesAtom, edgesAtom)
- Code generation atom (flowchartMermaidCodeAtom)
- Sync atoms (syncRawCodeToFlowchartAtom, syncFlowchartToRawCodeAtom)

## Directory Structure Rules
- Feature organization with logical subdirectories
- Cross-feature imports only via deps.ts
- Pure logic in core/ (no React/Jotai dependencies)
- Export management via index.ts