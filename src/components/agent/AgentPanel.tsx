import { Sparkles } from 'lucide-react';

export function AgentPanel() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-gray-700 mb-2">AI Assistant</h3>
        <p className="text-xs text-gray-500 max-w-xs">
          Your AI-powered organization assistant will appear here once implemented in Phase 4.
        </p>
        <p className="text-xs text-gray-400 mt-3">
          Coming soon: Auto-organization, insights, and suggestions
        </p>
      </div>
    </div>
  );
}
