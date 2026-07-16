import { X, Type, AlignLeft, SpellCheck, ArrowDownUp, Settings } from 'lucide-react';
import { useState } from 'react';

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
  setSyncScrollEnabled
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-4xl h-[600px] max-h-[85vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/20 shrink-0">
          <h2 className="text-lg font-medium text-zinc-100">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
          {/* Settings Sidebar */}
          <div className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950/50 p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto">
            <button 
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'general' ? 'bg-zinc-800/80 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300'}`}
            >
              <Settings size={16} />
              General
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
          </div>
        </div>
      </div>
    </div>
  );
}
