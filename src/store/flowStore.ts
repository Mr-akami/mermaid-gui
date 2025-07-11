import { atom } from 'jotai'
import { Node, Edge } from 'reactflow'
import { diagramTypeAtom, flowchartDirectionAtom } from './diagramStore'
import {
  generateFlowchartCode,
  generateSequenceCode,
  generateClassCode,
  generateERCode,
  generateStateCode
} from '../utils/mermaidGenerators'
import { SequenceBlock } from '../types/diagram'

export const nodesAtom = atom<Node[]>([])
export const edgesAtom = atom<Edge[]>([])
export const sequenceBlocksAtom = atom<SequenceBlock[]>([])

export const mermaidCodeAtom = atom((get) => {
  const nodes = get(nodesAtom)
  const edges = get(edgesAtom)
  const diagramType = get(diagramTypeAtom)
  const sequenceBlocks = get(sequenceBlocksAtom)
  const flowchartDirection = get(flowchartDirectionAtom)

  if (nodes.length === 0) {
    return ''
  }

  switch (diagramType) {
    case 'flowchart':
      return generateFlowchartCode(nodes, edges, flowchartDirection)
    case 'sequence':
      return generateSequenceCode(nodes, edges, sequenceBlocks)
    case 'class':
      return generateClassCode(nodes, edges)
    case 'er':
      return generateERCode(nodes, edges)
    case 'state':
      return generateStateCode(nodes, edges)
    default:
      return generateFlowchartCode(nodes, edges, flowchartDirection)
  }
})