import { useState, type ReactNode } from 'react'
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react'

interface AppShellProps {
  leftSidebar: ReactNode
  mainContent: ReactNode
  rightSidebar: ReactNode
}

export function AppShell({ leftSidebar, mainContent, rightSidebar }: AppShellProps) {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background">
      {/* Left Sidebar */}
      <aside
        className={`relative flex-shrink-0 border-r border-border overflow-y-auto transition-all duration-300 ${
          leftOpen ? 'w-72' : 'w-0'
        }`}
      >
        <div className={`w-72 h-full ${leftOpen ? '' : 'invisible'}`}>
          {leftSidebar}
          {/* Toggle button in header */}
          <button
            onClick={() => setLeftOpen(false)}
            className="absolute top-4 right-3 z-10 p-1 rounded hover:bg-muted transition-colors"
            title="Hide left panel"
          >
            <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </aside>

      {/* Left Open Button (when closed) */}
      {!leftOpen && (
        <button
          onClick={() => setLeftOpen(true)}
          className="flex-shrink-0 w-8 flex items-start justify-center pt-4 bg-background hover:bg-muted border-r border-border transition-colors"
          title="Show left panel"
        >
          <PanelLeftOpen className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {mainContent}
      </main>

      {/* Right Sidebar with toggle strip */}
      <div className="flex flex-shrink-0">
        {/* Toggle strip - always visible on left edge of right column */}
        <button
          onClick={() => setRightOpen(!rightOpen)}
          className="w-6 h-full flex items-center justify-center bg-background hover:bg-muted border-l border-border transition-colors"
          title={rightOpen ? 'Hide right panel' : 'Show right panel'}
        >
          {rightOpen ? (
            <PanelRightClose className="w-4 h-4 text-muted-foreground" />
          ) : (
            <PanelRightOpen className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Right Sidebar content */}
        <aside
          className={`relative flex-shrink-0 border-l border-border overflow-y-auto transition-all duration-300 ${
            rightOpen ? 'w-72' : 'w-0'
          }`}
        >
          <div className={`w-72 h-full ${rightOpen ? '' : 'invisible'}`}>
            {rightSidebar}
          </div>
        </aside>
      </div>
    </div>
  )
}
