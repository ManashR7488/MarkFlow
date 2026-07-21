import { useRef, useState, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Link, Heading1, Heading2, Quote, Code, Download, Smile, Lock, Unlock, AlertCircle, Fingerprint } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useAutocomplete, SuggestionType } from '../hooks/useAutocomplete';
import { AutocompletePopup } from './AutocompletePopup';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  spellCheck?: boolean;
  isLocked?: boolean;
  hasPasskey?: boolean;
  onUnlock?: (password: string) => void;
  onUnlockPasskey?: () => void;
  onLock?: () => void;
  unlockError?: string;
}

export function Editor({ content, onChange, spellCheck = false, isLocked = false, hasPasskey = false, onUnlock, onUnlockPasskey, onLock, unlockError }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { state: autocompleteState, handleInput, onKeyDown, closeSuggestions } = useAutocomplete();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onEmojiClick = (emojiObject: any) => {
    insertFormatting(emojiObject.native || emojiObject.emoji, '');
    setShowEmojiPicker(false);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const scrollTop = textarea.scrollTop;

    const before = content.substring(0, start);
    const after = content.substring(end);

    const newContent = `${before}${prefix}${selectedText}${suffix}${after}`;
    onChange(newContent);

    // Set focus and cursor position after React re-renders
    setTimeout(() => {
      textarea.focus();
      textarea.scrollTop = scrollTop;
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    
    // Find the start of the line
    const beforeCursor = content.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const before = content.substring(0, lineStart);
    const after = content.substring(lineStart);
    
    // Check if prefix already exists
    if (after.startsWith(prefix)) {
        // Remove prefix
        onChange(before + after.substring(prefix.length));
        setTimeout(() => {
            textarea.focus();
            textarea.scrollTop = scrollTop;
            textarea.setSelectionRange(Math.max(0, start - prefix.length), Math.max(0, end - prefix.length));
        }, 0);
    } else {
        // Add prefix
        onChange(before + prefix + after);
        setTimeout(() => {
            textarea.focus();
            textarea.scrollTop = scrollTop;
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    }
  };

  const handleAutocompleteInsert = (insertText: string, triggerIdx: number, type: SuggestionType) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const before = content.substring(0, triggerIdx);
    const after = content.substring(textarea.selectionStart);
    const scrollTop = textarea.scrollTop;
    
    // Replace the trigger with the insertText
    const newContent = before + insertText + after;
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.scrollTop = scrollTop;
      textarea.setSelectionRange(before.length + insertText.length, before.length + insertText.length);
      closeSuggestions();
    }, 0);
  };

  return (
    <div className="flex flex-col w-full h-full relative" onClick={() => closeSuggestions()}>
      <div className="min-h-[40px] border-b border-zinc-800/80 bg-zinc-950 flex flex-wrap items-center px-2 py-1 shrink-0 gap-1 z-10 relative">
        <ToolbarButton icon={<Bold size={14} />} onClick={() => insertFormatting('**', '**')} title="Bold" />
        <ToolbarButton icon={<Italic size={14} />} onClick={() => insertFormatting('*', '*')} title="Italic" />
        <div className="w-px h-4 bg-zinc-800 mx-1"></div>
        <ToolbarButton icon={<Heading1 size={14} />} onClick={() => insertLinePrefix('# ')} title="Heading 1" />
        <ToolbarButton icon={<Heading2 size={14} />} onClick={() => insertLinePrefix('## ')} title="Heading 2" />
        <div className="w-px h-4 bg-zinc-800 mx-1"></div>
        <ToolbarButton icon={<List size={14} />} onClick={() => insertLinePrefix('- ')} title="Bullet List" />
        <ToolbarButton icon={<ListOrdered size={14} />} onClick={() => insertLinePrefix('1. ')} title="Numbered List" />
        <div className="w-px h-4 bg-zinc-800 mx-1"></div>
        <ToolbarButton icon={<Quote size={14} />} onClick={() => insertLinePrefix('> ')} title="Quote" />
        <ToolbarButton icon={<Code size={14} />} onClick={() => insertFormatting('`', '`')} title="Inline Code" />
        <ToolbarButton icon={<Link size={14} />} onClick={() => insertFormatting('[', '](url)')} title="Link" />
        <div className="w-px h-4 bg-zinc-800 mx-1"></div>
        <div className="relative" ref={emojiPickerRef}>
          <ToolbarButton icon={<Smile size={14} />} onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Insert Emoji" />
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 z-50 shadow-xl border border-zinc-800 rounded-lg">
              <Picker data={data} onEmojiSelect={onEmojiClick} theme="dark" />
            </div>
          )}
        </div>
        <div className="flex-1"></div>
        {onLock && (
          <ToolbarButton 
            icon={isLocked ? <Unlock size={14} /> : <Lock size={14} />} 
            onClick={isLocked ? () => {} : onLock} 
            title={isLocked ? "Unlock Document" : "Lock Document"} 
          />
        )}
        <ToolbarButton icon={<Download size={14} />} onClick={handleDownloadMd} title="Download .md" />
      </div>
      <div className="flex-1 relative min-h-0">
        {isLocked ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-6 animate-in fade-in duration-300">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 max-w-sm w-full text-center space-y-6">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-rose-500/20">
                <Lock size={32} className="text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-zinc-100">Document Locked</h3>
                <p className="text-sm text-zinc-400 mt-2">Enter your master password to decrypt and view this document.</p>
              </div>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Master Password"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && onUnlock) {
                      onUnlock(unlockPassword);
                      setUnlockPassword('');
                    }
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all shadow-inner text-center tracking-widest placeholder:tracking-normal"
                />
                {unlockError && (
                  <div className="text-[13px] text-rose-400 flex items-center justify-center gap-1.5">
                    <AlertCircle size={14} />
                    {unlockError}
                  </div>
                )}
                <button
                  onClick={() => {
                    if (onUnlock) onUnlock(unlockPassword);
                    setUnlockPassword('');
                  }}
                  disabled={!unlockPassword}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:hover:bg-rose-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Unlock Document
                </button>
                {hasPasskey && (
                  <button
                    onClick={() => {
                      if (onUnlockPasskey) onUnlockPasskey();
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Fingerprint size={16} className="text-zinc-400" />
                    Unlock with Fingerprint
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              id="editor-textarea"
          value={content}
          onChange={(e) => {
            onChange(e.target.value);
            handleInput(e.target);
          }}
          onKeyDown={(e) => {
            if (onKeyDown(e, handleAutocompleteInsert)) return;
          }}
          onClick={(e) => {
            e.stopPropagation();
            closeSuggestions();
          }}
          placeholder="Start typing your markdown..."
          className="w-full h-full bg-zinc-950 text-zinc-300 font-mono text-[15px] p-6 resize-none outline-none leading-relaxed custom-scrollbar block"
          spellCheck={spellCheck}
        />
            <AutocompletePopup 
              state={autocompleteState} 
              onSelect={(item) => handleAutocompleteInsert(item.insertText, autocompleteState.triggerIndex, autocompleteState.type)} 
            />
          </>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ icon, onClick, title }: { icon: React.ReactNode, onClick: () => void, title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded transition-colors shrink-0"
    >
      {icon}
    </button>
  );
}
