import { Node, Edge } from 'reactflow'
import { 
  SequenceNode, SequenceEdge, SequenceBlock,
  ClassNode, ClassEdge,
  StateNode, StateEdge,
  ERNode, EREdge,
  FlowchartNode, FlowchartEdge
} from '../types/diagram'

// Flowchart Generator
export function generateFlowchartCode(nodes: Node[], edges: Edge[], direction: string = 'TD'): string {
  let code = `graph ${direction}\n`

  // Add nodes
  nodes.forEach((node) => {
    const flowNode = node as FlowchartNode
    const label = flowNode.data.label || flowNode.id
    const shape = flowNode.data.shape || 'rectangle'
    
    switch (shape) {
      case 'rectangle':
        code += `    ${flowNode.id}[${label}]\n`
        break
      case 'roundedRectangle':
        code += `    ${flowNode.id}(${label})\n`
        break
      case 'stadium':
        code += `    ${flowNode.id}([${label}])\n`
        break
      case 'subroutine':
        code += `    ${flowNode.id}[[${label}]]\n`
        break
      case 'cylindrical':
        code += `    ${flowNode.id}[(${label})]\n`
        break
      case 'circle':
        code += `    ${flowNode.id}((${label}))\n`
        break
      case 'asymmetric':
        code += `    ${flowNode.id}>>${label}]\n`
        break
      case 'rhombus':
        code += `    ${flowNode.id}{${label}}\n`
        break
      case 'hexagon':
        code += `    ${flowNode.id}{{${label}}}\n`
        break
      case 'parallelogram':
        code += `    ${flowNode.id}[/${label}/]\n`
        break
      case 'trapezoid':
        code += `    ${flowNode.id}[\\${label}/]\n`
        break
      case 'doubleCircle':
        code += `    ${flowNode.id}(((${label})))\n`
        break
      default:
        code += `    ${flowNode.id}[${label}]\n`
    }
  })

  if (edges.length > 0) {
    code += '\n'
    edges.forEach((edge) => {
      const flowEdge = edge as FlowchartEdge
      const style = flowEdge.data?.style || 'solid'
      const label = flowEdge.data?.label ? `|${flowEdge.data.label}|` : ''
      const hasArrow = flowEdge.data?.hasArrow !== false
      
      let edgeSymbol = '-->'
      if (style === 'dotted' && hasArrow) edgeSymbol = '-.->'
      if (style === 'dotted' && !hasArrow) edgeSymbol = '-.-'
      if (style === 'thick' && hasArrow) edgeSymbol = '==>'
      if (style === 'thick' && !hasArrow) edgeSymbol = '==='
      if (style === 'solid' && !hasArrow) edgeSymbol = '---'
      
      code += `    ${edge.source} ${edgeSymbol}${label} ${edge.target}\n`
    })
  }

  return code
}

// Sequence Diagram Generator
export function generateSequenceCode(
  nodes: Node[], 
  edges: Edge[], 
  blocks?: SequenceBlock[]
): string {
  let code = 'sequenceDiagram\n'
  
  // Add auto-numbering if any edge has sequence numbers
  const hasSequenceNumbers = edges.some(edge => {
    const seqEdge = edge as SequenceEdge
    return seqEdge.data?.sequence !== undefined
  })
  
  if (hasSequenceNumbers) {
    code += '    autonumber\n'
  }
  
  // Add participants
  nodes.forEach((node) => {
    const seqNode = node as SequenceNode
    const nodeType = seqNode.data.type === 'actor' ? 'actor' : 'participant'
    const alias = seqNode.data.alias ? ` as ${seqNode.data.alias}` : ''
    code += `    ${nodeType} ${seqNode.id}${alias}\n`
  })

  if (edges.length > 0 || blocks?.length) {
    code += '\n'
    
    // Add messages
    edges.forEach((edge) => {
      const seqEdge = edge as SequenceEdge
      const messageType = seqEdge.data?.messageType || 'solid'
      const label = seqEdge.data?.label || 'Message'
      
      let arrow = '->>'
      switch (messageType) {
        case 'solid': arrow = '->'; break
        case 'dotted': arrow = '-->>'; break
        case 'solidArrow': arrow = '->>'; break
        case 'dottedArrow': arrow = '-->>'; break
        case 'cross': arrow = '-x'; break
        case 'async': arrow = '-)'; break
        case 'bidirectional': arrow = '<->'; break
      }
      
      if (seqEdge.data?.activate) {
        code += `    activate ${edge.target}\n`
      }
      
      code += `    ${edge.source}${arrow}${edge.target}: ${label}\n`
      
      if (seqEdge.data?.deactivate) {
        code += `    deactivate ${edge.target}\n`
      }
    })
    
    // Add blocks
    blocks?.forEach((block) => {
      switch (block.type) {
        case 'loop':
          code += `    loop ${block.label}\n`
          // Add block content here
          code += `    end\n`
          break
        case 'alt':
          code += `    alt ${block.label}\n`
          // Add block content
          code += `    else\n`
          code += `    end\n`
          break
        case 'opt':
          code += `    opt ${block.label}\n`
          code += `    end\n`
          break
        case 'par':
          code += `    par ${block.label}\n`
          code += `    and\n`
          code += `    end\n`
          break
        case 'critical':
          code += `    critical ${block.label}\n`
          code += `    option\n`
          code += `    end\n`
          break
        case 'rect':
          const color = block.color || 'rgb(0, 0, 0)'
          code += `    rect ${color}\n`
          code += `    end\n`
          break
        case 'break':
          code += `    break ${block.label}\n`
          code += `    end\n`
          break
      }
    })
  }

  return code
}

// Class Diagram Generator
export function generateClassCode(nodes: Node[], edges: Edge[]): string {
  let code = 'classDiagram\n'
  
  // Add classes
  nodes.forEach((node) => {
    const classNode = node as ClassNode
    
    code += `    class ${classNode.id} {\n`
    
    if (classNode.data.stereotype) {
      code += `        <<${classNode.data.stereotype}>>\n`
    }
    
    // Add attributes
    classNode.data.attributes.forEach((attr) => {
      const visibility = attr.visibility
      const staticModifier = attr.isStatic ? '$' : ''
      const abstractModifier = attr.isAbstract ? '*' : ''
      code += `        ${visibility}${attr.type} ${attr.name}${staticModifier}${abstractModifier}\n`
    })
    
    // Add methods
    classNode.data.methods.forEach((method) => {
      const visibility = method.visibility
      const staticModifier = method.isStatic ? '$' : ''
      const abstractModifier = method.isAbstract ? '*' : ''
      const params = method.parameters.join(', ')
      const returnType = method.returnType ? ` ${method.returnType}` : ''
      code += `        ${visibility}${method.name}(${params})${returnType}${staticModifier}${abstractModifier}\n`
    })
    
    code += `    }\n`
  })

  if (edges.length > 0) {
    code += '\n'
    edges.forEach((edge) => {
      const classEdge = edge as ClassEdge
      const relationType = classEdge.data?.relationType || 'association'
      const label = classEdge.data?.label ? ` : ${classEdge.data.label}` : ''
      const sourceCard = classEdge.data?.sourceCardinality || ''
      const targetCard = classEdge.data?.targetCardinality || ''
      const cardinality = sourceCard || targetCard ? ` "${sourceCard}" "${targetCard}"` : ''
      
      let edgeSymbol = '-->'
      switch (relationType) {
        case 'inheritance': edgeSymbol = '<|--'; break
        case 'composition': edgeSymbol = '*--'; break
        case 'aggregation': edgeSymbol = 'o--'; break
        case 'association': edgeSymbol = '-->'; break
        case 'dependency': edgeSymbol = '..>'; break
        case 'realization': edgeSymbol = '..|>'; break
      }
      
      code += `    ${edge.source} ${edgeSymbol} ${edge.target}${label}${cardinality}\n`
    })
  }

  return code
}

// ER Diagram Generator
export function generateERCode(nodes: Node[], edges: Edge[]): string {
  let code = 'erDiagram\n'
  
  // Add entities
  nodes.forEach((node) => {
    const erNode = node as ERNode
    
    code += `    ${erNode.id} {\n`
    
    if (erNode.data.attributes.length === 0) {
      code += `        string id PK "Primary Key"\n`
    } else {
      erNode.data.attributes.forEach((attr) => {
        const constraints: string[] = []
        if (attr.isPrimaryKey) constraints.push('PK')
        if (attr.isForeignKey) constraints.push('FK')
        if (attr.isUnique) constraints.push('UK')
        const constraintStr = constraints.length > 0 ? ` ${constraints.join(',')}` : ''
        const comment = attr.name !== attr.name.toLowerCase() ? ` "${attr.name}"` : ''
        code += `        ${attr.type} ${attr.name}${constraintStr}${comment}\n`
      })
    }
    
    code += `    }\n`
  })

  if (edges.length > 0) {
    code += '\n'
    edges.forEach((edge) => {
      const erEdge = edge as EREdge
      const label = erEdge.data?.label || 'relates to'
      
      // Convert cardinality to Mermaid notation
      const convertCardinality = (card: string) => {
        switch (card) {
          case '0..1': return '|o'
          case '1..1': return '||'
          case '0..*': return '}o'
          case '1..*': return '}|'
          default: return '||'
        }
      }
      
      const sourceCard = convertCardinality(erEdge.data?.sourceCardinality || '1..1')
      const targetCard = convertCardinality(erEdge.data?.targetCardinality || '1..1')
      const lineStyle = erEdge.data?.relationshipType === 'non-identifying' ? '..' : '--'
      
      code += `    ${edge.source} ${sourceCard}${lineStyle}${targetCard} ${edge.target} : "${label}"\n`
    })
  }

  return code
}

// State Diagram Generator
export function generateStateCode(nodes: Node[], edges: Edge[]): string {
  let code = 'stateDiagram-v2\n'
  
  // Group nodes by composite states
  const compositeStates = new Map<string, StateNode[]>()
  const topLevelNodes: StateNode[] = []
  
  nodes.forEach((node) => {
    const stateNode = node as StateNode
    if (stateNode.data.isComposite) {
      compositeStates.set(stateNode.id, [])
    }
    topLevelNodes.push(stateNode)
  })
  
  // Add states
  topLevelNodes.forEach((node) => {
    const stateNode = node as StateNode
    
    switch (stateNode.data.type) {
      case 'start':
        // Start states are handled in transitions
        break
      case 'end':
        // End states are handled in transitions
        break
      case 'choice':
        code += `    state ${stateNode.id} <<choice>>\n`
        break
      case 'fork':
        code += `    state ${stateNode.id} <<fork>>\n`
        break
      case 'join':
        code += `    state ${stateNode.id} <<join>>\n`
        break
      default:
        if (stateNode.data.isComposite) {
          code += `    state ${stateNode.id} {\n`
          const children = compositeStates.get(stateNode.id) || []
          children.forEach((child) => {
            code += `        ${child.id} : ${child.data.label}\n`
          })
          code += `    }\n`
        } else {
          const label = stateNode.data.label || stateNode.id
          if (label !== stateNode.id) {
            code += `    ${stateNode.id} : ${label}\n`
          }
        }
    }
  })

  if (edges.length > 0) {
    code += '\n'
    edges.forEach((edge) => {
      const stateEdge = edge as StateEdge
      const transitionType = stateEdge.data?.transitionType || 'normal'
      const label = stateEdge.data?.label ? ` : ${stateEdge.data.label}` : ''
      const sourceNode = nodes.find(n => n.id === edge.source) as StateNode
      const targetNode = nodes.find(n => n.id === edge.target) as StateNode
      
      const source = sourceNode?.data.type === 'start' ? '[*]' : edge.source
      const target = targetNode?.data.type === 'end' ? '[*]' : edge.target
      
      // Handle different transition types
      let transitionLine = '-->'
      switch (transitionType) {
        case 'internal':
          // Internal transitions stay within the same state
          code += `    ${source} : do / ${label || 'internal action'}\n`
          return
        case 'entry':
          code += `    ${source} : entry / ${label || 'entry action'}\n`
          return
        case 'exit':
          code += `    ${source} : exit / ${label || 'exit action'}\n`
          return
        default:
          transitionLine = '-->'
          break
      }
      
      code += `    ${source} ${transitionLine} ${target}${label}\n`
    })
  }

  return code
}