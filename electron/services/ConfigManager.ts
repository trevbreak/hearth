import { app } from 'electron';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface AppConfig {
  version: string;
  workspace: {
    path: string;
  };
  llm?: {
    defaultProvider?: 'anthropic' | 'openai' | 'ollama';
    providers?: {
      anthropic?: { apiKey: string; model: string };
      openai?: { apiKey: string; model: string };
      ollama?: { baseUrl: string; model: string };
    };
  };
  agent?: {
    enabled: boolean;
    autoOrganize: boolean;
  };
  agents?: {
    defaultProvider: 'claude' | 'openai';
    claude?: {
      apiKey: string;
      model: string;
      maxTokens?: number;
      temperature?: number;
    };
    openai?: {
      apiKey: string;
      model: string;
      maxTokens?: number;
      temperature?: number;
    };
  };
}

const DEFAULT_CONFIG: AppConfig = {
  version: '0.1.0',
  workspace: {
    path: join(homedir(), 'Documents', 'Herth')
  },
  agent: {
    enabled: false, // Disabled until implemented
    autoOrganize: false
  }
};

export class ConfigManager {
  private config: AppConfig = DEFAULT_CONFIG;
  private configPath: string;

  constructor() {
    this.configPath = join(app.getPath('userData'), 'config.json');
  }

  async initialize(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch (error) {
      // Config doesn't exist, use defaults
      await this.save();
    }

    // Ensure workspace directory exists
    await fs.mkdir(this.config.workspace.path, { recursive: true });

    // Create .herth system folder
    const herthDir = join(this.config.workspace.path, '.herth');
    await fs.mkdir(herthDir, { recursive: true });
  }

  getConfig(): AppConfig {
    return this.config;
  }

  getWorkspacePath(): string {
    return this.config.workspace.path;
  }

  async updateConfig(updates: Partial<AppConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await this.save();
  }

  private async save(): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
  }
}
