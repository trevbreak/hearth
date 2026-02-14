import { useState } from 'react';
import { Settings } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export function SettingsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>

      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
