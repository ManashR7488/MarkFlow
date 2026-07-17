import { X, Type, AlignLeft, SpellCheck, ArrowDownUp, Settings, Sparkles, Cpu, Check, Loader2, AlertCircle, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AIConfig, AIProvider, AIProviderConfig } from '../types';
import { LLMService } from '../ai/llm';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  spellCheckEnabled: boolean;
  setSpellCheckEnabled: (enabled: boolean) => void;
  syncScrollEnabled: boolean;
  setSyncScrollEnabled: (enabled: boolean) => void;
  aiConfig: AIConfig;
  setAiConfig: (config: AIConfig) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  spellCheckEnabled,
  setSpellCheckEnabled,
  syncScrollEnabled,
  setSyncScrollEnabled,
  aiConfig,
  setAiConfig
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [availableModels, setAvailableModels] = useState<Record<string, string[]>>({});
  
  const [tempProviders, setTempProviders] = useState<Partial<Record<AIProvider, AIProviderConfig>>>({});
  const [verificationStatus, setVerificationStatus] = useState<Record<string, 'idle' | 'validating' | 'valid' | 'invalid'>>({});

  useEffect(() => {
    if (isOpen) {
      setTempProviders(aiConfig.providers);
    }
  }, [isOpen, aiConfig.providers]);

  const fetchModels = async (provider: AIProvider) => {
    try {
      const llm = new LLMService(aiConfig);
      const models = await llm.fetchModels(provider);
      setAvailableModels(prev => ({ ...prev, [provider]: models }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyAndSave = async (provider: AIProvider) => {
    const configToTest = tempProviders[provider];
    if (!configToTest || (!configToTest.apiKey && provider !== 'ollama')) {
      setVerificationStatus(prev => ({ ...prev, [provider]: 'invalid' }));
      return;
    }

    setVerificationStatus(prev => ({ ...prev, [provider]: 'validating' }));
    
    try {
      const llm = new LLMService({ 
        ...aiConfig, 
        providers: { ...aiConfig.providers, [provider]: configToTest } 
      });
      
      const models = await llm.fetchModels(provider);
      setAvailableModels(prev => ({ ...prev, [provider]: models }));
      
      setAiConfig({ 
        ...aiConfig, 
        providers: { ...aiConfig.providers, [provider]: configToTest } 
      });
      setVerificationStatus(prev => ({ ...prev, [provider]: 'valid' }));
    } catch (error) {
      console.error(error);
      setVerificationStatus(prev => ({ ...prev, [provider]: 'invalid' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-7xl h-[900px] max-h-[85vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm shrink-0">
          <h2 className="font-medium text-[15px] text-zinc-200">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/50 p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto">
            <button 
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'general' ? 'bg-zinc-800/80 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300'}`}
            >
              <Settings size={16} />
              General
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'ai' ? 'bg-zinc-800/80 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300'}`}
            >
              <Sparkles size={16} />
              AI
            </button>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {activeTab === 'general' && (
              <div className="space-y-8 max-w-xl">
                {/* Typography */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Typography</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <Type size={18} className="text-zinc-500" />
                      <span className="text-sm">Font Size</span>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-900/50 rounded-lg p-1 border border-zinc-800/50">
                      <button
                        onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                        className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-mono text-zinc-200">{fontSize}px</span>
                      <button
                        onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                        className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <AlignLeft size={18} className="text-zinc-500" />
                      <span className="text-sm">Line Height</span>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-900/50 rounded-lg p-1 border border-zinc-800/50">
                      <button
                        onClick={() => setLineHeight(Math.max(1.2, Number((lineHeight - 0.1).toFixed(1))))}
                        className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-mono text-zinc-200">{lineHeight.toFixed(1)}</span>
                      <button
                        onClick={() => setLineHeight(Math.min(2.4, Number((lineHeight + 0.1).toFixed(1))))}
                        className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-zinc-800/50" />

                {/* Editor */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Editor</h3>
                  
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <SpellCheck size={18} className="text-zinc-500" />
                      <span className="text-sm">Spell Check</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={spellCheckEnabled}
                        onChange={(e) => setSpellCheckEnabled(e.target.checked)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${spellCheckEnabled ? 'bg-zinc-600' : 'bg-zinc-800 border border-zinc-700'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${spellCheckEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <ArrowDownUp size={18} className="text-zinc-500" />
                      <div>
                        <div className="text-sm">Sync Scroll</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Sync scrolling between editor and preview</div>
                      </div>
                    </div>
                    <div className="relative shrink-0">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={syncScrollEnabled}
                        onChange={(e) => setSyncScrollEnabled(e.target.checked)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${syncScrollEnabled ? 'bg-zinc-600' : 'bg-zinc-800 border border-zinc-700'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${syncScrollEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-10 max-w-4xl m-auto pb-10">
                {/* Providers Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                      <Cpu size={20} className="text-emerald-400" />
                      Model Providers
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">Configure your API keys for different AI providers to enable intelligent features.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['openai', 'anthropic', 'google', 'ollama'].map((provider) => {
                      const isConfigured = provider === 'ollama' 
                        ? !!aiConfig.providers[provider as AIProvider]?.baseUrl 
                        : !!aiConfig.providers[provider as AIProvider]?.apiKey;
                        
                      const status = verificationStatus[provider] || 'idle';

                      return (
                        <div key={provider} className={`bg-zinc-900/40 border ${status === 'valid' ? 'border-emerald-500/30' : status === 'invalid' ? 'border-rose-500/30' : 'border-zinc-800/80'} rounded-xl p-5 space-y-4 hover:border-zinc-700/80 transition-colors relative overflow-hidden group`}>
                          {status === 'valid' && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-2xl rounded-bl-full pointer-events-none" />
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50 shadow-inner">
                                <Cpu size={16} className={status === 'valid' || isConfigured ? "text-emerald-400" : "text-zinc-400"} />
                              </div>
                              <span className="font-medium text-zinc-100 capitalize tracking-wide">{provider}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-950/50 border border-zinc-800/60">
                              {status === 'valid' ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : status === 'invalid' ? (
                                <AlertCircle size={12} className="text-rose-400" />
                              ) : status === 'validating' ? (
                                <Loader2 size={12} className="text-amber-400 animate-spin" />
                              ) : (
                                <div className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`} />
                              )}
                              <span className={`text-[10px] font-medium uppercase tracking-wider ${status === 'valid' ? 'text-emerald-400' : status === 'invalid' ? 'text-rose-400' : status === 'validating' ? 'text-amber-400' : 'text-zinc-400'}`}>
                                {status === 'valid' ? 'Verified' : status === 'invalid' ? 'Failed' : status === 'validating' ? 'Checking' : isConfigured ? 'Ready' : 'Setup'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-3 pt-2">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">API Key</label>
                              <div className="relative flex gap-2">
                                <input 
                                  type="password"
                                  placeholder={`Enter ${provider} API Key`}
                                  value={tempProviders[provider as AIProvider]?.apiKey || ''}
                                  onChange={(e) => {
                                    const newProviders = { ...tempProviders };
                                    if (!newProviders[provider as AIProvider]) {
                                      newProviders[provider as AIProvider] = { provider: provider as AIProvider, apiKey: '' };
                                    }
                                    newProviders[provider as AIProvider]!.apiKey = e.target.value;
                                    setTempProviders(newProviders);
                                    setVerificationStatus(prev => ({ ...prev, [provider]: 'idle' }));
                                  }}
                                  className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800/80 rounded-lg pl-3 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                                />
                                <button
                                  onClick={() => handleVerifyAndSave(provider as AIProvider)}
                                  disabled={status === 'validating' || (!tempProviders[provider as AIProvider]?.apiKey && provider !== 'ollama')}
                                  className="shrink-0 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-200 rounded-lg px-3 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  title="Verify and Save"
                                >
                                  {status === 'validating' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                </button>
                              </div>
                            </div>

                            {provider === 'ollama' && (
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Base URL</label>
                                <input 
                                  type="text"
                                  placeholder="http://localhost:11434"
                                  value={tempProviders[provider as AIProvider]?.baseUrl || ''}
                                  onChange={(e) => {
                                    const newProviders = { ...tempProviders };
                                    if (!newProviders[provider as AIProvider]) {
                                      newProviders[provider as AIProvider] = { provider: provider as AIProvider, apiKey: '', baseUrl: '' };
                                    }
                                    newProviders[provider as AIProvider]!.baseUrl = e.target.value;
                                    setTempProviders(newProviders);
                                    setVerificationStatus(prev => ({ ...prev, [provider]: 'idle' }));
                                  }}
                                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-zinc-800/60" />

                {/* Features Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                      <Sparkles size={20} className="text-amber-400" />
                      Feature Assignment
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">Select which provider and model powers each AI capability in the editor.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { id: 'autoComplete', name: 'Auto-Complete', desc: 'Predictive text and smart completions as you type.' },
                      { id: 'promptToMarkdown', name: 'Prompt to Markdown', desc: 'Generate complete markdown documents from a natural language prompt.' },
                      { id: 'templateGeneration', name: 'Template Generation', desc: 'Create structured document templates instantly.' }
                    ].map(({ id, name, desc }) => {
                      const feature = id as keyof AIConfig['features'];
                      const isConfigured = !!aiConfig.features[feature]?.provider;
                      
                      return (
                        <div key={feature} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-zinc-100">{name}</span>
                                {isConfigured ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Enabled</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">Disabled</span>
                                )}
                              </div>
                              <p className="text-[13px] text-zinc-500 leading-relaxed">{desc}</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 lg:w-[420px] shrink-0">
                              <div className="flex-1 space-y-1.5 min-w-0">
                                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Provider</label>
                                <select
                                  value={aiConfig.features[feature]?.provider || ''}
                                  onChange={(e) => {
                                    const p = e.target.value as AIProvider;
                                    setAiConfig({
                                      ...aiConfig,
                                      features: {
                                        ...aiConfig.features,
                                        [feature]: p ? { provider: p, modelId: '' } : null
                                      }
                                    });
                                    if (p) fetchModels(p);
                                  }}
                                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner appearance-none cursor-pointer"
                                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '16px' }}
                                >
                                  <option value="">Disabled</option>
                                  <option value="openai">OpenAI</option>
                                  <option value="anthropic">Anthropic</option>
                                  <option value="google">Google</option>
                                  <option value="ollama">Ollama</option>
                                </select>
                              </div>
                              
                              <div className="flex-1 space-y-1.5 min-w-0">
                                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Model</label>
                                <div className="flex gap-2">
                                  <select
                                    value={aiConfig.features[feature]?.modelId || ''}
                                    onChange={(e) => {
                                      setAiConfig({
                                        ...aiConfig,
                                        features: {
                                          ...aiConfig.features,
                                          [feature]: { ...aiConfig.features[feature]!, modelId: e.target.value }
                                        }
                                      });
                                    }}
                                    className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800/80 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap pr-8"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '16px' }}
                                    disabled={!aiConfig.features[feature]?.provider}
                                  >
                                    <option value="">Select Model...</option>
                                    {aiConfig.features[feature]?.provider && availableModels[aiConfig.features[feature]!.provider]?.map(m => (
                                      <option key={m} value={m}>{m}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => aiConfig.features[feature]?.provider && fetchModels(aiConfig.features[feature]!.provider)}
                                    disabled={!aiConfig.features[feature]?.provider}
                                    className="shrink-0 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-300 rounded-lg px-2.5 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Refresh Models"
                                  >
                                    <Sparkles size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
