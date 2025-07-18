import { describe, it, expect } from 'vitest'

describe('Diamond Handle Position Calculations', () => {
  it('should calculate correct positions for diamond handles', () => {
    // Diamond is a square rotated 45 degrees
    // For a 100x100 diamond, the vertices are at:
    const size = 100
    const halfSize = size / 2
    const offset = 6 // Handle offset to appear on boundary
    
    // Vertices (corners of the diamond)
    const vertices = {
      top: { x: halfSize, y: 0 },
      right: { x: size, y: halfSize },
      bottom: { x: halfSize, y: size },
      left: { x: 0, y: halfSize }
    }
    
    // Edge midpoints (middle of each edge)
    const edgeMidpoints = {
      topRight: {
        x: (vertices.top.x + vertices.right.x) / 2,
        y: (vertices.top.y + vertices.right.y) / 2
      },
      rightBottom: {
        x: (vertices.right.x + vertices.bottom.x) / 2,
        y: (vertices.right.y + vertices.bottom.y) / 2
      },
      bottomLeft: {
        x: (vertices.bottom.x + vertices.left.x) / 2,
        y: (vertices.bottom.y + vertices.left.y) / 2
      },
      leftTop: {
        x: (vertices.left.x + vertices.top.x) / 2,
        y: (vertices.left.y + vertices.top.y) / 2
      }
    }
    
    // Verify vertex positions
    expect(vertices.top).toEqual({ x: 50, y: 0 })
    expect(vertices.right).toEqual({ x: 100, y: 50 })
    expect(vertices.bottom).toEqual({ x: 50, y: 100 })
    expect(vertices.left).toEqual({ x: 0, y: 50 })
    
    // Verify edge midpoint positions
    expect(edgeMidpoints.topRight).toEqual({ x: 75, y: 25 })
    expect(edgeMidpoints.rightBottom).toEqual({ x: 75, y: 75 })
    expect(edgeMidpoints.bottomLeft).toEqual({ x: 25, y: 75 })
    expect(edgeMidpoints.leftTop).toEqual({ x: 25, y: 25 })
    
    // For handles to appear on the diamond outline, they need offsets
    // based on the direction they're facing
    const handlePositions = {
      // Top vertex - offset upward
      top: { left: '50%', top: `-${offset}px` },
      
      // Right vertex - offset rightward
      right: { right: `-${offset}px`, top: '50%' },
      
      // Bottom vertex - offset downward
      bottom: { left: '50%', bottom: `-${offset}px` },
      
      // Left vertex - offset leftward
      left: { left: `-${offset}px`, top: '50%' },
      
      // Top-right edge - offset diagonally
      topRight: { 
        left: `${edgeMidpoints.topRight.x}px`, 
        top: `${edgeMidpoints.topRight.y - offset}px` 
      },
      
      // Bottom-right edge - offset diagonally
      bottomRight: { 
        left: `${edgeMidpoints.rightBottom.x}px`, 
        bottom: `${size - edgeMidpoints.rightBottom.y - offset}px` 
      },
      
      // Bottom-left edge - offset diagonally
      bottomLeft: { 
        left: `${edgeMidpoints.bottomLeft.x}px`, 
        bottom: `${size - edgeMidpoints.bottomLeft.y - offset}px` 
      },
      
      // Top-left edge - offset diagonally
      topLeft: { 
        left: `${edgeMidpoints.leftTop.x - offset}px`, 
        top: `${edgeMidpoints.leftTop.y}px` 
      }
    }
    
    // Verify handle positions are correctly calculated
    expect(handlePositions.top.top).toBe('-6px')
    expect(handlePositions.right.right).toBe('-6px')
    expect(handlePositions.bottom.bottom).toBe('-6px')
    expect(handlePositions.left.left).toBe('-6px')
  })
  
  it('should position edge handles on diamond outline', () => {
    // For a diamond, edge handles need to be offset perpendicular to the edge
    const halfSize = 50
    const offset = 6
    
    // Top-right edge: slopes down-right at 45 degrees
    // Normal vector points up-right, so offset should be up and right
    const topRightOffset = {
      x: offset * Math.cos(Math.PI/4), // ~4.24px right
      y: -offset * Math.sin(Math.PI/4) // ~4.24px up
    }
    
    // The handle at (75, 25) should be offset to (~79.24, ~20.76)
    const topRightHandle = {
      x: 75 + topRightOffset.x,
      y: 25 + topRightOffset.y
    }
    
    expect(topRightHandle.x).toBeCloseTo(79.24, 1)
    expect(topRightHandle.y).toBeCloseTo(20.76, 1)
  })
})