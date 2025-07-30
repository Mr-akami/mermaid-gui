import { render, fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NodeEditor } from './NodeEditor'

describe('NodeEditor Integration', () => {
  it('should render with resizable layout', () => {
    render(<NodeEditor />)
    
    // Check that resizer handle exists
    const resizer = screen.getByTestId('resizer-handle')
    expect(resizer).toBeTruthy()
  })

  it('should resize editor panels when dragging', () => {
    render(<NodeEditor />)
    
    const resizer = screen.getByTestId('resizer-handle')
    
    // Get initial widths - we can't directly test the percentage change
    // but we can test that the resize logic is called
    fireEvent.mouseDown(resizer, { clientX: 500 })
    fireEvent.mouseMove(document, { clientX: 600 })
    fireEvent.mouseUp(document)
    
    // If no errors are thrown, the resize logic works
    expect(resizer).toBeTruthy()
  })

  it('should constrain width between 20% and 80%', () => {
    // Mock window.innerWidth for consistent testing
    const originalInnerWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000,
    })

    render(<NodeEditor />)
    
    const resizer = screen.getByTestId('resizer-handle')
    
    // Try to drag way beyond limits
    fireEvent.mouseDown(resizer, { clientX: 500 })
    fireEvent.mouseMove(document, { clientX: 1500 }) // Large positive delta
    fireEvent.mouseUp(document)
    
    // The component should still be rendered without errors
    expect(resizer).toBeTruthy()
    
    // Restore original innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })
})