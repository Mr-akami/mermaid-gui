import { vi } from 'vitest'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock DOMRect
global.DOMRect = vi.fn().mockImplementation(() => ({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  toJSON: () => ({}),
})) as any

// Add the static fromRect method
global.DOMRect.fromRect = vi.fn().mockImplementation((other) => ({
  x: other?.x || 0,
  y: other?.y || 0,
  width: other?.width || 0,
  height: other?.height || 0,
  top: other?.y || 0,
  right: (other?.x || 0) + (other?.width || 0),
  bottom: (other?.y || 0) + (other?.height || 0),
  left: other?.x || 0,
  toJSON: () => ({}),
}))