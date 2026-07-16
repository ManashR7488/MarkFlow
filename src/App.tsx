import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { useNotes } from './hooks/useNotes';
import { FileText, Download, PanelLeft, PanelRight, Eye, Edit2, GripVertical, Type, AlignLeft, SpellCheck, Hash, Undo2, Redo2 } from 'lucide-react';
import { Group, Panel, Separator } from 'react-resizable-panels';

export default function App() {
  const { notes, activeNoteId, setActiveNoteId, addNote, updateNote, deleteNote } = useNotes();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [editorOpen, setEditorOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [lineHeight, setLineHeight] = useState<number>(1.6);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-zinc-800 selection:text-zinc-100">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden no-print" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {sidebarOpen && (
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
          onUpdateNote={updateNote}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
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

        {/* Editor / Preview Split */}
        {activeNote ? (
          <Group direction="horizontal" className="flex-1 overflow-hidden">
            {(!isMobile ? editorOpen : !showPreviewMobile) && (
              <Panel
                id="editor"
                order={1}
                defaultSize={50}
                minSize={20}
                className="border-r border-zinc-800/80 no-print flex"
              >
                <Editor
                  content={activeNote.content}
                  onChange={(content) => updateNote(activeNote.id, { content })}
                  spellCheck={spellCheckEnabled}
                />
              </Panel>
            )}
            
            {(!isMobile ? editorOpen : false) && (
              <Separator
                className="w-1.5 bg-zinc-900/50 hover:bg-zinc-700 active:bg-zinc-600 transition-colors flex items-center justify-center cursor-col-resize no-print group z-10"
              >
                <div className="w-0.5 h-8 bg-zinc-600 rounded-full group-hover:bg-zinc-400" />
              </Separator>
            )}
            
            {(!isMobile ? true : showPreviewMobile) && (
              <Panel
                id="preview"
                order={2}
                defaultSize={50}
                minSize={20}
                className="overflow-hidden bg-zinc-950/50 print-area flex"
              >
                <Preview content={activeNote.content} fontSize={fontSize} lineHeight={lineHeight} />
              </Panel>
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
              onClick={() => setSpellCheckEnabled(!spellCheckEnabled)}
              className={`flex items-center gap-1.5 transition-colors ${spellCheckEnabled ? 'text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Toggle Spell Check"
            >
              <SpellCheck size={12} />
              <span>Spell Check</span>
            </button>

            <div className="w-px h-3 bg-zinc-800"></div>

            <div className="flex items-center gap-1">
              <Type size={12} className="mr-0.5" title="Font Size" />
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
            
            <div className="flex items-center gap-1">
              <AlignLeft size={12} className="mr-0.5" title="Line Height" />
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
      </div>
    </div>
  );
}
