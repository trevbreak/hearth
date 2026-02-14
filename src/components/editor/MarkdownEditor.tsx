import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useFileStore } from '@/stores/fileStore';
import { TipTapEditor } from './TipTapEditor';
import { SaveStatus } from './SaveStatus';
import { saveMarkdownFile } from '@/lib/markdown';
import { useAutoSave } from '@/hooks/useAutoSave';

export function MarkdownEditor() {
  const { currentFile, isFileLoading, currentProject, saveFile } = useFileStore();
  const [editorContent, setEditorContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Load file content into editor when currentFile changes
  useEffect(() => {
    if (currentFile) {
      setEditorContent(currentFile.content);
      setHasChanges(false);
    } else {
      setEditorContent('');
      setHasChanges(false);
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

  // Manual save with Cmd/Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        forceSave();
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
      <TipTapEditor
        content={editorContent}
        onChange={handleContentChange}
      />
    </div>
  );
}
