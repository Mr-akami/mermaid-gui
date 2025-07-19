// Enhanced setup for D3 drag tests
import { beforeEach, vi } from 'vitest'

// Add missing global properties that d3-drag expects
beforeEach(() => {
  // d3-drag expects window.view to exist
  Object.defineProperty(window, 'view', {
    value: window,
    writable: true,
    configurable: true
  })

  // Add SVGElement constructor
  if (!global.SVGElement) {
    global.SVGElement = global.Element as any
  }

  // Add PointerEvent
  if (!global.PointerEvent) {
    global.PointerEvent = global.MouseEvent as any
  }

  // Add TouchEvent
  if (!global.TouchEvent) {
    global.TouchEvent = class TouchEvent extends Event {
      touches: any[] = []
      targetTouches: any[] = []
      changedTouches: any[] = []
      constructor(type: string, init?: any) {
        super(type, init)
        if (init) {
          this.touches = init.touches || []
          this.targetTouches = init.targetTouches || []
          this.changedTouches = init.changedTouches || []
        }
      }
    } as any
  }

  // Enhance event handling for d3-drag
  const originalAddEventListener = HTMLElement.prototype.addEventListener
  HTMLElement.prototype.addEventListener = function(this: HTMLElement, type: string, listener: any, options?: any) {
    const wrappedListener = function(this: HTMLElement, event: Event) {
      // Ensure event has necessary properties for d3-drag
      if (event instanceof MouseEvent && !event.view) {
        Object.defineProperty(event, 'view', {
          value: window,
          writable: false,
          configurable: true
        })
      }
      return listener.call(this, event)
    }
    return originalAddEventListener.call(this, type, wrappedListener, options)
  }
})