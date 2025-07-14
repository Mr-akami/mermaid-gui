import { describe, it, expect } from 'vitest';
import { layoutNodes, LayoutOptions, GraphNode, GraphEdge } from './layoutEngine';

describe('layoutEngine', () => {
  describe('layoutNodes', () => {
    it('should return empty array for empty input', () => {
      const result = layoutNodes([], []);
      expect(result).toEqual([]);
    });

    it('should layout single node at origin', () => {
      const nodes: GraphNode[] = [
        { id: '1', width: 100, height: 50 }
      ];
      const result = layoutNodes(nodes, []);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '1',
        x: 0,
        y: 0
      });
    });

    it('should layout two connected nodes vertically', () => {
      const nodes: GraphNode[] = [
        { id: '1', width: 100, height: 50 },
        { id: '2', width: 100, height: 50 }
      ];
      const edges: GraphEdge[] = [
        { id: 'e1', source: '1', target: '2' }
      ];
      
      const result = layoutNodes(nodes, edges);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].y).toBe(0);
      expect(result[1].id).toBe('2');
      expect(result[1].y).toBeGreaterThan(result[0].y + 50); // Below first node with spacing
    });

    it('should layout branching nodes horizontally', () => {
      const nodes: GraphNode[] = [
        { id: '1', width: 100, height: 50 },
        { id: '2', width: 100, height: 50 },
        { id: '3', width: 100, height: 50 }
      ];
      const edges: GraphEdge[] = [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '1', target: '3' }
      ];
      
      const result = layoutNodes(nodes, edges);
      
      expect(result).toHaveLength(3);
      const node1 = result.find(n => n.id === '1');
      const node2 = result.find(n => n.id === '2');
      const node3 = result.find(n => n.id === '3');
      
      expect(node1).toBeDefined();
      expect(node2).toBeDefined();
      expect(node3).toBeDefined();
      
      // Node 2 and 3 should be at same vertical level
      expect(node2!.y).toBe(node3!.y);
      // Node 2 and 3 should be horizontally separated
      expect(Math.abs(node2!.x - node3!.x)).toBeGreaterThan(100);
    });

    it('should handle disconnected components', () => {
      const nodes: GraphNode[] = [
        { id: '1', width: 100, height: 50 },
        { id: '2', width: 100, height: 50 },
        { id: '3', width: 100, height: 50 },
        { id: '4', width: 100, height: 50 }
      ];
      const edges: GraphEdge[] = [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '3', target: '4' }
      ];
      
      const result = layoutNodes(nodes, edges);
      
      expect(result).toHaveLength(4);
      
      // Each component should be laid out independently
      const component1 = result.filter(n => n.id === '1' || n.id === '2');
      const component2 = result.filter(n => n.id === '3' || n.id === '4');
      
      // Components should be separated horizontally
      const comp1MaxX = Math.max(...component1.map(n => n.x + 100));
      const comp2MinX = Math.min(...component2.map(n => n.x));
      
      expect(comp2MinX).toBeGreaterThan(comp1MaxX);
    });

    it('should respect layout options', () => {
      const nodes: GraphNode[] = [
        { id: '1', width: 100, height: 50 },
        { id: '2', width: 100, height: 50 }
      ];
      const edges: GraphEdge[] = [
        { id: 'e1', source: '1', target: '2' }
      ];
      
      const options: LayoutOptions = {
        direction: 'LR', // Left to right
        nodeSpacing: 200,
        rankSpacing: 300
      };
      
      const result = layoutNodes(nodes, edges, options);
      
      const node1 = result.find(n => n.id === '1');
      const node2 = result.find(n => n.id === '2');
      
      // Nodes should be arranged horizontally (LR)
      expect(node1!.y).toBe(node2!.y);
      expect(node2!.x).toBeGreaterThan(node1!.x + 100);
    });

    it('should handle cyclic graphs', () => {
      const nodes: GraphNode[] = [
        { id: '1', width: 100, height: 50 },
        { id: '2', width: 100, height: 50 },
        { id: '3', width: 100, height: 50 }
      ];
      const edges: GraphEdge[] = [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
        { id: 'e3', source: '3', target: '1' } // Creates cycle
      ];
      
      const result = layoutNodes(nodes, edges);
      
      expect(result).toHaveLength(3);
      // All nodes should have positions
      result.forEach(node => {
        expect(node.x).toBeDefined();
        expect(node.y).toBeDefined();
      });
    });
  });
});