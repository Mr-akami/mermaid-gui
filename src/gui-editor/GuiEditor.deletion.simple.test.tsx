import { describe, it, expect } from 'vitest'
import { page } from '@vitest/browser/context'
import { render } from '@testing-library/react'
import { App } from '../app/App.tsx'

describe('GuiEditor - Node Deletion (Simple)', () => {
  const setup = () => {
    render(<App />)
  }

  it('should delete selected node when Delete key is pressed', async () => {
    setup()
    
    // Wait a bit for React Flow to initialize
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Add nodes by clicking on the canvas
    const pane = page.locator('.react-flow__pane')
    await pane.click({ position: { x: 100, y: 100 } })
    await pane.click({ position: { x: 300, y: 100 } })
    
    // Wait for nodes to appear
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check nodes exist
    const rect1 = page.getByText('Rect1')
    const rect2 = page.getByText('Rect2')
    await expect.element(rect1).toBeVisible()
    await expect.element(rect2).toBeVisible()
    
    // Click on the first node to select it
    await rect1.click()
    
    // Wait for selection
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Press Delete key
    await page.keyboard.press('Delete')
    
    // Wait for deletion
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Verify node is deleted
    await expect.element(rect1).not.toBeVisible()
    await expect.element(rect2).toBeVisible()
  })
})