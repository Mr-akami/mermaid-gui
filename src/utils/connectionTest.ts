// Simple connection test utilities
export function testHandleConnection() {
  console.log('Testing handle connections...')
  
  // Check if handles are properly configured
  const handles = document.querySelectorAll('.react-flow__handle')
  console.log('Number of handles found:', handles.length)
  
  handles.forEach((handle, index) => {
    const handleEl = handle as HTMLElement
    console.log(`Handle ${index}:`, {
      id: handleEl.dataset.handleid,
      position: handleEl.dataset.handlepos,
      type: handleEl.classList.contains('source') ? 'source' : 'target',
      connectable: handleEl.classList.contains('connectable'),
      style: handleEl.style.cssText
    })
  })
  
  // Check for connection indicators
  const connectionIndicators = document.querySelectorAll('.connectionindicator')
  console.log('Connection indicators:', connectionIndicators.length)
  
  // Check React Flow instance
  const reactFlowInstance = document.querySelector('.react-flow')
  console.log('React Flow instance exists:', !!reactFlowInstance)
  
  return {
    handleCount: handles.length,
    hasConnectionIndicators: connectionIndicators.length > 0,
    hasReactFlow: !!reactFlowInstance
  }
}