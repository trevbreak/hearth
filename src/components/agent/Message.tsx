import { User, Bot } from 'lucide-react';
import type { ChatMessage } from '@/stores/agentStore';

interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function Message({ message, isStreaming }: MessageProps) {
  const isUser = message.role === 'user';

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
        <div className="text-sm text-gray-800 whitespace-pre-wrap break-words prose prose-sm max-w-none">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-purple-500 animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>
      </div>
    </div>
  );
}
