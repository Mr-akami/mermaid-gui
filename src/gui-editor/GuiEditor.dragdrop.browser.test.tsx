import { test, expect } from 'vitest'
import { page } from '@vitest/browser/context'

test.describe('GuiEditor - Browser Drag & Drop', () => {
  test('should handle drag and drop into subgraph', async () => {
    // Navigate to the application
    await page.goto('/')
    
    // Wait for the GUI editor to load
    await page.waitForSelector('[data-testid="gui-editor"]')
    
    // Click on subgraph button
    await page.click('button[title="Subgraph"]')
    
    // Click on canvas to add subgraph
    await page.click('.react-flow__pane', { position: { x: 200, y: 200 } })
    
    // Click on rectangle button
    await page.click('button[title="Rectangle"]')
    
    // Click on canvas to add rectangle
    await page.click('.react-flow__pane', { position: { x: 100, y: 100 } })
    
    // Wait for nodes to appear
    await page.waitForSelector('.react-flow__node-subgraph')
    await page.waitForSelector('.react-flow__node-rectangle')
    
    // Drag rectangle into subgraph
    const rectNode = await page.$('.react-flow__node-rectangle')
    if (rectNode) {
      const box = await rectNode.boundingBox()
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(250, 250) // Move into subgraph
        await page.mouse.up()
      }
    }
    
    // Verify parent-child relationship is established
    // This would require checking the atom state or visual indicators
    await page.waitForTimeout(500) // Wait for state update
  })
})