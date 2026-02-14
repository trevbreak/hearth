import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import matter from 'gray-matter';
import { ConfigManager } from './ConfigManager';

export interface FileMetadata {
  title?: string;
  type?: 'prd' | 'research' | 'meeting' | 'design' | 'spec';
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

export interface FileContent {
  path: string;
  content: string;
  metadata: FileMetadata;
}

export interface DirectoryEntry {
  name: string;
  isDirectory: boolean;
  path: string;
}

export class FileService {
  constructor(private configManager: ConfigManager) {}

  async readFile(filePath: string): Promise<FileContent> {
    const absolutePath = this.resolveWorkspacePath(filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');

    // Parse frontmatter if markdown
    if (filePath.endsWith('.md')) {
      const { data, content: body } = matter(content);
      return {
        path: filePath,
        content: body,
        metadata: data as FileMetadata
      };
    }

    return {
      path: filePath,
      content,
      metadata: {}
    };
  }

  async writeFile(
    filePath: string,
    content: string,
    metadata?: FileMetadata
  ): Promise<void> {
    const absolutePath = this.resolveWorkspacePath(filePath);

    // Ensure directory exists
    await fs.mkdir(dirname(absolutePath), { recursive: true });

    // Add/update frontmatter for markdown files
    let finalContent = content;
    if (filePath.endsWith('.md') && metadata) {
      const updatedMetadata = {
        ...metadata,
        updatedAt: new Date().toISOString()
      };
      finalContent = matter.stringify(content, updatedMetadata);
    }

    await fs.writeFile(absolutePath, finalContent, 'utf-8');
  }

  async deleteFile(filePath: string): Promise<void> {
    const absolutePath = this.resolveWorkspacePath(filePath);
    const stats = await fs.stat(absolutePath);

    if (stats.isDirectory()) {
      await fs.rm(absolutePath, { recursive: true, force: true });
    } else {
      await fs.unlink(absolutePath);
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    const absoluteOldPath = this.resolveWorkspacePath(oldPath);
    const absoluteNewPath = this.resolveWorkspacePath(newPath);

    // Ensure target directory exists
    await fs.mkdir(dirname(absoluteNewPath), { recursive: true });

    await fs.rename(absoluteOldPath, absoluteNewPath);
  }

  async createFile(filePath: string, content: string = '', metadata?: FileMetadata): Promise<void> {
    const absolutePath = this.resolveWorkspacePath(filePath);

    // Ensure directory exists
    await fs.mkdir(dirname(absolutePath), { recursive: true });

    // Add frontmatter for markdown files
    let finalContent = content;
    if (filePath.endsWith('.md')) {
      const fileMetadata: FileMetadata = {
        ...metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      finalContent = matter.stringify(content, fileMetadata);
    }

    await fs.writeFile(absolutePath, finalContent, 'utf-8');
  }

  async readDir(dirPath: string): Promise<DirectoryEntry[]> {
    const absolutePath = this.resolveWorkspacePath(dirPath);
    const entries = await fs.readdir(absolutePath, { withFileTypes: true });

    return entries.map((entry) => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      path: join(dirPath, entry.name)
    }));
  }

  async createDir(dirPath: string): Promise<void> {
    const absolutePath = this.resolveWorkspacePath(dirPath);
    await fs.mkdir(absolutePath, { recursive: true });
  }

  private resolveWorkspacePath(relativePath: string): string {
    const workspace = this.configManager.getWorkspacePath();
    return join(workspace, relativePath);
  }
}
