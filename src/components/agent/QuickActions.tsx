import { useFileStore } from '@/stores/fileStore';

const PM_QUICK_ACTIONS = [
  {
    label: 'Review PRD',
    prompt: 'Please review this PRD and provide feedback on clarity, completeness, and feasibility.',
    requiresFile: true,
  },
  {
    label: 'User Stories',
    prompt: 'Extract the requirements from this document and generate user stories in the format: "As a [persona], I want to [action] so that [benefit]".',
    requiresFile: true,
  },
  {
    label: 'Summarize',
    prompt: 'Summarize the key points of this document in a concise bullet-point format.',
    requiresFile: true,
  },
  {
    label: 'Acceptance Criteria',
    prompt: 'For each requirement in this document, draft detailed acceptance criteria using Given/When/Then format.',
    requiresFile: true,
  },
  {
    label: 'Brainstorm',
    prompt: 'Help me brainstorm ideas and approaches for this project. What are the key considerations?',
    requiresFile: false,
  },
];

interface QuickActionsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  const currentFile = useFileStore((s) => s.currentFile);

  return (
    <div className="px-3 py-2 border-b border-gray-100">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Quick Actions</p>
      <div className="flex flex-wrap gap-1.5">
        {PM_QUICK_ACTIONS.map((action) => {
          const isDisabled = disabled || (action.requiresFile && !currentFile);

          return (
            <button
              key={action.label}
              onClick={() => onAction(action.prompt)}
              disabled={isDisabled}
              className="px-2.5 py-1 text-xs rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={action.requiresFile && !currentFile ? 'Open a file first' : action.prompt}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
