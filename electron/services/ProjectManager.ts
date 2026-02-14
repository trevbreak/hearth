import { join } from 'path';
import { FileService } from './FileService';
import { ConfigManager } from './ConfigManager';
import { v4 as uuid } from 'uuid';

export interface Project {
  id: string;
  name: string;
  path: string;
  status: 'discovery' | 'design' | 'delivery';
  createdAt: string;
}

const DEFAULT_FOLDERS = ['research', 'meetings', 'designs', 'specs'];

const PRD_TEMPLATE = `---
title: {PROJECT_NAME}
type: prd
status: draft
createdAt: {DATE}
---

# {PROJECT_NAME}

## Problem Statement

*What problem are we solving?*

## Goals

*What are we trying to achieve?*

## Users & Personas

*Who is this for?*

## Requirements

### Must Have
-

### Should Have
-

### Could Have
-

## Success Metrics

*How will we measure success?*

## Timeline

*When do we aim to deliver this?*

## Open Questions

*What needs to be decided?*
`;

export class ProjectManager {
  constructor(
    private fileService: FileService,
    private configManager: ConfigManager
  ) {}

  async createProject(name: string): Promise<Project> {
    const projectSlug = this.slugify(name);
    const projectPath = join('projects', projectSlug);

    // Create project folder
    await this.fileService.createDir(projectPath);

    // Create standard subfolders
    for (const folder of DEFAULT_FOLDERS) {
      await this.fileService.createDir(join(projectPath, folder));
    }

    // Create PRD.md from template
    const prdContent = PRD_TEMPLATE.replace(/{PROJECT_NAME}/g, name).replace(
      /{DATE}/g,
      new Date().toISOString()
    );

    await this.fileService.writeFile(join(projectPath, 'PRD.md'), prdContent, {
      title: name,
      type: 'prd',
      createdAt: new Date().toISOString()
    });

    // Create .project.json metadata
    const project: Project = {
      id: uuid(),
      name,
      path: projectPath,
      status: 'discovery',
      createdAt: new Date().toISOString()
    };

    await this.fileService.writeFile(
      join(projectPath, '.project.json'),
      JSON.stringify(project, null, 2)
    );

    return project;
  }

  async listProjects(): Promise<Project[]> {
    const projectsPath = 'projects';

    try {
      const dirs = await this.fileService.readDir(projectsPath);
      const projects: Project[] = [];

      for (const dir of dirs) {
        if (!dir.isDirectory) continue;

        try {
          const metadataPath = join(dir.path, '.project.json');
          const { content } = await this.fileService.readFile(metadataPath);
          projects.push(JSON.parse(content));
        } catch {
          // Skip directories without .project.json
        }
      }

      return projects;
    } catch {
      // Projects directory doesn't exist yet
      return [];
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
