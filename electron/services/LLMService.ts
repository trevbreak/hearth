import OpenAI from 'openai';
import { ConfigManager } from './ConfigManager';
import { FileService } from './FileService';

export interface FolderSummaryRequest {
  folderPath: string;
  includeSubfolders?: boolean;
}

export interface FolderSummaryResponse {
  summary: string;
  fileCount: number;
  folderName: string;
  cached: boolean;
}

interface CachedSummary {
  summary: string;
  timestamp: number;
  fileCount: number;
}

export class LLMService {
  private openai: OpenAI | null = null;
  private summaryCache: Map<string, CachedSummary> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 minutes
  private readonly MAX_FILES = 20; // Limit files to avoid token overflow

  constructor(
    private configManager: ConfigManager,
    private fileService: FileService
  ) {
    this.initializeClient();
  }

  /**
   * Initialize OpenAI client with API key from config
   */
  private initializeClient(): void {
    const config = this.configManager.getConfig();
    const apiKey = config.llm?.providers?.openai?.apiKey;

    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      console.log('[LLMService] OpenAI client initialized');
    } else {
      console.log('[LLMService] No API key configured');
    }
  }

  /**
   * Generate AI summary of folder contents
   */
  async summarizeFolder(request: FolderSummaryRequest): Promise<FolderSummaryResponse> {
    const folderName = request.folderPath.split('/').pop() || 'folder';

    // Check cache first
    const cached = this.getCachedSummary(request.folderPath);
    if (cached) {
      console.log('[LLMService] Returning cached summary for:', request.folderPath);
      return {
        summary: cached.summary,
        fileCount: cached.fileCount,
        folderName,
        cached: true
      };
    }

    // Ensure client is initialized
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
    }

    // Read folder contents
    const entries = await this.fileService.readDir(request.folderPath);
    const files = entries.filter(e => !e.isDirectory && e.name.endsWith('.md'));

    if (files.length === 0) {
      return {
        summary: 'This folder is empty or contains no markdown files.',
        fileCount: 0,
        folderName,
        cached: false
      };
    }

    // Read file contents (limit to prevent token overflow)
    const fileContents: string[] = [];
    const filesToRead = files.slice(0, this.MAX_FILES);

    for (const file of filesToRead) {
      try {
        const content = await this.fileService.readFile(file.path);
        const truncatedContent = content.content.slice(0, 5000); // Limit individual file size
        fileContents.push(`File: ${file.name}\n${truncatedContent}\n---\n`);
      } catch (error) {
        console.error(`[LLMService] Failed to read ${file.path}:`, error);
      }
    }

    if (fileContents.length === 0) {
      return {
        summary: 'Unable to read files in this folder.',
        fileCount: files.length,
        folderName,
        cached: false
      };
    }

    // Generate summary with OpenAI
    const prompt = this.buildSummaryPrompt(folderName, fileContents, files.length);

    console.log('[LLMService] Generating summary for:', request.folderPath);

    const config = this.configManager.getConfig();
    const model = config.llm?.providers?.openai?.model || 'gpt-4-turbo';

    const response = await this.openai.chat.completions.create({
      model: model as string,
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content || 'Unable to generate summary.';

    // Cache the result
    this.cacheSummary(request.folderPath, summary, files.length);

    console.log('[LLMService] Summary generated successfully');

    return {
      summary,
      fileCount: files.length,
      folderName,
      cached: false
    };
  }

  /**
   * Build prompt for folder summary
   */
  private buildSummaryPrompt(folderName: string, fileContents: string[], totalFiles: number): string {
    const contentBlock = fileContents.join('\n\n');
    const truncationNote = totalFiles > this.MAX_FILES
      ? `\n\nNote: This folder contains ${totalFiles} files, but only the first ${this.MAX_FILES} are included in this analysis.`
      : '';

    return `You are analyzing the contents of a folder named "${folderName}" for a Product Manager.

The folder contains ${totalFiles} markdown file(s). Here are the contents:

${contentBlock}${truncationNote}

Please provide a concise 2-3 paragraph summary of this folder's contents. Focus on:
1. The main theme or purpose of the documents
2. Key topics, decisions, or findings
3. How the documents relate to each other
4. Any notable gaps or missing information

Keep the summary helpful and actionable for a Product Manager reviewing their work.`;
  }

  /**
   * Get cached summary if available and not expired
   */
  private getCachedSummary(folderPath: string): CachedSummary | null {
    const cached = this.summaryCache.get(folderPath);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.summaryCache.delete(folderPath);
      return null;
    }

    return cached;
  }

  /**
   * Cache summary for future use
   */
  private cacheSummary(folderPath: string, summary: string, fileCount: number): void {
    this.summaryCache.set(folderPath, {
      summary,
      fileCount,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidate cache for specific folder or all folders
   */
  invalidateCache(folderPath?: string): void {
    if (folderPath) {
      this.summaryCache.delete(folderPath);
      console.log('[LLMService] Cache invalidated for:', folderPath);
    } else {
      this.summaryCache.clear();
      console.log('[LLMService] All cache cleared');
    }
  }

  /**
   * Test connection to OpenAI API
   */
  async testConnection(): Promise<boolean> {
    if (!this.openai) {
      return false;
    }

    try {
      console.log('[LLMService] Testing OpenAI connection...');
      await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10,
      });
      console.log('[LLMService] Connection test successful');
      return true;
    } catch (error) {
      console.error('[LLMService] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Re-initialize client when config changes
   */
  updateConfig(): void {
    this.initializeClient();
  }
}
