import { create } from 'zustand';
import { Project, DirectoryEntry } from '@/types/file';

interface FileStore {
  // State
  projects: Project[];
  currentProject: Project | null;
  fileTree: DirectoryEntry[];
  selectedFile: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  selectProject: (project: Project) => void;
  createProject: (name: string) => Promise<void>;
  selectFile: (path: string) => void;
  refreshFileTree: () => Promise<void>;
}

export const useFileStore = create<FileStore>((set, get) => ({
  projects: [],
  currentProject: null,
  fileTree: [],
  selectedFile: null,

  loadProjects: async () => {
    const projects = await window.api.getProjects();
    set({ projects });
  },

  selectProject: (project) => {
    set({ currentProject: project });
    get().refreshFileTree();
  },

  createProject: async (name) => {
    const project = await window.api.createProject(name);
    set((state) => ({
      projects: [...state.projects, project],
      currentProject: project
    }));
    get().refreshFileTree();
  },

  selectFile: (path) => {
    set({ selectedFile: path });
  },

  refreshFileTree: async () => {
    const { currentProject } = get();
    if (!currentProject) return;

    const files = await window.api.readDir(currentProject.path);
    set({ fileTree: files });
  }
}));
