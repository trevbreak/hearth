import { FileTree } from '@/components/sidebar/FileTree';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { AgentPanel } from '@/components/agent/AgentPanel';
import { SettingsButton } from '@/components/settings/SettingsButton';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - File Tree */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-12 border-b border-gray-200 flex items-center justify-between pl-20 pr-4">
          <h1 className="text-lg font-semibold text-gray-900">Herth</h1>
          <SettingsButton />
        </div>
        <FileTree />
      </aside>

      {/* Main Content - Editor */}
      <main className="flex-1 flex flex-col">
        <MarkdownEditor />
      </main>

      {/* Right Sidebar - Agent Panel */}
      <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="h-12 border-b border-gray-200 flex items-center px-4">
          <h2 className="text-sm font-semibold text-gray-700">AI Assistant</h2>
        </div>
        <AgentPanel />
      </aside>
    </div>
  );
}
