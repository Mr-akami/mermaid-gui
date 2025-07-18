import { describe, it, expect } from 'vitest';
import { parseEdge } from './edgeParser';

describe('edgeParser', () => {
  describe('parseEdge', () => {
    it('should parse a normal edge', () => {
      const line = 'A --- B';
      const result = parseEdge(line);
      
      expect(result).toEqual({
        source: 'A',
        target: 'B',
        type: 'normal',
        label: undefined
      });
    });

    it('should parse a normal edge with arrow', () => {
      const line = 'A --> B';
      const result = parseEdge(line);
      
      expect(result).toEqual({
        source: 'A',
        target: 'B',
        type: 'normal-arrow',
        label: undefined
      });
    });

    it('should parse a thick edge', () => {
      const line = 'A === B';
      const result = parseEdge(line);
      
      expect(result).toEqual({
        source: 'A',
        target: 'B',
        type: 'thick',
        label: undefined
      });
    });

    it('should parse a thick edge with arrow', () => {
      const line = 'A ==> B';
      const result = parseEdge(line);
      
      expect(result).toEqual({
        source: 'A',
        target: 'B',
        type: 'thick-arrow',
        label: undefined
      });
    });

    it('should parse a dotted edge', () => {
      const line = 'A -.- B';
      const result = parseEdge(line);
      
      expect(result).toEqual({
        source: 'A',
        target: 'B',
        type: 'dotted',
        label: undefined
      });
    });

    it('should parse a dotted edge with arrow', () => {
      const line = 'A -.-> B';
      const result = parseEdge(line);
      
      expect(result).toEqual({
        source: 'A',
        target: 'B',
        type: 'dotted-arrow',
        label: undefined
      });
    });

    it('should parse an edge with label', () => {
      const line = 'A -->|Yes| B';
      const result = parseEdge(line);
      
      expect(result).toEqual({
        source: 'A',
        target: 'B',
        type: 'normal-arrow',
        label: 'Yes'
      });
    });

    it('should handle escaped characters in edge labels', () => {
      const line = 'A -->|Label \\|with\\| pipes| B';
      const result = parseEdge(line);
      
      expect(result).toEqual({
        source: 'A',
        target: 'B',
        type: 'normal-arrow',
        label: 'Label |with| pipes'
      });
    });

    it('should return null for non-edge lines', () => {
      const line = 'A[Node]';
      const result = parseEdge(line);
      
      expect(result).toBeNull();
    });

    it('should handle edges with spaces in node IDs', () => {
      const line = 'node1 --> node2';
      const result = parseEdge(line);
      
      expect(result).toEqual({
        source: 'node1',
        target: 'node2',
        type: 'normal-arrow',
        label: undefined
      });
    });
  });
});