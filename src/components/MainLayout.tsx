import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from 'react-resizable-panels'
import FlowEditor from './FlowEditor'
import MermaidPanel from './MermaidPanel'

const MainLayout = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={50} minSize={30}>
          <FlowEditor />
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-gray-400 transition-colors" />
        <Panel defaultSize={50} minSize={30}>
          <MermaidPanel />
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default MainLayout