import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ReactFlow, ReactFlowProvider } from '@xyflow/react'
import { toReactFlowNodes, toReactFlowEdges } from './flowchartConverters'
import type { Node, Edge } from '../../common/types'
import '@xyflow/react/dist/style.css'

describe('Runtime z-index behavior', () => {
  it('should always render subgraphs behind other nodes regardless of creation order', () => {
    // Test case 1: Node created first, then subgraph
    const nodes1: Node[] = [
      {
        id: 'node1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        data: { label: 'Created First' },
        childIds: []
      },
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 50, y: 50 },
        data: { label: 'Created Second' },
        childIds: []
      }
    ]

    const rfNodes1 = toReactFlowNodes(nodes1)
    
    // Subgraph should have lower z-index
    const sg1 = rfNodes1.find(n => n.id === 'sg1')
    const node1 = rfNodes1.find(n => n.id === 'node1')
    
    expect(sg1?.zIndex).toBeLessThan(node1?.zIndex || 0)
    expect(sg1?.style?.zIndex).toBeLessThan(node1?.style?.zIndex || 0)
  })

  it('should handle subgraph created after nodes correctly', () => {
    // Test case 2: Subgraph created last
    const nodes2: Node[] = [
      {
        id: 'node1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        data: { label: 'Node 1' },
        childIds: []
      },
      {
        id: 'node2',
        type: 'circle',
        position: { x: 200, y: 100 },
        data: { label: 'Node 2' },
        childIds: []
      },
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 50, y: 50 },
        data: { label: 'Created Last' },
        childIds: []
      }
    ]

    const rfNodes2 = toReactFlowNodes(nodes2)
    
    // Check array order - subgraphs should come first
    const firstNode = rfNodes2[0]
    expect(firstNode.id).toBe('sg1')
    expect(firstNode.type).toBe('group')
    
    // Check z-index values
    const sg = rfNodes2.find(n => n.id === 'sg1')
    const regularNodes = rfNodes2.filter(n => n.id !== 'sg1')
    
    regularNodes.forEach(node => {
      expect(sg?.zIndex).toBeLessThan(node.zIndex || 0)
      expect(sg?.style?.zIndex).toBeLessThan(node.style?.zIndex || 0)
    })
  })

  it('should handle dynamic node addition with subgraphs', () => {
    // Simulate adding nodes dynamically
    let nodes: Node[] = [
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 50, y: 50 },
        data: { label: 'Existing Subgraph' },
        childIds: []
      }
    ]

    let rfNodes = toReactFlowNodes(nodes)
    expect(rfNodes[0].zIndex).toBeLessThan(0)

    // Add a regular node
    nodes.push({
      id: 'node1',
      type: 'rectangle',
      position: { x: 150, y: 150 },
      data: { label: 'Dynamically Added' },
      childIds: []
    })

    rfNodes = toReactFlowNodes(nodes)
    
    // Subgraph should still be first in array and have lower z-index
    expect(rfNodes[0].id).toBe('sg1')
    const sg = rfNodes.find(n => n.id === 'sg1')
    const node = rfNodes.find(n => n.id === 'node1')
    
    expect(sg?.zIndex).toBeLessThan(node?.zIndex || 0)
    
    // Add another subgraph
    nodes.push({
      id: 'sg2',
      type: 'subgraph',
      position: { x: 250, y: 50 },
      data: { label: 'Second Subgraph' },
      childIds: []
    })

    rfNodes = toReactFlowNodes(nodes)
    
    // Both subgraphs should be at the beginning
    expect(rfNodes[0].id).toBe('sg1')
    expect(rfNodes[1].id).toBe('sg2')
    
    // Second subgraph should have slightly higher z-index than first, but still negative
    const sg1Final = rfNodes.find(n => n.id === 'sg1')
    const sg2Final = rfNodes.find(n => n.id === 'sg2')
    const nodeFinal = rfNodes.find(n => n.id === 'node1')
    
    expect(sg1Final?.zIndex).toBe(-1000)
    expect(sg2Final?.zIndex).toBe(-999)
    expect(nodeFinal?.zIndex).toBe(1000)
  })

  it('should maintain z-index even with parent-child relationships', () => {
    const nodes: Node[] = [
      {
        id: 'sg1',
        type: 'subgraph',
        position: { x: 50, y: 50 },
        data: { label: 'Parent Subgraph' },
        childIds: ['child1']
      },
      {
        id: 'child1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        data: { label: 'Child Node' },
        parentId: 'sg1',
        childIds: []
      },
      {
        id: 'node2',
        type: 'circle',
        position: { x: 300, y: 100 },
        data: { label: 'Regular Node' },
        childIds: []
      }
    ]

    const rfNodes = toReactFlowNodes(nodes)
    
    // Subgraph should be first
    expect(rfNodes[0].id).toBe('sg1')
    
    // Check z-index hierarchy
    const sg = rfNodes.find(n => n.id === 'sg1')
    const child = rfNodes.find(n => n.id === 'child1')
    const regular = rfNodes.find(n => n.id === 'node2')
    
    expect(sg?.zIndex).toBe(-1000)
    expect(child?.zIndex).toBe(1000)
    expect(regular?.zIndex).toBe(1000)
    
    // Child node should be in foreground even though its parent is in background
    expect(child?.zIndex).toBeGreaterThan(sg?.zIndex || 0)
  })
})