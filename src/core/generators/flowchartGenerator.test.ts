import { describe, it, expect } from 'vitest';
import { generateFlowchartCode, FlowchartNode, FlowchartEdge } from './flowchartGenerator';

describe('flowchartGenerator', () => {
  describe('generateFlowchartCode', () => {
    it('should generate empty flowchart for no nodes', () => {
      const result = generateFlowchartCode([], []);
      expect(result).toBe('flowchart TD');
    });

    it('should generate code for single node', () => {
      const nodes: FlowchartNode[] = [
        { id: '1', label: 'Start', shape: 'rectangle' }
      ];
      
      const result = generateFlowchartCode(nodes, []);
      expect(result).toBe('flowchart TD\n  1[Start]');
    });

    it('should generate correct shapes', () => {
      const nodes: FlowchartNode[] = [
        { id: '1', label: 'Rectangle', shape: 'rectangle' },
        { id: '2', label: 'Rhombus', shape: 'rhombus' },
        { id: '3', label: 'Round', shape: 'round' },
        { id: '4', label: 'Stadium', shape: 'stadium' },
        { id: '5', label: 'Cylinder', shape: 'cylinder' },
        { id: '6', label: 'Circle', shape: 'circle' },
        { id: '7', label: 'Asymmetric', shape: 'asymmetric' },
        { id: '8', label: 'Hexagon', shape: 'hexagon' },
        { id: '9', label: 'Parallelogram', shape: 'parallelogram' },
        { id: '10', label: 'Parallelogram Alt', shape: 'parallelogram-alt' },
        { id: '11', label: 'Trapezoid', shape: 'trapezoid' },
        { id: '12', label: 'Trapezoid Alt', shape: 'trapezoid-alt' },
        { id: '13', label: 'Double Circle', shape: 'double-circle' }
      ];
      
      const result = generateFlowchartCode(nodes, []);
      const lines = result.split('\n');
      
      expect(lines[1]).toBe('  1[Rectangle]');
      expect(lines[2]).toBe('  2{Rhombus}');
      expect(lines[3]).toBe('  3(Round)');
      expect(lines[4]).toBe('  4([Stadium])');
      expect(lines[5]).toBe('  5[(Cylinder)]');
      expect(lines[6]).toBe('  6((Circle))');
      expect(lines[7]).toBe('  7>Asymmetric]');
      expect(lines[8]).toBe('  8{{Hexagon}}');
      expect(lines[9]).toBe('  9[/Parallelogram/]');
      expect(lines[10]).toBe('  10[\\\\Parallelogram Alt\\\\]');
      expect(lines[11]).toBe('  11[/Trapezoid\\\\]');
      expect(lines[12]).toBe('  12[\\\\Trapezoid Alt/]');
      expect(lines[13]).toBe('  13(((Double Circle)))');
    });

    it('should handle special characters in labels', () => {
      const nodes: FlowchartNode[] = [
        { id: '1', label: 'Node with "quotes"', shape: 'rectangle' },
        { id: '2', label: 'Node with [brackets]', shape: 'rectangle' },
        { id: '3', label: 'Node with {braces}', shape: 'rectangle' }
      ];
      
      const result = generateFlowchartCode(nodes, []);
      const lines = result.split('\n');
      
      expect(lines[1]).toContain('Node with "quotes"');
      expect(lines[2]).toContain('Node with [brackets]');
      expect(lines[3]).toContain('Node with {braces}');
    });

    it('should generate edges', () => {
      const nodes: FlowchartNode[] = [
        { id: '1', label: 'A', shape: 'rectangle' },
        { id: '2', label: 'B', shape: 'rectangle' }
      ];
      const edges: FlowchartEdge[] = [
        { id: 'e1', source: '1', target: '2' }
      ];
      
      const result = generateFlowchartCode(nodes, edges);
      expect(result).toBe('flowchart TD\n  1[A]\n  2[B]\n  1 --> 2');
    });

    it('should generate edges with labels', () => {
      const nodes: FlowchartNode[] = [
        { id: '1', label: 'A', shape: 'rectangle' },
        { id: '2', label: 'B', shape: 'rectangle' }
      ];
      const edges: FlowchartEdge[] = [
        { id: 'e1', source: '1', target: '2', label: 'Yes' }
      ];
      
      const result = generateFlowchartCode(nodes, edges);
      expect(result).toBe('flowchart TD\n  1[A]\n  2[B]\n  1 -->|Yes| 2');
    });

    it('should generate different edge types', () => {
      const nodes: FlowchartNode[] = [
        { id: '1', label: 'A', shape: 'rectangle' },
        { id: '2', label: 'B', shape: 'rectangle' },
        { id: '3', label: 'C', shape: 'rectangle' },
        { id: '4', label: 'D', shape: 'rectangle' }
      ];
      const edges: FlowchartEdge[] = [
        { id: 'e1', source: '1', target: '2', style: 'solid' },
        { id: 'e2', source: '2', target: '3', style: 'dotted' },
        { id: 'e3', source: '3', target: '4', style: 'thick' }
      ];
      
      const result = generateFlowchartCode(nodes, edges);
      const lines = result.split('\n');
      
      expect(lines[5]).toBe('  1 --> 2');
      expect(lines[6]).toBe('  2 -.-> 3');
      expect(lines[7]).toBe('  3 ==> 4');
    });

    it('should handle flowchart direction', () => {
      const nodes: FlowchartNode[] = [
        { id: '1', label: 'A', shape: 'rectangle' }
      ];
      
      let result = generateFlowchartCode(nodes, [], { direction: 'TD' });
      expect(result).toBe('flowchart TD\n  1[A]');
      
      result = generateFlowchartCode(nodes, [], { direction: 'LR' });
      expect(result).toBe('flowchart LR\n  1[A]');
      
      result = generateFlowchartCode(nodes, [], { direction: 'BT' });
      expect(result).toBe('flowchart BT\n  1[A]');
      
      result = generateFlowchartCode(nodes, [], { direction: 'RL' });
      expect(result).toBe('flowchart RL\n  1[A]');
    });

    it('should handle complex flowchart', () => {
      const nodes: FlowchartNode[] = [
        { id: '1', label: 'Start', shape: 'round' },
        { id: '2', label: 'Is it working?', shape: 'rhombus' },
        { id: '3', label: 'Yes', shape: 'rectangle' },
        { id: '4', label: 'No', shape: 'rectangle' },
        { id: '5', label: 'End', shape: 'round' }
      ];
      const edges: FlowchartEdge[] = [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3', label: 'Yes' },
        { id: 'e3', source: '2', target: '4', label: 'No' },
        { id: 'e4', source: '3', target: '5' },
        { id: 'e5', source: '4', target: '5' }
      ];
      
      const result = generateFlowchartCode(nodes, edges);
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('flowchart TD');
      expect(lines.length).toBe(11);
      expect(lines).toContain('  2 -->|Yes| 3');
      expect(lines).toContain('  2 -->|No| 4');
    });
  });
});