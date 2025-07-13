import { describe, it, expect } from 'vitest';
import { parseFlowchartCode } from './flowchartParser';

describe('flowchartParser', () => {
  describe('parseFlowchartCode', () => {
    it('should parse empty flowchart', () => {
      const result = parseFlowchartCode('flowchart TD');
      expect(result).toEqual({
        direction: 'TD',
        nodes: [],
        edges: []
      });
    });

    it('should parse flowchart direction', () => {
      let result = parseFlowchartCode('flowchart LR');
      expect(result.direction).toBe('LR');
      
      result = parseFlowchartCode('flowchart BT');
      expect(result.direction).toBe('BT');
      
      result = parseFlowchartCode('flowchart RL');
      expect(result.direction).toBe('RL');
    });

    it('should parse single node', () => {
      const result = parseFlowchartCode(`flowchart TD
  A[Start]`);
      
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]).toEqual({
        id: 'A',
        label: 'Start',
        shape: 'rectangle'
      });
    });

    it('should parse multiple node shapes', () => {
      const code = `flowchart TD
  A[Rectangle]
  B{Rhombus}
  C(Round)
  D([Stadium])
  E[(Cylinder)]
  F((Circle))
  G>Asymmetric]
  H{{Hexagon}}
  I[/Parallelogram/]
  J[\\\\Parallelogram Alt\\\\]
  K[/Trapezoid\\\\]
  L[\\\\Trapezoid Alt/]
  M(((Double Circle)))`;
      
      const result = parseFlowchartCode(code);
      
      expect(result.nodes).toHaveLength(13);
      expect(result.nodes[0]).toMatchObject({ id: 'A', shape: 'rectangle' });
      expect(result.nodes[1]).toMatchObject({ id: 'B', shape: 'rhombus' });
      expect(result.nodes[2]).toMatchObject({ id: 'C', shape: 'round' });
      expect(result.nodes[3]).toMatchObject({ id: 'D', shape: 'stadium' });
      expect(result.nodes[4]).toMatchObject({ id: 'E', shape: 'cylinder' });
      expect(result.nodes[5]).toMatchObject({ id: 'F', shape: 'circle' });
      expect(result.nodes[6]).toMatchObject({ id: 'G', shape: 'asymmetric' });
      expect(result.nodes[7]).toMatchObject({ id: 'H', shape: 'hexagon' });
      expect(result.nodes[8]).toMatchObject({ id: 'I', shape: 'parallelogram' });
      expect(result.nodes[9]).toMatchObject({ id: 'J', shape: 'parallelogram-alt' });
      expect(result.nodes[10]).toMatchObject({ id: 'K', shape: 'trapezoid' });
      expect(result.nodes[11]).toMatchObject({ id: 'L', shape: 'trapezoid-alt' });
      expect(result.nodes[12]).toMatchObject({ id: 'M', shape: 'double-circle' });
    });

    it('should parse edges', () => {
      const code = `flowchart TD
  A[Start]
  B[End]
  A --> B`;
      
      const result = parseFlowchartCode(code);
      
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toMatchObject({
        source: 'A',
        target: 'B',
        style: 'solid'
      });
    });

    it('should parse edges with labels', () => {
      const code = `flowchart TD
  A[Start]
  B[End]
  A -->|Yes| B`;
      
      const result = parseFlowchartCode(code);
      
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toMatchObject({
        source: 'A',
        target: 'B',
        label: 'Yes',
        style: 'solid'
      });
    });

    it('should parse different edge styles', () => {
      const code = `flowchart TD
  A[Node A]
  B[Node B]
  C[Node C]
  D[Node D]
  A --> B
  B -.-> C
  C ==> D`;
      
      const result = parseFlowchartCode(code);
      
      expect(result.edges).toHaveLength(3);
      expect(result.edges[0].style).toBe('solid');
      expect(result.edges[1].style).toBe('dotted');
      expect(result.edges[2].style).toBe('thick');
    });

    it('should handle nodes with special characters', () => {
      const code = `flowchart TD
  A["Node with quotes"]
  B[Node with spaces]
  C[Node-with-dashes]`;
      
      const result = parseFlowchartCode(code);
      
      expect(result.nodes).toHaveLength(3);
      expect(result.nodes[0].label).toBe('Node with quotes');
      expect(result.nodes[1].label).toBe('Node with spaces');
      expect(result.nodes[2].label).toBe('Node-with-dashes');
    });

    it('should handle complex flowchart', () => {
      const code = `flowchart TD
  Start(Start)
  IsWorking{Is it working?}
  Yes[Yes]
  No[No]
  End(End)
  
  Start --> IsWorking
  IsWorking -->|Yes| Yes
  IsWorking -->|No| No
  Yes --> End
  No --> End`;
      
      const result = parseFlowchartCode(code);
      
      expect(result.nodes).toHaveLength(5);
      expect(result.edges).toHaveLength(5);
      
      const isWorkingNode = result.nodes.find(n => n.id === 'IsWorking');
      expect(isWorkingNode?.shape).toBe('rhombus');
      
      const yesEdge = result.edges.find(e => e.label === 'Yes');
      expect(yesEdge?.source).toBe('IsWorking');
      expect(yesEdge?.target).toBe('Yes');
    });

    it('should ignore comments and empty lines', () => {
      const code = `flowchart TD
  %% This is a comment
  A[Start]
  
  %% Another comment
  B[End]
  
  A --> B`;
      
      const result = parseFlowchartCode(code);
      
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
    });

    it('should handle inline node definitions', () => {
      const code = `flowchart TD
  A[Start] --> B[Process]
  B --> C[End]`;
      
      const result = parseFlowchartCode(code);
      
      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);
    });

    it('should generate unique IDs for edges', () => {
      const code = `flowchart TD
  A --> B
  B --> C
  A --> C`;
      
      const result = parseFlowchartCode(code);
      
      expect(result.edges).toHaveLength(3);
      const edgeIds = result.edges.map(e => e.id);
      expect(new Set(edgeIds).size).toBe(3); // All IDs should be unique
    });
  });
});