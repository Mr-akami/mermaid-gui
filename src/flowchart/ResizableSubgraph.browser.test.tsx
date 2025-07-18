import { describe, it, expect } from 'vitest'
import { page } from '@vitest/browser/context'
import { render } from '@testing-library/react'
import { App } from '../app/App.tsx'

describe('ResizableSubgraph Browser Test', () => {
  const setup = () => {
    render(<App />)
  }

  it('should show resize handles when subgraph is selected', async () => {
    setup()
    
    // Wait for the GUI Editor to be visible
    await page.waitForSelector('[data-testid="gui-editor"]')
    
    // Add a subgraph by clicking the button in the toolbar
    const subgraphButton = await page.locator('button[title="Subgraph"]')
    await subgraphButton.click()

    // Click on the React Flow pane to add subgraph
    const pane = await page.locator('.react-flow__pane')
    await pane.click({ position: { x: 200, y: 200 } })

    // Wait for subgraph to appear
    const subgraph = page.getByText('New subgraph')
    await expect.element(subgraph).toBeVisible()

    // Select the subgraph
    await subgraph.click()

    // Check resize handles are visible
    const resizeControl = page.locator('.react-flow__resize-control')
    await expect.element(resizeControl).toBeVisible()
  })

  it('should resize subgraph when dragging handles', async () => {
    setup()
    
    // Wait for the GUI Editor to be visible
    await page.waitForSelector('[data-testid="gui-editor"]')
    
    // Add a subgraph
    const subgraphButton = await page.locator('button[title="Subgraph"]')
    await subgraphButton.click()

    const pane = await page.locator('.react-flow__pane')
    await pane.click({ position: { x: 200, y: 200 } })

    // Select the subgraph
    const subgraph = page.getByText('New subgraph')
    await subgraph.click()

    // Get the subgraph element with node class
    const subgraphNode = page.locator('.react-flow__node-subgraph').first()
    
    // Get initial size from style attribute
    const initialStyle = await subgraphNode.getAttribute('style')
    const initialWidth = initialStyle?.match(/width:\s*(\d+)px/)?.[1]
    const initialHeight = initialStyle?.match(/height:\s*(\d+)px/)?.[1]

    expect(initialWidth).toBeTruthy()
    expect(initialHeight).toBeTruthy()

    // Find and drag the resize handle
    const resizeHandle = page.locator('.react-flow__resize-control__handle-se')
    const handleBox = await resizeHandle.boundingBox()
    
    if (handleBox) {
      await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
      await page.mouse.down()
      await page.mouse.move(handleBox.x + 100, handleBox.y + 100)
      await page.mouse.up()
    }

    // Check new size
    const newStyle = await subgraphNode.getAttribute('style')
    const newWidth = newStyle?.match(/width:\s*(\d+)px/)?.[1]
    const newHeight = newStyle?.match(/height:\s*(\d+)px/)?.[1]

    expect(Number(newWidth)).toBeGreaterThan(Number(initialWidth))
    expect(Number(newHeight)).toBeGreaterThan(Number(initialHeight))
  })

  it('should have default size 4x normal node size', async () => {
    setup()
    
    // Wait for the GUI Editor to be visible
    await page.waitForSelector('[data-testid="gui-editor"]')
    
    // Add a rectangle
    const rectButton = await page.locator('button[title="Rectangle"]')
    await rectButton.click()
    
    const pane = await page.locator('.react-flow__pane')
    await pane.click({ position: { x: 100, y: 100 } })

    // Add a subgraph
    const subgraphButton = await page.locator('button[title="Subgraph"]')
    await subgraphButton.click()
    await pane.click({ position: { x: 300, y: 100 } })

    // Get the elements
    const rectNode = page.locator('.react-flow__node-rectangle').first()
    const subgraphNode = page.locator('.react-flow__node-subgraph').first()

    // Get sizes from style attributes
    const rectStyle = await rectNode.getAttribute('style')
    const subgraphStyle = await subgraphNode.getAttribute('style')

    const rectWidth = Number(rectStyle?.match(/width:\s*(\d+)px/)?.[1])
    const subgraphWidth = Number(subgraphStyle?.match(/width:\s*(\d+)px/)?.[1])

    // Verify subgraph is 4x the width
    expect(subgraphWidth).toBe(rectWidth * 4)
  })
})