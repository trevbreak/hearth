import { create } from 'zustand';
import { FileMetadata } from '@/types/file';

interface EditorStore {
  // State
  currentFile: string | null;
  content: string;
  metadata: FileMetadata | null;
  isDirty: boolean;

  // Actions
  openFile: (path: string) => Promise<void>;
  setContent: (content: string) => void;
  saveFile: () => Promise<void>;
  closeFile: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentFile: null,
  content: '',
  metadata: null,
  isDirty: false,

  openFile: async (path) => {
    const file = await window.api.readFile(path);
    set({
      currentFile: path,
      content: file.content,
      metadata: file.metadata,
      isDirty: false
    });
  },

  setContent: (content) => {
    set({ content, isDirty: true });
  },

  saveFile: async () => {
    const { currentFile, content, metadata } = get();
    if (!currentFile) return;

    await window.api.writeFile(currentFile, content, metadata);
    set({ isDirty: false });
  },

  closeFile: () => {
    set({
      currentFile: null,
      content: '',
      metadata: null,
      isDirty: false
    });
  }
}));
