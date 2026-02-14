import { useEffect, useState } from 'react';
import { useFileStore } from '@/stores/fileStore';
import { Folder, File, Plus, FileText, FolderPlus } from 'lucide-react';

export function FileTree() {
  const { projects, currentProject, fileTree, selectedFile, loadProjects, selectProject, createProject, openFile, refreshFileTree } =
    useFileStore();
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      await createProject(projectName);
      setProjectName('');
      setShowNewProject(false);
    } catch (error) {
      console.error('[FileTree] Error creating project:', error);
      alert(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim() || !currentProject) return;

    try {
      const fileName = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`;
      const filePath = `${currentProject.path}/${fileName}`;

      await window.api.createFile(filePath, '# New Document\n\nStart writing here...');
      await refreshFileTree();

      setNewFileName('');
      setShowNewFile(false);

      // Open the newly created file
      openFile(filePath);
    } catch (error) {
      console.error('[FileTree] Error creating file:', error);
      alert(`Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !currentProject) return;

    try {
      const folderPath = `${currentProject.path}/${newFolderName}`;
      await window.api.createDir(folderPath);
      await refreshFileTree();

      setNewFolderName('');
      setShowNewFolder(false);
    } catch (error) {
      console.error('[FileTree] Error creating folder:', error);
      alert(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Projects Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">Projects</h3>
          <button
            onClick={() => setShowNewProject(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title="New Project"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {showNewProject && (
          <form onSubmit={handleCreateProject} className="mb-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
              onBlur={() => {
                if (!projectName.trim()) setShowNewProject(false);
              }}
            />
          </form>
        )}

        {projects.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No projects yet</p>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => selectProject(project)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${
                  currentProject?.id === project.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Folder className="w-4 h-4" />
                {project.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* File Tree */}
      {currentProject && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase">Files</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowNewFile(true)}
                className="p-1 hover:bg-gray-100 rounded"
                title="New File"
              >
                <FileText className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setShowNewFolder(true)}
                className="p-1 hover:bg-gray-100 rounded"
                title="New Folder"
              >
                <FolderPlus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {showNewFile && (
            <form onSubmit={handleCreateFile} className="mb-2">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="File name..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
                onBlur={() => {
                  if (!newFileName.trim()) setShowNewFile(false);
                }}
              />
            </form>
          )}

          {showNewFolder && (
            <form onSubmit={handleCreateFolder} className="mb-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
                onBlur={() => {
                  if (!newFolderName.trim()) setShowNewFolder(false);
                }}
              />
            </form>
          )}

          {fileTree.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No files yet. Create a new file to get started.</p>
          ) : (
            <div className="space-y-1">
              {fileTree.map((entry) => (
                <div
                  key={entry.path}
                  onClick={() => {
                    if (!entry.isDirectory) {
                      openFile(entry.path);
                    }
                  }}
                  className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer ${
                    selectedFile === entry.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {entry.isDirectory ? (
                    <Folder className="w-4 h-4 text-gray-400" />
                  ) : (
                    <File className="w-4 h-4 text-gray-400" />
                  )}
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
