import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useFileStore } from '@/stores/fileStore';
import { TipTapEditor } from './TipTapEditor';
import { SaveStatus } from './SaveStatus';
import { saveMarkdownFile, htmlToMarkdown } from '@/lib/markdown';
import { useAutoSave } from '@/hooks/useAutoSave';

type ViewMode = 'wysiwyg' | 'markdown';

export function MarkdownEditor() {
  const { currentFile, isFileLoading, currentProject, saveFile } = useFileStore();
  const [editorContent, setEditorContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('wysiwyg');

  // Load file content into editor when currentFile changes
  useEffect(() => {
    if (currentFile) {
      setEditorContent(currentFile.content);
      setHasChanges(false);
      setViewMode('wysiwyg'); // Reset to WYSIWYG when opening a new file
    } else {
      setEditorContent('');
      setHasChanges(false);
      setViewMode('wysiwyg');
    }
  }, [currentFile]);

  // Handle content changes
  const handleContentChange = (html: string) => {
    setEditorContent(html);
    setHasChanges(true);
  };

  // Auto-save functionality
  const { saveStatus, forceSave } = useAutoSave({
    content: editorContent,
    filePath: currentFile?.path || null,
    frontmatter: currentFile?.frontmatter || null,
    enabled: hasChanges && !!currentFile,
    onSave: async (path, content, frontmatter) => {
      const markdown = saveMarkdownFile(content, frontmatter);
      await saveFile(path, markdown, frontmatter);
      setHasChanges(false);
    },
  });

  // Toggle view mode function
  const toggleViewMode = () => {
    setViewMode((mode) => (mode === 'wysiwyg' ? 'markdown' : 'wysiwyg'));
  };

  // Manual save with Cmd/Ctrl+S and view toggle with Cmd/Ctrl+Shift+M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        forceSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        toggleViewMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [forceSave]);

  // No project selected
  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Project Selected</h2>
          <p className="text-gray-500 max-w-md">
            Create or select a project from the sidebar to get started.
          </p>
        </div>
      </div>
    );
  }

  // No file selected
  if (!currentFile && !isFileLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No File Selected</h2>
          <p className="text-gray-500 max-w-md">
            Select a file from the sidebar or create a new one to start editing.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isFileLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading file...</p>
        </div>
      </div>
    );
  }

  // Convert HTML to markdown for raw view
  const markdownContent = editorContent ? htmlToMarkdown(editorContent) : '';

  // Editor view
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header with file path and save status */}
      <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 font-medium">
            {currentFile?.path.split('/').pop()}
          </span>
          <span className="text-xs text-gray-400">
            {currentFile?.path}
          </span>
        </div>
        <SaveStatus status={saveStatus} />
      </div>

      {/* Editor */}
      {viewMode === 'wysiwyg' ? (
        <TipTapEditor
          content={editorContent}
          onChange={handleContentChange}
          onToggleViewMode={toggleViewMode}
        />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Markdown view toolbar placeholder */}
          <div className="border-b border-gray-200 bg-white p-2 flex items-center gap-2">
            <button
              onClick={toggleViewMode}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded border border-gray-300"
              title="Switch to WYSIWYG mode (Cmd+Shift+M)"
            >
              Switch to WYSIWYG
            </button>
            <span className="text-xs text-gray-500">Raw Markdown (Read-only)</span>
          </div>
          {/* Raw markdown view */}
          <div className="flex-1 overflow-y-auto">
            <pre className="p-8 font-mono text-sm text-gray-800 whitespace-pre-wrap">
              {markdownContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
