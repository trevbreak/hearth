import { useFileStore } from '@/stores/fileStore';
import { Folder, FileText, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export function FolderView() {
  const {
    selectedFolder,
    folderContents,
    folderSummary,
    isFolderSummaryLoading,
    openFile,
    selectFolder
  } = useFileStore();

  if (!selectedFolder || !folderContents) {
    return null;
  }

  const files = folderContents.filter(e => !e.isDirectory);
  const folders = folderContents.filter(e => e.isDirectory);
  const folderName = selectedFolder.split('/').pop() || 'Folder';

  const handleRefreshSummary = async () => {
    await window.api.invalidateFolderCache(selectedFolder);
    // Re-select folder to regenerate summary
    selectFolder(selectedFolder);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <Folder className="w-6 h-6 text-primary-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{folderName}</h2>
            <p className="text-sm text-gray-500">{selectedFolder}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {/* AI Summary Section */}
          <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-lg p-6 border border-primary-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Summary</h3>
              </div>
              {!isFolderSummaryLoading && folderSummary && !folderSummary.cached && (
                <button
                  onClick={handleRefreshSummary}
                  className="p-1.5 hover:bg-white/50 rounded transition-colors"
                  title="Regenerate summary"
                >
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>

            {isFolderSummaryLoading ? (
              <div className="flex items-center gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
                <span>Analyzing folder contents with AI...</span>
              </div>
            ) : folderSummary ? (
              <div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {folderSummary.summary}
                </p>
                {folderSummary.cached && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <AlertCircle className="w-3 h-3" />
                    <span>Cached summary - Click refresh to regenerate with latest changes</span>
                  </div>
                )}
                {folderSummary.fileCount > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Analyzed {folderSummary.fileCount} file{folderSummary.fileCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Unable to generate summary</p>
                  <p className="text-sm mt-1">
                    Please configure your OpenAI API key in Settings to enable AI-powered folder summaries.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Files List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Files ({files.length})
            </h3>
            {files.length === 0 ? (
              <p className="text-gray-500 italic">No files in this folder</p>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => openFile(file.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all text-left group"
                  >
                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                    <span className="text-gray-700 font-medium group-hover:text-primary-700">{file.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subfolders */}
          {folders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Subfolders ({folders.length})
              </h3>
              <div className="space-y-2">
                {folders.map((folder) => (
                  <button
                    key={folder.path}
                    onClick={() => selectFolder(folder.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <Folder className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="text-gray-700 font-medium group-hover:text-indigo-700">{folder.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
