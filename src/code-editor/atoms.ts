import {
  atom,
  parseFlowchart,
  nodesAtom,
  edgesAtom,
  mermaidCodeAtom,
  MermaidParseResult,
} from './deps'

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
    // Update flowchart with parsed data
    set(nodesAtom, parseResult.data.nodes)
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
