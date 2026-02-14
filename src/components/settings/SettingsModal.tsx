import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'folder-ai' | 'claude' | 'openai';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('claude');

  // Folder AI (existing OpenAI-based summaries)
  const [folderApiKey, setFolderApiKey] = useState('');
  const [folderModel, setFolderModel] = useState<'gpt-4-turbo' | 'gpt-3.5-turbo'>('gpt-4-turbo');

  // Claude Agent
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [claudeModel, setClaudeModel] = useState('claude-sonnet-4-5-20250929');

  // OpenAI Agent
  const [openaiAgentApiKey, setOpenaiAgentApiKey] = useState('');
  const [openaiAgentModel, setOpenaiAgentModel] = useState('gpt-4-turbo');

  // Default agent provider
  const [defaultProvider, setDefaultProvider] = useState<'claude' | 'openai'>('claude');

  // UI state
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      setTestResult(null);
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const config = await window.api.getConfig();

      // Folder AI settings
      if (config.llm?.providers?.openai?.apiKey) {
        setFolderApiKey(config.llm.providers.openai.apiKey);
      }
      if (config.llm?.providers?.openai?.model) {
        setFolderModel(config.llm.providers.openai.model as 'gpt-4-turbo' | 'gpt-3.5-turbo');
      }

      // Agent settings
      if (config.agents) {
        setDefaultProvider(config.agents.defaultProvider || 'claude');
        if (config.agents.claude?.apiKey) setClaudeApiKey(config.agents.claude.apiKey);
        if (config.agents.claude?.model) setClaudeModel(config.agents.claude.model);
        if (config.agents.openai?.apiKey) setOpenaiAgentApiKey(config.agents.openai.apiKey);
        if (config.agents.openai?.model) setOpenaiAgentModel(config.agents.openai.model);
      }
    } catch (error) {
      console.error('[Settings] Failed to load config:', error);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      let success = false;

      if (activeTab === 'folder-ai') {
        if (!folderApiKey.trim()) return;
        await window.api.updateConfig({
          llm: {
            defaultProvider: 'openai',
            providers: { openai: { apiKey: folderApiKey, model: folderModel } },
          },
        });
        success = await window.api.testLLMConnection();
      } else if (activeTab === 'claude') {
        if (!claudeApiKey.trim()) return;
        // Save and reinitialize to test
        await saveAgentConfig();
        success = await window.api.agentTestConnection('claude');
      } else if (activeTab === 'openai') {
        if (!openaiAgentApiKey.trim()) return;
        await saveAgentConfig();
        success = await window.api.agentTestConnection('openai');
      }

      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      console.error('[Settings] Connection test failed:', error);
      setTestResult('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveAgentConfig = async () => {
    const agentsConfig: any = {
      defaultProvider,
    };

    if (claudeApiKey.trim()) {
      agentsConfig.claude = { apiKey: claudeApiKey, model: claudeModel };
    }
    if (openaiAgentApiKey.trim()) {
      agentsConfig.openai = { apiKey: openaiAgentApiKey, model: openaiAgentModel };
    }

    await window.api.updateConfig({ agents: agentsConfig });
    await window.api.agentReinitialize();
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save folder AI settings
      if (folderApiKey.trim()) {
        await window.api.updateConfig({
          llm: {
            defaultProvider: 'openai',
            providers: { openai: { apiKey: folderApiKey, model: folderModel } },
          },
        });
      }

      // Save agent settings
      await saveAgentConfig();

      onClose();
    } catch (error) {
      console.error('[Settings] Failed to save:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'claude', label: 'Claude (Agent)' },
    { id: 'openai', label: 'OpenAI (Agent)' },
    { id: 'folder-ai', label: 'Folder Summaries' },
  ];

  const currentApiKey =
    activeTab === 'claude' ? claudeApiKey :
    activeTab === 'openai' ? openaiAgentApiKey :
    folderApiKey;

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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setTestResult(null); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Claude Agent Tab */}
            {activeTab === 'claude' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anthropic API Key
                  </label>
                  <input
                    type="password"
                    value={claudeApiKey}
                    onChange={(e) => setClaudeApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from{' '}
                    <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      Anthropic Console
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <select
                    value={claudeModel}
                    onChange={(e) => setClaudeModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5 (Recommended)</option>
                    <option value="claude-opus-4-20250514">Claude Opus 4 (Most Capable)</option>
                    <option value="claude-haiku-3-5-20241022">Claude Haiku 3.5 (Fastest)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="default-claude"
                    checked={defaultProvider === 'claude'}
                    onChange={() => setDefaultProvider('claude')}
                  />
                  <label htmlFor="default-claude" className="text-sm text-gray-700">
                    Use Claude as default AI assistant
                  </label>
                </div>
              </>
            )}

            {/* OpenAI Agent Tab */}
            {activeTab === 'openai' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key (for AI Assistant)
                  </label>
                  <input
                    type="password"
                    value={openaiAgentApiKey}
                    onChange={(e) => setOpenaiAgentApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from{' '}
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      OpenAI Platform
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <select
                    value={openaiAgentModel}
                    onChange={(e) => setOpenaiAgentModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="gpt-4-turbo">GPT-4 Turbo (Recommended)</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (Fastest)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="default-openai"
                    checked={defaultProvider === 'openai'}
                    onChange={() => setDefaultProvider('openai')}
                  />
                  <label htmlFor="default-openai" className="text-sm text-gray-700">
                    Use OpenAI as default AI assistant
                  </label>
                </div>
              </>
            )}

            {/* Folder AI Tab */}
            {activeTab === 'folder-ai' && (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  Configure OpenAI for folder summary generation (separate from the AI Assistant).
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={folderApiKey}
                    onChange={(e) => setFolderApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <select
                    value={folderModel}
                    onChange={(e) => setFolderModel(e.target.value as 'gpt-4-turbo' | 'gpt-3.5-turbo')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="gpt-4-turbo">GPT-4 Turbo (Recommended)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, less capable)</option>
                  </select>
                </div>
              </>
            )}

            {/* Test Connection */}
            <div>
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection || !currentApiKey.trim()}
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
            disabled={isSaving}
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
