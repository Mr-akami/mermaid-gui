import { atom, parseFlowchart, nodesAtom, edgesAtom, MermaidParseResult } from './deps';

// Editor code state
export const editorCodeAtom = atom<string>('');

// Parse error state
export const parseErrorAtom = atom<string | null>(null);

// Write atom to apply code changes to flowchart
export const applyCodeToFlowchartAtom = atom(
  null,
  (get, set) => {
    const code = get(editorCodeAtom);
    
    if (!code.trim()) {
      // Clear everything if code is empty
      set(nodesAtom, []);
      set(edgesAtom, []);
      set(parseErrorAtom, null);
      return;
    }
    
    const parseResult: MermaidParseResult = parseFlowchart(code);
    
    if (parseResult.success && parseResult.data) {
      // Update flowchart with parsed data
      set(nodesAtom, parseResult.data.nodes);
      set(edgesAtom, parseResult.data.edges);
      set(parseErrorAtom, null);
    } else {
      // Set error but don't update flowchart
      set(parseErrorAtom, parseResult.error || 'Unknown parsing error');
    }
  }
);