import { useEffect, useState } from 'react';
import { useFileStore } from '@/stores/fileStore';
import { Folder, File, Plus } from 'lucide-react';

export function FileTree() {
  const { projects, currentProject, fileTree, loadProjects, selectProject, createProject } =
    useFileStore();
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    await createProject(projectName);
    setProjectName('');
    setShowNewProject(false);
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
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Files</h3>
          {fileTree.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No files</p>
          ) : (
            <div className="space-y-1">
              {fileTree.map((entry) => (
                <div
                  key={entry.path}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
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
