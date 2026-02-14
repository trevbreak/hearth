import { FileText } from 'lucide-react';

export function MarkdownEditor() {
  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Herth</h2>
        <p className="text-gray-500 max-w-md">
          Create a new project from the sidebar to get started with your Product Management
          workspace.
        </p>
        <p className="text-sm text-gray-400 mt-4">
          Markdown editor with TipTap will be implemented in Phase 2
        </p>
      </div>
    </div>
  );
}
