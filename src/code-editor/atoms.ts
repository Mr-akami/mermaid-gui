import {
  atom,
  parseFlowchart,
  nodesAtom,
  edgesAtom,
  mermaidCodeAtom as baseMermaidCodeAtom,
  MermaidParseResult,
} from './deps'

// Re-export mermaidCodeAtom for use in CodeEditor
export const mermaidCodeAtom = baseMermaidCodeAtom

// Editor code state
export const editorCodeAtom = atom<string>('')

// Parse error state
export const parseErrorAtom = atom<string | null>(null)

// Auto sync enabled state
export const autoSyncEnabledAtom = atom<boolean>(true)

// Write atom to apply code changes to flowchart
export const applyCodeToFlowchartAtom = atom(null, (get, set) => {
  const code = get(editorCodeAtom)

  if (!code.trim()) {
    // Clear everything if code is empty
    set(nodesAtom, [])
    set(edgesAtom, [])
    set(parseErrorAtom, null)
    return
  }

  const parseResult: MermaidParseResult = parseFlowchart(code)

  if (parseResult.success && parseResult.data) {
    // Get existing nodes to preserve positions
    const existingNodes = get(nodesAtom)
    const positionMap = new Map(
      existingNodes.map((node) => [node.id, node.position]),
    )

    // Update parsed nodes with existing positions
    const nodesWithPositions = parseResult.data.nodes.map((node) => ({
      ...node,
      position: positionMap.get(node.id) || {
        x: 100 + Math.random() * 400,
        y: 100 + Math.random() * 300,
      },
    }))

    // Update flowchart with parsed data
    set(nodesAtom, nodesWithPositions)
    set(edgesAtom, parseResult.data.edges)
    set(parseErrorAtom, null)
  } else {
    // Set error but don't update flowchart
    set(parseErrorAtom, parseResult.error || 'Unknown parsing error')
  }
})

// Write atom to sync flowchart changes to editor
export const syncWithFlowchartAtom = atom(null, (get, set) => {
  const mermaidCode = get(mermaidCodeAtom)
  set(editorCodeAtom, mermaidCode)
})

// Computed atom that syncs automatically when enabled
export const autoSyncAtom = atom((get) => {
  const autoSyncEnabled = get(autoSyncEnabledAtom)
  const mermaidCode = get(mermaidCodeAtom)
  const editorCode = get(editorCodeAtom)

  if (autoSyncEnabled && mermaidCode !== editorCode) {
    return mermaidCode
  }

  return editorCode
})
