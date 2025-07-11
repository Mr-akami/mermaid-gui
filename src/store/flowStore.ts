import { atom } from 'jotai'
import { Node, Edge } from 'reactflow'
import { diagramTypeAtom } from './diagramStore'

export const nodesAtom = atom<Node[]>([])
export const edgesAtom = atom<Edge[]>([])

export const mermaidCodeAtom = atom((get) => {
  const nodes = get(nodesAtom)
  const edges = get(edgesAtom)
  const diagramType = get(diagramTypeAtom)

  if (nodes.length === 0) {
    return ''
  }

  switch (diagramType) {
    case 'flowchart':
      return generateFlowchartCode(nodes, edges)
    case 'sequence':
      return generateSequenceCode(nodes, edges)
    case 'class':
      return generateClassCode(nodes, edges)
    case 'er':
      return generateERCode(nodes, edges)
    case 'state':
      return generateStateCode(nodes, edges)
    default:
      return generateFlowchartCode(nodes, edges)
  }
})

function generateFlowchartCode(nodes: Node[], edges: Edge[]): string {
  let code = 'graph TD\n'

  // Add nodes
  nodes.forEach((node) => {
    const label = node.data.label || node.id
    const shape = node.data.shape || 'rectangle'
    
    switch (shape) {
      case 'rectangle':
        code += `    ${node.id}[${label}]\n`
        break
      case 'circle':
        code += `    ${node.id}((${label}))\n`
        break
      case 'diamond':
        code += `    ${node.id}{${label}}\n`
        break
      default:
        code += `    ${node.id}[${label}]\n`
    }
  })

  if (edges.length > 0) {
    code += '\n'
    // Add edges
    edges.forEach((edge) => {
      code += `    ${edge.source} --> ${edge.target}\n`
    })
  }

  return code
}

function generateSequenceCode(nodes: Node[], edges: Edge[]): string {
  let code = 'sequenceDiagram\n'
  
  // In sequence diagrams, nodes are participants
  nodes.forEach((node) => {
    const label = node.data.label || node.id
    code += `    participant ${node.id} as ${label}\n`
  })

  if (edges.length > 0) {
    code += '\n'
    // Edges are messages
    edges.forEach((edge) => {
      code += `    ${edge.source}->>${edge.target}: Message\n`
    })
  }

  return code
}

function generateClassCode(nodes: Node[], edges: Edge[]): string {
  let code = 'classDiagram\n'
  
  // Nodes are classes
  nodes.forEach((node) => {
    const label = node.data.label || node.id
    code += `    class ${node.id} {\n`
    code += `        ${label}\n`
    code += `    }\n`
  })

  if (edges.length > 0) {
    code += '\n'
    // Edges are relationships
    edges.forEach((edge) => {
      code += `    ${edge.source} --> ${edge.target}\n`
    })
  }

  return code
}

function generateERCode(nodes: Node[], edges: Edge[]): string {
  let code = 'erDiagram\n'
  
  // Nodes are entities
  nodes.forEach((node) => {
    const label = node.data.label || node.id
    code += `    ${node.id} {\n`
    code += `        string name "${label}"\n`
    code += `    }\n`
  })

  if (edges.length > 0) {
    code += '\n'
    // Edges are relationships
    edges.forEach((edge) => {
      code += `    ${edge.source} ||--|| ${edge.target} : "relates to"\n`
    })
  }

  return code
}

function generateStateCode(nodes: Node[], edges: Edge[]): string {
  let code = 'stateDiagram-v2\n'
  
  // Nodes are states
  nodes.forEach((node) => {
    const label = node.data.label || node.id
    if (node.data.shape === 'circle') {
      code += `    [*] --> ${node.id}\n`
    } else {
      code += `    state "${label}" as ${node.id}\n`
    }
  })

  if (edges.length > 0) {
    code += '\n'
    // Edges are transitions
    edges.forEach((edge) => {
      code += `    ${edge.source} --> ${edge.target}\n`
    })
  }

  return code
}