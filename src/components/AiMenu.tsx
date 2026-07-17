import { Sparkles, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { AIConfig } from '../types';

interface AiMenuProps {
  aiConfig: AIConfig;
  setAiConfig: (config: AIConfig) => void;
  onOpenSettings: () => void;
}

export function AiMenu({ aiConfig, setAiConfig, onOpenSettings }: AiMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleFeature = (feature: keyof AIConfig['features']) => {
    const currentFeature = aiConfig.features[feature];
    if (currentFeature) {
      setAiConfig({
        ...aiConfig,
        features: {
          ...aiConfig.features,
          [feature]: {
            ...currentFeature,
            enabled: currentFeature.enabled === false ? true : false,
          }
        }
      });
    } else {
      // Open settings to configure
      setIsOpen(false);
      onOpenSettings();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-5 h-5 flex items-center justify-center rounded transition-colors ml-1 ${isOpen ? 'bg-zinc-800 text-amber-400' : 'hover:bg-zinc-800 hover:text-amber-400 text-zinc-400'}`}
        title="AI Features"
      >
        <Sparkles size={13} />
      </button>

      {isOpen && (
        <div 
          className="absolute bottom-full left-0 mb-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50 mb-1 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400" />
            AI Features
          </div>
          
          {[
            { id: 'autoComplete', name: 'Auto-Complete' },
            { id: 'promptToMarkdown', name: 'Prompt to Markdown' },
            { id: 'templateGeneration', name: 'Template Generation' }
          ].map(({ id, name }) => {
            const feature = id as keyof AIConfig['features'];
            const config = aiConfig.features[feature];
            const isConfigured = !!config?.provider;
            const isEnabled = isConfigured && config.enabled !== false;

            return (
              <label key={id} className="flex items-center justify-between px-2 py-2 hover:bg-zinc-800/50 rounded cursor-pointer group transition-colors">
                <span className={`text-sm ${isConfigured ? 'text-zinc-300' : 'text-zinc-500'}`}>{name}</span>
                <div className="relative shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={isEnabled}
                    onChange={() => toggleFeature(feature)}
                  />
                  <div className={`block w-8 h-4.5 rounded-full transition-colors ${isEnabled ? 'bg-emerald-500/80' : 'bg-zinc-800 border border-zinc-700'}`}></div>
                  <div className={`absolute left-0.5 top-[2px] bg-white w-3.5 h-3.5 rounded-full transition-transform ${isEnabled ? 'translate-x-3.5' : 'translate-x-0'} ${!isConfigured ? 'opacity-50' : ''}`}></div>
                </div>
              </label>
            );
          })}
          
          <div className="mt-1 pt-1 border-t border-zinc-800/50">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded transition-colors"
            >
              <Settings size={12} />
              Configure Providers...
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
