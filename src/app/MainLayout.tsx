import { GuiEditor, CodeEditor, PropertyPanel } from './deps'

export function MainLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Mermaid GUI Editor
        </h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex">
          {/* GUI Editor Panel */}
          <div className="flex-1 bg-white border-r border-gray-200">
            <GuiEditor />
          </div>

          {/* Code Editor Panel */}
          <div className="w-1/3 min-w-[300px] bg-gray-900">
            <CodeEditor />
          </div>
        </div>

        {/* Property Panel */}
        <div className="w-64 bg-white border-l border-gray-200">
          <PropertyPanel />
        </div>
      </div>
    </div>
  )
}
