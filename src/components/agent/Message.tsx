import { useMemo } from 'react';
import { User, Bot } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { ChatMessage } from '@/stores/agentStore';

interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

/**
 * Check if content looks like markdown (has markdown syntax).
 */
function looksLikeMarkdown(text: string): boolean {
  // Check for common markdown patterns
  return /(?:^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s|```|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|^\s*>\s|\[.+\]\(.+\)|\|.+\|)/m.test(text);
}

export function Message({ message, isStreaming }: MessageProps) {
  const isUser = message.role === 'user';

  const renderedHtml = useMemo(() => {
    if (isUser || !looksLikeMarkdown(message.content)) {
      return null;
    }
    const rawHtml = marked.parse(message.content, { async: false }) as string;
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote', 'hr',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    });
  }, [message.content, isUser]);

  return (
    <div className={`flex gap-3 ${isUser ? '' : 'bg-gray-50 -mx-4 px-4 py-3 rounded-lg'}`}>
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isUser ? 'bg-primary-100 text-primary-600' : 'bg-purple-100 text-purple-600'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500 mb-1">
          {isUser ? 'You' : 'AI Assistant'}
        </div>
        {renderedHtml ? (
          <div className="text-sm text-gray-800 prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-purple-500 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-purple-500 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
