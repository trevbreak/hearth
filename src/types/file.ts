export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

export interface FileMetadata {
  title?: string;
  type?: 'prd' | 'research' | 'meeting' | 'design' | 'spec';
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  path: string;
  status: 'discovery' | 'design' | 'delivery';
  createdAt: string;
}

export interface DirectoryEntry {
  name: string;
  isDirectory: boolean;
  path: string;
}
