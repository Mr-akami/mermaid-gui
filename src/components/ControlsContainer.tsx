import { useAtomValue } from 'jotai'
import { diagramTypeAtom } from '@/store/diagramStore'
import Toolbar from './Toolbar'
import UndoRedoButtons from './UndoRedoButtons'
import EdgeStyleSelector from './EdgeStyleSelector'
import FlowchartDirectionSelector from './FlowchartDirectionSelector'
import SequenceControls from './SequenceControls'
import ClassControls from './ClassControls'
import StateControls from './StateControls'
import ERControls from './ERControls'

const ControlsContainer = () => {
  const diagramType = useAtomValue(diagramTypeAtom)

  const renderDiagramSpecificControls = () => {
    switch (diagramType) {
      case 'flowchart':
        return (
          <>
            <div className="absolute bottom-4 left-20 z-10">
              <FlowchartDirectionSelector />
            </div>
            <div className="absolute bottom-4 right-4 z-10">
              <EdgeStyleSelector />
            </div>
          </>
        )
      case 'sequence':
        return (
          <div className="absolute bottom-4 right-4 z-10">
            <SequenceControls />
          </div>
        )
      case 'class':
        return (
          <div className="absolute bottom-4 left-20 z-10">
            <ClassControls />
          </div>
        )
      case 'state':
        return (
          <div className="absolute bottom-4 left-36 z-10">
            <StateControls />
          </div>
        )
      case 'er':
        return (
          <div className="absolute bottom-4 left-52 z-10">
            <ERControls />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      {/* Fixed position components */}
      <div className="absolute top-4 left-4 z-10">
        <Toolbar />
      </div>
      <div className="absolute top-4 right-4 z-10">
        <UndoRedoButtons />
      </div>
      
      {/* Diagram-specific controls with smart positioning */}
      {renderDiagramSpecificControls()}
    </>
  )
}

export default ControlsContainer