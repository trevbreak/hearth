import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';

export type SaveStatusType = 'saved' | 'saving' | 'unsaved' | 'error';

interface SaveStatusProps {
  status: SaveStatusType;
  errorMessage?: string;
}

export function SaveStatus({ status, errorMessage }: SaveStatusProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saved':
        return {
          icon: <Check className="w-4 h-4 text-green-600" />,
          text: 'Saved',
          className: 'text-green-600',
        };
      case 'saving':
        return {
          icon: <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />,
          text: 'Saving...',
          className: 'text-blue-600',
        };
      case 'unsaved':
        return {
          icon: <Circle className="w-4 h-4 text-orange-600 fill-orange-600" />,
          text: 'Unsaved changes',
          className: 'text-orange-600',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-600" />,
          text: 'Error saving',
          className: 'text-red-600',
        };
      default:
        return null;
    }
  };

  const display = getStatusDisplay();

  if (!display) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        {display.icon}
        <span className={`text-xs font-medium ${display.className}`}>
          {display.text}
        </span>
      </div>
      {status === 'error' && errorMessage && (
        <span className="text-xs text-red-500" title={errorMessage}>
          ({errorMessage})
        </span>
      )}
    </div>
  );
}
