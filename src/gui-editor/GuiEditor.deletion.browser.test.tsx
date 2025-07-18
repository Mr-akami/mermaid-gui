import { describe, it, expect } from 'vitest'
import { page } from '@vitest/browser/context'
import { render } from '@testing-library/react'
import { App } from '../app/App.tsx'

describe('GuiEditor - Node Deletion (Browser)', () => {
  const setup = () => {
    render(<App />)
  }

  it('should delete selected node when Delete key is pressed', async () => {
    setup()
    
    // Wait for the GUI Editor to be visible
    await page.waitForSelector('[data-testid="gui-editor"]')
    
    // Add nodes by clicking on the canvas
    const pane = await page.locator('.react-flow__pane')
    await pane.click({ position: { x: 100, y: 100 } })
    await pane.click({ position: { x: 300, y: 100 } })
    
    // Wait for nodes to appear
    const rect1 = page.getByText('Rect1')
    const rect2 = page.getByText('Rect2')
    await expect.element(rect1).toBeVisible()
    await expect.element(rect2).toBeVisible()
    
    // Click on the first node to select it
    await rect1.click()
    
    // Wait for selection
    const selectedNode = page.locator('.react-flow__node.selected')
    await expect.element(selectedNode).toBeVisible()
    
    // Press Delete key
    await page.keyboard.press('Delete')
    
    // Verify node is deleted
    await expect.element(rect1).not.toBeVisible()
    await expect.element(rect2).toBeVisible()
  })

  it('should delete selected node when Backspace key is pressed', async () => {
    setup()
    
    // Wait for the GUI Editor to be visible
    await page.waitForSelector('[data-testid="gui-editor"]')
    
    // Add nodes by clicking on the canvas
    const pane = await page.locator('.react-flow__pane')
    await pane.click({ position: { x: 100, y: 100 } })
    await pane.click({ position: { x: 300, y: 100 } })
    
    // Wait for nodes to appear
    const rect1 = page.getByText('Rect1')
    const rect2 = page.getByText('Rect2')
    await expect.element(rect1).toBeVisible()
    await expect.element(rect2).toBeVisible()
    
    // Click on the first node to select it
    await rect1.click()
    
    // Wait for selection
    const selectedNode = page.locator('.react-flow__node.selected')
    await expect.element(selectedNode).toBeVisible()
    
    // Press Backspace key
    await page.keyboard.press('Backspace')
    
    // Verify node is deleted
    await expect.element(rect1).not.toBeVisible()
    await expect.element(rect2).toBeVisible()
  })

  it('should delete multiple selected nodes', async () => {
    setup()
    
    // Wait for the GUI Editor to be visible
    await page.waitForSelector('[data-testid="gui-editor"]')
    
    // Add nodes by clicking on the canvas
    const pane = await page.locator('.react-flow__pane')
    await pane.click({ position: { x: 100, y: 100 } })
    await pane.click({ position: { x: 300, y: 100 } })
    await pane.click({ position: { x: 200, y: 200 } })
    
    // Wait for nodes to appear
    const rect1 = page.getByText('Rect1')
    const rect2 = page.getByText('Rect2')
    const rect3 = page.getByText('Rect3')
    await expect.element(rect1).toBeVisible()
    await expect.element(rect2).toBeVisible()
    await expect.element(rect3).toBeVisible()
    
    // Select first node
    await rect1.click()
    
    // Hold Shift and select second node
    await page.keyboard.down('Shift')
    await rect2.click()
    await page.keyboard.up('Shift')
    
    // Wait for multiple selection
    await page.waitForFunction(() => {
      const selectedNodes = document.querySelectorAll('.react-flow__node.selected')
      return selectedNodes.length === 2
    })
    
    // Press Delete key
    await page.keyboard.press('Delete')
    
    // Verify nodes are deleted
    await expect.element(rect1).not.toBeVisible()
    await expect.element(rect2).not.toBeVisible()
    await expect.element(rect3).toBeVisible()
  })

  it('should not delete nodes when no node is selected', async () => {
    setup()
    
    // Wait for the GUI Editor to be visible
    await page.waitForSelector('[data-testid="gui-editor"]')
    
    // Add nodes by clicking on the canvas
    const pane = await page.locator('.react-flow__pane')
    await pane.click({ position: { x: 100, y: 100 } })
    await pane.click({ position: { x: 300, y: 100 } })
    
    // Wait for nodes to appear
    const rect1 = page.getByText('Rect1')
    const rect2 = page.getByText('Rect2')
    await expect.element(rect1).toBeVisible()
    await expect.element(rect2).toBeVisible()
    
    // Click on the canvas to deselect
    await pane.click({ position: { x: 50, y: 50 } })
    
    // Press Delete key
    await page.keyboard.press('Delete')
    
    // Verify nodes still exist
    await expect.element(rect1).toBeVisible()
    await expect.element(rect2).toBeVisible()
  })

  it('should delete edges connected to deleted nodes', async () => {
    setup()
    
    // Wait for the GUI Editor to be visible
    await page.waitForSelector('[data-testid="gui-editor"]')
    
    // Add nodes by clicking on the canvas
    const pane = await page.locator('.react-flow__pane')
    await pane.click({ position: { x: 100, y: 100 } })
    await pane.click({ position: { x: 300, y: 100 } })
    
    // Wait for nodes to appear
    const rect1 = page.getByText('Rect1')
    const rect2 = page.getByText('Rect2')
    await expect.element(rect1).toBeVisible()
    await expect.element(rect2).toBeVisible()
    
    // Create an edge by dragging from source to target
    const sourceNode = page.locator('.react-flow__node').first()
    const targetNode = page.locator('.react-flow__node').last()
    
    const sourceHandle = sourceNode.locator('.source')
    const targetHandle = targetNode.locator('.target')
    
    await sourceHandle.dragTo(targetHandle)
    
    // Wait for edge to appear
    const edge = page.locator('.react-flow__edge')
    await expect.element(edge).toBeVisible()
    
    // Select and delete the first node
    await rect1.click()
    const selectedNode = page.locator('.react-flow__node.selected')
    await expect.element(selectedNode).toBeVisible()
    await page.keyboard.press('Delete')
    
    // Verify node and edge are deleted
    await expect.element(rect1).not.toBeVisible()
    await expect.element(edge).not.toBeVisible()
  })
})