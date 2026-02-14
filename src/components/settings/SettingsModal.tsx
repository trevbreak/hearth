import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState<'gpt-4-turbo' | 'gpt-3.5-turbo'>('gpt-4-turbo');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load current config
  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const config = await window.api.getConfig();
      if (config.llm?.providers?.openai?.apiKey) {
        setApiKey(config.llm.providers.openai.apiKey);
      }
      if (config.llm?.providers?.openai?.model) {
        setModel(config.llm.providers.openai.model as 'gpt-4-turbo' | 'gpt-3.5-turbo');
      }
    } catch (error) {
      console.error('[Settings] Failed to load config:', error);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key first');
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      // Save config first
      await window.api.updateConfig({
        llm: {
          defaultProvider: 'openai',
          providers: {
            openai: {
              apiKey,
              model
            }
          }
        }
      });

      // Test connection
      const success = await window.api.testLLMConnection();
      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      console.error('[Settings] Connection test failed:', error);
      setTestResult('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    setIsSaving(true);

    try {
      await window.api.updateConfig({
        llm: {
          defaultProvider: 'openai',
          providers: {
            openai: {
              apiKey,
              model
            }
          }
        }
      });

      alert('Settings saved successfully!');
      onClose();
    } catch (error) {
      console.error('[Settings] Failed to save:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* LLM Settings Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI / LLM Settings</h3>

              {/* API Key */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    OpenAI's platform
                  </a>
                </p>
              </div>

              {/* Model Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as 'gpt-4-turbo' | 'gpt-3.5-turbo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="gpt-4-turbo">GPT-4 Turbo (Recommended)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, less capable)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  GPT-4 Turbo provides better quality summaries but costs more
                </p>
              </div>

              {/* Test Connection */}
              <div className="mb-4">
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !apiKey.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing connection...
                    </>
                  ) : (
                    <>Test Connection</>
                  )}
                </button>

                {testResult === 'success' && (
                  <div className="mt-2 flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Connection successful!</span>
                  </div>
                )}

                {testResult === 'error' && (
                  <div className="mt-2 flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Connection failed. Please check your API key.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !apiKey.trim()}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
