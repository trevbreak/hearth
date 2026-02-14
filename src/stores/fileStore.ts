import { create } from 'zustand';
import { Project, DirectoryEntry, FileContent } from '@/types/file';
import { loadMarkdownFile } from '@/lib/markdown';

interface FileStore {
  // State
  projects: Project[];
  currentProject: Project | null;
  fileTree: DirectoryEntry[];
  selectedFile: string | null;
  currentFile: FileContent | null;
  isFileLoading: boolean;

  // Actions
  loadProjects: () => Promise<void>;
  selectProject: (project: Project) => void;
  createProject: (name: string) => Promise<void>;
  selectFile: (path: string) => void;
  openFile: (path: string) => Promise<void>;
  saveFile: (path: string, content: string, frontmatter?: string | null) => Promise<void>;
  refreshFileTree: () => Promise<void>;
}

export const useFileStore = create<FileStore>((set, get) => ({
  projects: [],
  currentProject: null,
  fileTree: [],
  selectedFile: null,
  currentFile: null,
  isFileLoading: false,

  loadProjects: async () => {
    const projects = await window.api.getProjects();
    set({ projects });
  },

  selectProject: (project) => {
    set({ currentProject: project });
    get().refreshFileTree();
  },

  createProject: async (name) => {
    try {
      console.log('[FileStore] Creating project:', name);
      const project = await window.api.createProject(name);
      console.log('[FileStore] Project created:', project);
      set((state) => ({
        projects: [...state.projects, project],
        currentProject: project
      }));
      await get().refreshFileTree();
    } catch (error) {
      console.error('[FileStore] Failed to create project:', error);
      throw error;
    }
  },

  selectFile: (path) => {
    set({ selectedFile: path });
  },

  openFile: async (path) => {
    try {
      console.log('[FileStore] Opening file:', path);
      set({ isFileLoading: true, selectedFile: path });

      const fileData = await window.api.readFile(path);
      const { html, frontmatter } = await loadMarkdownFile(fileData.content);

      set({
        currentFile: {
          path,
          content: html,
          frontmatter,
        },
        isFileLoading: false,
      });

      console.log('[FileStore] File loaded successfully');
    } catch (error) {
      console.error('[FileStore] Failed to open file:', error);
      set({ isFileLoading: false });
      throw error;
    }
  },

  saveFile: async (path, content, frontmatter = null) => {
    try {
      console.log('[FileStore] Saving file:', path);
      await window.api.writeFile(path, content);

      // Update current file if it's the same
      const { currentFile } = get();
      if (currentFile && currentFile.path === path) {
        set({
          currentFile: {
            ...currentFile,
            content,
            frontmatter,
          },
        });
      }

      console.log('[FileStore] File saved successfully');
    } catch (error) {
      console.error('[FileStore] Failed to save file:', error);
      throw error;
    }
  },

  refreshFileTree: async () => {
    const { currentProject } = get();
    if (!currentProject) return;

    const files = await window.api.readDir(currentProject.path);
    set({ fileTree: files });
  }
}));
