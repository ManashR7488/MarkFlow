import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { SettingsModal } from './components/SettingsModal';
import { AiMenu } from './components/AiMenu';
import { ProfileModal } from './components/ProfileModal';
import { useNotes } from './hooks/useNotes';
import { useTemplates } from './hooks/useTemplates';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useSecurity } from './hooks/useSecurity';
import { UserProfile, AIConfig } from './types';
import { LLMService } from './ai/llm';
import { FileText, Download, PanelLeft, PanelRight, Eye, Edit2, GripVertical, Type, AlignLeft, SpellCheck, Hash, Undo2, Redo2, Wand2, ArrowDownUp, ArrowLeftRight, Maximize, Minimize, Bot, Loader2, Lock } from 'lucide-react';
import { Group, Panel, Separator } from 'react-resizable-panels';

const defaultAIConfig: AIConfig = {
  providers: {},
  features: {
    autoComplete: null,
    promptToMarkdown: null,
    templateGeneration: null,
  }
};

export default function App() {
  const { notes, activeNoteId, setActiveNoteId, addNote, updateNote, deleteNote } = useNotes();
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [editorOpen, setEditorOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [lineHeight, setLineHeight] = useState<number>(1.6);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState<boolean>(false);
  const [syncScrollEnabled, setSyncScrollEnabled] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [panelsSwapped, setPanelsSwapped] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGeneratingMarkdown, setIsGeneratingMarkdown] = useState(false);
  const { authState: googleAuth, login: googleLogin, logout: googleLogout } = useGoogleAuth();
  const security = useSecurity(notes, updateNote);
  const [showNoPasswordModal, setShowNoPasswordModal] = useState(false);
  
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('markdown-ai-config-v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse AI config');
      }
    }
    return defaultAIConfig;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('markdown-user-profile-v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user profile');
      }
    }
    return { username: 'guest', fullName: 'Guest User', email: '' };
  });

  useEffect(() => {
    localStorage.setItem('markdown-user-profile-v1', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    if (googleAuth.isConnected && googleAuth.user) {
      setUserProfile(prev => {
        // Auto-populate only if the profile is still the default guest profile
        const isDefault = prev.username === 'guest' && prev.fullName === 'Guest User' && !prev.email;
        if (isDefault) {
          return {
            ...prev,
            username: googleAuth.user?.email.split('@')[0] || 'guest',
            fullName: googleAuth.user?.name || 'Guest User',
            email: googleAuth.user?.email || '',
            avatar: googleAuth.user?.picture
          };
        }
        return prev;
      });
    }
  }, [googleAuth.isConnected, googleAuth.user]);

  useEffect(() => {
    localStorage.setItem('markdown-ai-config-v1', JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!syncScrollEnabled) return;

    const editor = document.getElementById('editor-textarea');
    const preview = document.getElementById('preview-scroll-container');

    if (!editor || !preview) return;

    let isSyncingLeft = false;
    let isSyncingRight = false;

    const handleEditorScroll = () => {
      if (!syncScrollEnabled) return;
      if (isSyncingLeft) {
        isSyncingLeft = false;
        return;
      }
      isSyncingRight = true;
      
      const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      if (!isNaN(percentage)) {
        preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
      }
    };

    const handlePreviewScroll = () => {
      if (!syncScrollEnabled) return;
      if (isSyncingRight) {
        isSyncingRight = false;
        return;
      }
      isSyncingLeft = true;

      const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      if (!isNaN(percentage)) {
        editor.scrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
      }
    };

    editor.addEventListener('scroll', handleEditorScroll);
    preview.addEventListener('scroll', handlePreviewScroll);

    return () => {
      editor.removeEventListener('scroll', handleEditorScroll);
      preview.removeEventListener('scroll', handlePreviewScroll);
    };
  }, [syncScrollEnabled, activeNoteId, editorOpen, showPreviewMobile]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const wordCount = activeNote ? activeNote.content.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const charCount = activeNote ? activeNote.content.length : 0;

  const handleUndo = () => {
    const textarea = document.getElementById('editor-textarea');
    if (textarea) {
      textarea.focus();
      document.execCommand('undo');
    }
  };

  const handleRedo = () => {
    const textarea = document.getElementById('editor-textarea');
    if (textarea) {
      textarea.focus();
      document.execCommand('redo');
    }
  };

  const handleLockRequest = async (noteId: string) => {
    if (!security.isConfigured) {
      setShowNoPasswordModal(true);
    } else {
      try {
        await security.lockNote(noteId);
      } catch (e: any) {
        if (e.message === 'VAULT_LOCKED') {
          const pass = window.prompt("Your vault is currently locked. Please enter your Master Password to encrypt this note:");
          if (pass) {
            try {
              await security.lockNote(noteId, pass);
            } catch (err: any) {
              alert("Failed to lock note: " + err.message);
            }
          }
        } else {
          alert("Failed to lock note: " + e.message);
        }
      }
    }
  };

  const handleFormat = () => {
    if (!activeNote) return;
    const formatted = activeNote.content
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2 newlines
      .replace(/[ \t]+\n/g, '\n') // Remove trailing whitespace from lines
      .trim(); // Remove leading/trailing whitespace from document
    updateNote(activeNote.id, { content: formatted });
  };

  const handlePromptToMarkdown = async () => {
    if (!activeNote || !activeNote.content.trim()) return;
    
    if (!aiConfig.features.promptToMarkdown?.provider) {
      alert('Prompt to Markdown AI is not configured. Please configure it in Settings -> AI.');
      setIsSettingsOpen(true);
      return;
    }

    setIsGeneratingMarkdown(true);
    
    try {
      const llm = new LLMService(aiConfig, googleAuth.accessToken);
      const defaultSystemPrompt = 'You are an expert markdown writer and converter. The user will give you a messy, broken markdown or plain text prompt. Your job is to convert it into clean, well-structured markdown. Correct any grammar or spelling mistakes. DO NOT add any additional information, conversational text, or context that is not present in the original prompt. Keep the original intent intact. Return ONLY the markdown output.';
      const systemPrompt = aiConfig.features.promptToMarkdown.systemPrompt || defaultSystemPrompt;
      
      const fullPrompt = `${systemPrompt}\n\nUser Prompt:\n${activeNote.content}`;
      const response = await llm.generate('promptToMarkdown', fullPrompt);
      
      const cleanedResponse = response.replace(/^```markdown\s*/i, '').replace(/\s*```$/, '').trim();
      updateNote(activeNote.id, { content: cleanedResponse });
    } catch (error: any) {
      alert(error.message || 'Failed to convert prompt to markdown.');
      console.error('Prompt to Markdown error:', error);
    } finally {
      setIsGeneratingMarkdown(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-zinc-800 selection:text-zinc-100">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && !focusMode && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden no-print" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {sidebarOpen && !focusMode && (
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={(id) => {
            setActiveNoteId(id);
            // Close sidebar on mobile after selection
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
          onUpdateNote={(id, updates) => {
          updateNote(id, updates);
          if (updates.archived && activeNoteId === id) {
            const remaining = notes.filter(n => n.id !== id && !n.archived);
            setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
          }
        }}
          onClose={() => setSidebarOpen(false)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          userProfile={userProfile}
          templates={templates}
          onToggleLock={(note) => {
            if (note.locked) {
              // Will be unlocked from editor
              setActiveNoteId(note.id);
            } else {
              handleLockRequest(note.id);
            }
          }}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        {!focusMode && (
        <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 no-print z-10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors shrink-0"
              title="Toggle Sidebar"
            >
              <PanelLeft size={18} />
            </button>
            {activeNote && (
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                placeholder="Document Title"
                className="bg-transparent border-none outline-none font-medium text-[15px] text-zinc-200 placeholder:text-zinc-700 focus:ring-0 truncate w-full max-w-sm"
              />
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Editor Toggle */}
            <button
              onClick={() => setEditorOpen(!editorOpen)}
              className="hidden md:flex p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
              title={editorOpen ? "Hide Editor" : "Show Editor"}
            >
              {editorOpen ? <Eye size={18} /> : <Edit2 size={18} />}
            </button>
            <button
              onClick={() => setShowPreviewMobile(!showPreviewMobile)}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors md:hidden"
              title="Toggle Preview"
            >
              <PanelRight size={18} />
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!activeNote}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wide text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 hover:text-zinc-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              <Download size={14} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </header>
        )}

        {/* Editor / Preview Split */}
        {activeNote ? (
          <Group orientation="horizontal" className="flex-1 overflow-hidden" key={panelsSwapped ? 'swapped' : 'normal'}>
            {/* First Panel: Editor or Preview depending on swap state */}
            {panelsSwapped ? (
              // Swapped: Preview first
              (!isMobile ? true : showPreviewMobile) && (
                <Panel
                  id="preview"
                  defaultSize={50}
                  minSize={20}
                  className="overflow-hidden bg-zinc-950/50 print-area flex border-r border-zinc-800/80"
                >
                  <Preview content={activeNote.content} fontSize={fontSize} lineHeight={lineHeight} />
                </Panel>
              )
            ) : (
              // Normal: Editor first
              (!isMobile ? editorOpen : !showPreviewMobile) && (
                <Panel
                  id="editor"
                  defaultSize={50}
                  minSize={20}
                  className="border-r border-zinc-800/80 no-print flex"
                >
                  <Editor
                    content={activeNote.content}
                    onChange={(content) => updateNote(activeNote.id, { content })}
                    spellCheck={spellCheckEnabled}
                    isLocked={activeNote.locked && !security.unlockedSessionNotes.has(activeNote.id)}
                    hasPasskey={!!security.config.passkeyId}
                    onUnlock={(password) => security.unlockNote(activeNote.id, password)}
                    onUnlockPasskey={() => security.unlockNote(activeNote.id)}
                    onLock={() => handleLockRequest(activeNote.id)}
                    unlockError={security.unlockError}
                  />
                </Panel>
              )
            )}
            
            {(!isMobile ? editorOpen : false) && (
              <Separator
                className="w-1.5 bg-zinc-900/50 hover:bg-zinc-700 active:bg-zinc-600 transition-colors flex items-center justify-center cursor-col-resize no-print group z-10"
              >
                <div className="w-0.5 h-8 bg-zinc-600 rounded-full group-hover:bg-zinc-400" />
              </Separator>
            )}
            
            {/* Second Panel: Preview or Editor depending on swap state */}
            {panelsSwapped ? (
              // Swapped: Editor second
              (!isMobile ? editorOpen : !showPreviewMobile) && (
                <Panel
                  id="editor"
                  defaultSize={50}
                  minSize={20}
                  className="no-print flex"
                >
                  <Editor
                    content={activeNote.content}
                    onChange={(content) => updateNote(activeNote.id, { content })}
                    spellCheck={spellCheckEnabled}
                    isLocked={activeNote.locked && !security.unlockedSessionNotes.has(activeNote.id)}
                    hasPasskey={!!security.config.passkeyId}
                    onUnlock={(password) => security.unlockNote(activeNote.id, password)}
                    onUnlockPasskey={() => security.unlockNote(activeNote.id)}
                    onLock={() => handleLockRequest(activeNote.id)}
                    unlockError={security.unlockError}
                  />
                </Panel>
              )
            ) : (
              // Normal: Preview second
              (!isMobile ? true : showPreviewMobile) && (
                <Panel
                  id="preview"
                  defaultSize={50}
                  minSize={20}
                  className="overflow-hidden bg-zinc-950/50 print-area flex"
                >
                  <Preview content={activeNote.content} fontSize={fontSize} lineHeight={lineHeight} />
                </Panel>
              )
            )}
          </Group>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 no-print">
            <FileText size={48} className="mb-4 opacity-20" strokeWidth={1} />
            <p className="text-sm">Select a document or create a new one</p>
          </div>
        )}

        {/* Status Bar */}
        <div className="flex items-center justify-between gap-4 px-3 h-6 border-t border-zinc-800/80 bg-zinc-950 shrink-0 no-print text-[11px] text-zinc-400 select-none w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                className="w-5 h-5 flex items-center justify-center hover:bg-zinc-800 hover:text-zinc-200 rounded transition-colors"
                title="Undo"
              >
                <Undo2 size={13} />
              </button>
              <button
                onClick={handleRedo}
                className="w-5 h-5 flex items-center justify-center hover:bg-zinc-800 hover:text-zinc-200 rounded transition-colors"
                title="Redo"
              >
                <Redo2 size={13} />
              </button>
              <button
                onClick={handleFormat}
                className="w-5 h-5 flex items-center justify-center hover:bg-zinc-800 hover:text-zinc-200 rounded transition-colors ml-1"
                title="Format / Trim Whitespace"
              >
                <Wand2 size={13} />
              </button>
              <button
                onClick={handlePromptToMarkdown}
                disabled={isGeneratingMarkdown || !activeNote || !activeNote.content.trim()}
                className="h-5 flex items-center justify-center gap-1.5 hover:bg-zinc-800 hover:text-purple-400 rounded transition-colors ml-1 px-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Convert Prompt to Markdown"
              >
                {isGeneratingMarkdown ? <Loader2 size={13} className="animate-spin text-purple-400" /> : <Bot size={13} />}
                <span className="text-[10px] uppercase font-medium">Prompt to MD</span>
              </button>
              <AiMenu aiConfig={aiConfig} setAiConfig={setAiConfig} onOpenSettings={() => setIsSettingsOpen(true)} />
            </div>
            
            {activeNote && (
              <>
                <div className="flex items-center gap-1.5" title="Word Count">
                  <Hash size={12} className="opacity-70" />
                  <span>{wordCount} words</span>
                </div>
                <div className="flex items-center gap-1.5" title="Character Count">
                  <Type size={12} className="opacity-70" />
                  <span>{charCount} chars</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPanelsSwapped(!panelsSwapped)}
              className={`flex items-center gap-1.5 transition-colors ${panelsSwapped ? 'text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Swap Editor & Preview Panels"
            >
              <ArrowLeftRight size={12} />
            </button>

            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`flex items-center gap-1.5 transition-colors ${focusMode ? 'text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Toggle Focus Mode"
            >
              {focusMode ? <Minimize size={12} /> : <Maximize size={12} />}
            </button>

            <button
              onClick={() => setSyncScrollEnabled(!syncScrollEnabled)}
              className={`flex items-center gap-1.5 transition-colors ${syncScrollEnabled ? 'text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Toggle Sync Scroll"
            >
              <ArrowDownUp size={12} />
            </button>

            <button
              onClick={() => setSpellCheckEnabled(!spellCheckEnabled)}
              className={`flex items-center gap-1.5 transition-colors ${spellCheckEnabled ? 'text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Toggle Spell Check"
            >
              <SpellCheck size={12} />
            </button>

            <div className="w-px h-3 bg-zinc-800"></div>

            <div className="flex items-center gap-1" title="Font Size">
              <Type size={12} className="mr-0.5" />
              <button 
                onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                className="w-4 h-4 flex items-center justify-center hover:bg-zinc-800 hover:text-zinc-200 rounded transition-colors"
                title="Decrease Font Size"
              >
                -
              </button>
              <span className="min-w-[3.5ch] text-center font-mono">{(fontSize)}px</span>
              <button 
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                className="w-4 h-4 flex items-center justify-center hover:bg-zinc-800 hover:text-zinc-200 rounded transition-colors"
                title="Increase Font Size"
              >
                +
              </button>
            </div>
            
            <div className="flex items-center gap-1" title="Line Height">
              <AlignLeft size={12} className="mr-0.5" />
              <button 
                onClick={() => setLineHeight(Math.max(1.2, Number((lineHeight - 0.1).toFixed(1))))}
                className="w-4 h-4 flex items-center justify-center hover:bg-zinc-800 hover:text-zinc-200 rounded transition-colors"
                title="Decrease Line Height"
              >
                -
              </button>
              <span className="min-w-[3ch] text-center font-mono">{lineHeight.toFixed(1)}</span>
              <button 
                onClick={() => setLineHeight(Math.min(2.4, Number((lineHeight + 0.1).toFixed(1))))}
                className="w-4 h-4 flex items-center justify-center hover:bg-zinc-800 hover:text-zinc-200 rounded transition-colors"
                title="Increase Line Height"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </main>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        spellCheckEnabled={spellCheckEnabled}
        setSpellCheckEnabled={setSpellCheckEnabled}
        syncScrollEnabled={syncScrollEnabled}
        setSyncScrollEnabled={setSyncScrollEnabled}
        aiConfig={aiConfig}
        setAiConfig={setAiConfig}
        googleAuth={googleAuth}
        onGoogleLogin={googleLogin}
        onGoogleLogout={googleLogout}
        templates={templates}
        onAddTemplate={addTemplate}
        onUpdateTemplate={updateTemplate}
        onDeleteTemplate={deleteTemplate}
        security={security}
        notes={notes}
        onUnarchiveNote={(id) => updateNote(id, { archived: false })}
        onDeleteNote={deleteNote}
        onSelectNote={setActiveNoteId}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />

      {showNoPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
              <Lock size={18} className="text-rose-400" />
              Master Password Not Set
            </h3>
            <p className="text-sm text-zinc-400">
              You need to set a master password in the Privacy & Security settings before you can lock notes.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowNoPasswordModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNoPasswordModal(false);
                  setIsSettingsOpen(true);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Open Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
