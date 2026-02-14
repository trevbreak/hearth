import { useEffect, useRef } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';

export function AgentPanel() {
  const {
    messages,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    clearChat,
    setError,
  } = useAgentStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useAgentStore.getState().loadProvider();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Actions */}
      <QuickActions onAction={handleSend} disabled={isStreaming} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Ask me anything about your project</p>
              <p className="text-xs text-gray-400">
                I can help with PRDs, user stories, research analysis, and more.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={i} message={msg} />
        ))}

        {isStreaming && streamingContent && (
          <Message
            message={{
              role: 'assistant',
              content: streamingContent,
              timestamp: Date.now(),
            }}
            isStreaming
          />
        )}

        {isStreaming && !streamingContent && (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Thinking...</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-500 hover:text-red-700 mt-1 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      {messages.length > 0 && (
        <div className="px-3 py-1 border-t border-gray-100 flex justify-end">
          <button
            onClick={clearChat}
            disabled={isStreaming}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50 py-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear chat
          </button>
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
