import React, { useEffect, useRef, useState } from 'react';
import { SuggestionState, SuggestionType, SuggestionItem } from '../hooks/useAutocomplete';
import { Hash, Code, Sparkles, Smile, LayoutTemplate, List, Link, ChevronRight, X } from 'lucide-react';

interface AutocompletePopupProps {
  state: SuggestionState;
  onSelect: (item: SuggestionItem) => void;
}

export function AutocompletePopup({ state, onSelect }: AutocompletePopupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<SuggestionItem | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Find the element with the selected background class. 
      // Since we use bg-emerald-500/10 for selected item:
      const selected = containerRef.current.querySelector('.autocomplete-selected');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [state.selectedIndex]);

  if (!state.active || state.items.length === 0) return null;

  const activePreview = hoveredItem || state.items[state.selectedIndex];

  return (
    <div 
      className="absolute z-50 flex items-start" 
      style={{ top: state.y, left: state.x }}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <div 
        ref={containerRef}
        className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-y-auto w-64 max-h-64 flex flex-col no-scrollbar"
      >
        <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10 border-b border-zinc-800 flex items-center gap-1.5">
        <Sparkles size={10} className="text-zinc-400" />
        {state.type === 'slash' ? 'Commands' : state.type === 'code' ? 'Languages' : state.type === 'link' ? 'Links' : 'Emojis'}
      </div>
      
      <div className="p-1">
        {state.items.map((item, index) => {
          const isSelected = index === state.selectedIndex;
          return (
            <div 
              key={item.id} 
              onMouseEnter={() => setHoveredItem(item)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className={`flex items-center px-2 py-1.5 mx-1 rounded-md cursor-pointer text-sm transition-colors group ${isSelected ? 'autocomplete-selected bg-zinc-800/80 text-zinc-100' : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.title}</div>
                {item.description && (
                  <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {item.description}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredItem(item);
                }}
                className={`p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700'}`}
                title="Preview"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
      </div>
      
      {activePreview && (
        <div className="absolute top-0 left-full ml-2 w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200 z-[60]">
          <div className="flex items-center justify-between h-10 px-3 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm">
            <h2 className="font-medium text-[13px] text-zinc-200 truncate pr-2">Preview: {activePreview.title}</h2>
          </div>
          <div className="p-3">
            <p className="text-xs text-zinc-400 mb-3">{activePreview.description || 'No description available.'}</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 font-mono text-[11px] text-emerald-400 whitespace-pre-wrap break-all">
              {activePreview.insertText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
