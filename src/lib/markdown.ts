import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import DOMPurify from 'dompurify';

// Configure marked options
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
});

// Configure Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Use GFM plugin for tables, strikethrough, etc.
turndownService.use(gfm);

// Custom rules for task lists (TipTap specific)
turndownService.addRule('taskListItems', {
  filter: (node: HTMLElement) => {
    return (
      node.nodeName === 'LI' &&
      node.parentNode?.nodeName === 'UL' &&
      (node.parentNode as HTMLElement)?.getAttribute('data-type') === 'taskList'
    );
  },
  replacement: (content: string, node: HTMLElement) => {
    const checkbox = node.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const isChecked = checkbox?.checked;
    const prefix = isChecked ? '- [x] ' : '- [ ] ';
    return prefix + content.trim() + '\n';
  },
});

export interface MarkdownConversionOptions {
  preserveFrontmatter?: boolean;
}

/**
 * Extract frontmatter from markdown content
 */
export function extractFrontmatter(markdown: string): {
  frontmatter: string | null;
  content: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (match) {
    return {
      frontmatter: match[1],
      content: match[2],
    };
  }

  return {
    frontmatter: null,
    content: markdown,
  };
}

/**
 * Convert markdown to HTML for TipTap editor
 */
export async function markdownToHtml(
  markdown: string,
  options: MarkdownConversionOptions = {}
): Promise<string> {
  const { preserveFrontmatter = true } = options;

  let content = markdown;

  if (preserveFrontmatter) {
    const extracted = extractFrontmatter(markdown);
    content = extracted.content;
  }

  // Convert markdown to HTML
  const rawHtml = await marked.parse(content);

  // Sanitize HTML for security
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'hr',
      'input', 'label', 'div'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'type', 'checked', 'class', 'data-type'],
  });

  return cleanHtml;
}

/**
 * Convert HTML from TipTap editor to markdown
 */
export function htmlToMarkdown(
  html: string,
  _options: MarkdownConversionOptions = {}
): string {
  // Convert HTML to markdown
  let markdown = turndownService.turndown(html);

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');

  return markdown.trim();
}

/**
 * Full conversion from markdown file to HTML for editor
 */
export async function loadMarkdownFile(markdown: string): Promise<{
  html: string;
  frontmatter: string | null;
}> {
  const extracted = extractFrontmatter(markdown);
  const html = await markdownToHtml(extracted.content, { preserveFrontmatter: false });

  return {
    html,
    frontmatter: extracted.frontmatter,
  };
}

/**
 * Full conversion from editor HTML to markdown file
 */
export function saveMarkdownFile(
  html: string,
  frontmatter: string | null = null
): string {
  const markdown = htmlToMarkdown(html, { preserveFrontmatter: false });

  if (frontmatter) {
    return `---\n${frontmatter}\n---\n${markdown}`;
  }

  return markdown;
}
