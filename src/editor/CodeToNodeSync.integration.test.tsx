import { render, screen, fireEvent } from '@testing-library/react'
import { Provider as JotaiProvider, createStore } from 'jotai'
import { NodeEditor } from './node/NodeEditor'

// Test the bidirectional sync between code editor and node editor
describe('Code to Node Editor Sync', () => {
  test('should render NodeEditor with code editor', () => {
    const store = createStore()
    
    render(
      <JotaiProvider store={store}>
        <NodeEditor />
      </JotaiProvider>
    )

    // Find the code editor textarea
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeTruthy()
    
    // Find the Mermaid Code title
    expect(screen.getByText('Mermaid Code')).toBeTruthy()
  })

  test('should show error for invalid mermaid code', () => {
    const store = createStore()
    
    render(
      <JotaiProvider store={store}>
        <NodeEditor />
      </JotaiProvider>
    )

    const textarea = screen.getByRole('textbox')
    fireEvent.focus(textarea)
    fireEvent.change(textarea, { 
      target: { value: 'invalid mermaid syntax' } 
    })

    // Error should appear immediately without waitFor
    expect(screen.getByText(/Invalid syntax/)).toBeTruthy()
  })
})