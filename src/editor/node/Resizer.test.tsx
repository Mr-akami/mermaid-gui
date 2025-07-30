import { render, fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Resizer } from './Resizer'

describe('Resizer', () => {
  it('should render resizer handle', () => {
    const onResize = vi.fn()
    render(<Resizer onResize={onResize} />)
    
    const handle = screen.getByTestId('resizer-handle')
    expect(handle).toBeTruthy()
  })

  it('should have correct cursor style', () => {
    const onResize = vi.fn()
    render(<Resizer onResize={onResize} />)
    
    const handle = screen.getByTestId('resizer-handle')
    expect(handle.className).toContain('cursor-col-resize')
  })

  it('should call onResize when dragged', () => {
    const onResize = vi.fn()
    render(<Resizer onResize={onResize} />)
    
    const handle = screen.getByTestId('resizer-handle')
    
    // Simulate mouse down
    fireEvent.mouseDown(handle, { clientX: 100 })
    
    // Simulate mouse move
    fireEvent.mouseMove(document, { clientX: 150 })
    
    // Simulate mouse up
    fireEvent.mouseUp(document)
    
    expect(onResize).toHaveBeenCalledWith(50)
  })

  it('should not call onResize when not dragging', () => {
    const onResize = vi.fn()
    render(<Resizer onResize={onResize} />)
    
    // Simulate mouse move without mousedown
    fireEvent.mouseMove(document, { clientX: 150 })
    
    expect(onResize).not.toHaveBeenCalled()
  })

  it('should stop dragging on mouse up', () => {
    const onResize = vi.fn()
    render(<Resizer onResize={onResize} />)
    
    const handle = screen.getByTestId('resizer-handle')
    
    // Start dragging
    fireEvent.mouseDown(handle, { clientX: 100 })
    fireEvent.mouseMove(document, { clientX: 150 })
    fireEvent.mouseUp(document)
    
    // Clear mock calls
    onResize.mockClear()
    
    // Move mouse again (should not trigger onResize)
    fireEvent.mouseMove(document, { clientX: 200 })
    
    expect(onResize).not.toHaveBeenCalled()
  })

  it('should prevent text selection during drag', () => {
    const onResize = vi.fn()
    render(<Resizer onResize={onResize} />)
    
    const handle = screen.getByTestId('resizer-handle')
    
    fireEvent.mouseDown(handle, { clientX: 100 })
    
    // Check if user-select is disabled on body during drag
    expect(document.body.style.userSelect).toBe('none')
    
    fireEvent.mouseUp(document)
    
    // Check if user-select is restored after drag
    expect(document.body.style.userSelect).toBe('')
  })
})