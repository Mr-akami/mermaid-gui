import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ResizableSubgraph } from './ResizableSubgraph'
import type { NodeProps } from '@xyflow/react'
import { ReactFlowProvider } from '@xyflow/react'

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('ResizableSubgraph - Transparency', () => {
  const defaultProps: NodeProps = {
    id: 'subgraph1',
    type: 'subgraph',
    data: { label: 'Test Subgraph' },
    xPos: 0,
    yPos: 0,
    selected: false,
    zIndex: 0,
    isConnectable: true,
    targetPosition: undefined,
    sourcePosition: undefined,
    dragging: false,
  }

  it('should have transparent or semi-transparent background', () => {
    const { container } = render(<ResizableSubgraph {...defaultProps} />, {
      wrapper: Wrapper,
    })
    
    // Find the subgraph content div (now with opacity)
    const subgraphContent = container.querySelector('[class*="bg-purple-100"]')
    expect(subgraphContent).toBeTruthy()
    
    // Check that it has opacity or transparent background
    const styles = window.getComputedStyle(subgraphContent!)
    const backgroundColor = styles.backgroundColor
    const opacity = styles.opacity
    
    // Either the background should be semi-transparent (rgba with alpha < 1)
    // or the element should have opacity < 1
    const isTransparent = backgroundColor.includes('rgba') && backgroundColor.includes('0.') ||
                         opacity !== '1'
    
    expect(isTransparent).toBe(true)
  })

  it('should have transparent background allowing child nodes to be visible', () => {
    const { container } = render(<ResizableSubgraph {...defaultProps} />, {
      wrapper: Wrapper,
    })
    
    // Find the main content div that would contain children
    const contentDiv = container.querySelector('[class*="bg-purple-100"]')
    expect(contentDiv).toBeTruthy()
    
    // Should have either bg-purple-100/20 (Tailwind opacity) or similar
    const className = contentDiv!.className
    expect(className).toMatch(/bg-purple-100\/\d{1,2}|bg-transparent/)
  })
})