import { Plus, Trash2, FileText, X, Search, MoreVertical, Copy, Edit2, Pin, Archive, LayoutTemplate, Store, Sparkles, User, Settings, HelpCircle, LogOut, ChevronRight, Paintbrush } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Note, UserProfile } from '../types';

export const TEMPLATES = {
  journal: {
    name: 'Journal Entry',
    content: `# Journal Entry - ${new Date().toLocaleDateString()}\n\n## Intentions\n- \n\n## What happened today?\n\n## Gratitude\n1. \n2. \n3. `
  },
  meeting: {
    name: 'Meeting Notes',
    content: `# Meeting Notes\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:** \n\n## Agenda\n1. \n\n## Discussion\n\n## Action Items\n- [ ] `
  },
  project: {
    name: 'Project Plan',
    content: `# Project Plan: [Project Name]\n\n## Overview\n\n## Objectives\n- \n\n## Timeline\n- Phase 1:\n- Phase 2:\n\n## Resources\n- `
  }
};

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: (title?: string, content?: string) => void;
  onDeleteNote: (id: string) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onClose: () => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
  userProfile: UserProfile;
}

export function Sidebar({ notes, activeNoteId, onSelectNote, onAddNote, onDeleteNote, onUpdateNote, onClose, onOpenSettings, onOpenProfile, userProfile }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unarchivedNotes = notes.filter(note => !note.archived);

  const filteredNotes = unarchivedNotes.filter(note => {
    const query = searchQuery.toLowerCase();
    return (
      (note.title && note.title.toLowerCase().includes(query)) ||
      (note.content && note.content.toLowerCase().includes(query))
    );
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const handleCopy = (note: Note) => {
    navigator.clipboard.writeText(note.content);
    setActiveMenuId(null);
  };

  const startRename = (note: Note) => {
    setRenamingNoteId(note.id);
    setRenameTitle(note.title);
    setActiveMenuId(null);
  };

  const submitRename = (id: string) => {
    onUpdateNote(id, { title: renameTitle || 'Untitled Note' });
    setRenamingNoteId(null);
  };

  const togglePin = (note: Note) => {
    onUpdateNote(note.id, { pinned: !note.pinned });
    setActiveMenuId(null);
  };

  const handleArchive = (note: Note) => {
    onUpdateNote(note.id, { archived: true });
    setActiveMenuId(null);
  };

  return (
    <div className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col shrink-0 no-print absolute md:relative z-20 h-full backdrop-blur-xl md:backdrop-blur-none">
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800">
        <h2 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">Documents</h2>
        <div className="flex items-center gap-1">
          <div className="relative" ref={addMenuRef}>
            <button 
              onClick={() => setShowAddMenu(!showAddMenu)} 
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors" 
              title="New Note"
            >
              <Plus size={16} />
            </button>
            {showAddMenu && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="p-1">
                  <button
                    onClick={() => {
                      onAddNote();
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 rounded transition-colors flex items-center gap-2"
                  >
                    <FileText size={14} />
                    Blank Note
                  </button>
                </div>
                <div className="h-px bg-zinc-800"></div>
                <div className="p-1">
                  <div className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <LayoutTemplate size={12} />
                    Templates
                  </div>
                  {Object.entries(TEMPLATES).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onAddNote(template.name, template.content);
                        setShowAddMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 rounded transition-colors pl-7"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={onClose} className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="px-3 py-3 border-b border-zinc-800/80">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-200 text-sm rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-colors placeholder:text-zinc-600"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {sortedNotes.map(note => (
          <div
            key={note.id}
            onClick={() => {
              if (renamingNoteId !== note.id) {
                onSelectNote(note.id);
              }
            }}
            className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors relative ${
              activeNoteId === note.id
                ? 'bg-zinc-800/80 text-zinc-100'
                : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <FileText size={14} className={activeNoteId === note.id ? 'text-zinc-300 shrink-0' : 'text-zinc-600 shrink-0'} />
              
              {renamingNoteId === note.id ? (
                <input
                  type="text"
                  autoFocus
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  onBlur={() => submitRename(note.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitRename(note.id);
                    if (e.key === 'Escape') setRenamingNoteId(null);
                  }}
                  className="bg-zinc-950/80 border border-zinc-700 text-zinc-200 text-sm rounded px-1.5 py-0.5 w-full outline-none focus:border-zinc-500"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="truncate text-sm font-medium flex items-center gap-2">
                  {note.title || 'Untitled Note'}
                  {note.pinned && <Pin size={10} className="text-zinc-500 fill-zinc-500" />}
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(activeMenuId === note.id ? null : note.id);
                }}
                className={`p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/50 rounded transition-all ${
                  activeMenuId === note.id ? 'opacity-100 bg-zinc-700/50 text-zinc-200' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <MoreVertical size={14} />
              </button>
              
              {activeMenuId === note.id && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 top-8 w-40 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1 z-50 text-sm overflow-hidden"
                >
                  <button onClick={(e) => { e.stopPropagation(); handleCopy(note); }} className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2">
                    <Copy size={14} /> Copy Content
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); startRename(note); }} className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2">
                    <Edit2 size={14} /> Rename
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); togglePin(note); }} className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2">
                    <Pin size={14} /> {note.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleArchive(note); }} className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2">
                    <Archive size={14} /> Archive
                  </button>
                  <div className="h-px bg-zinc-700 my-1"></div>
                  <button onClick={(e) => { e.stopPropagation(); setNoteToDelete(note.id); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-zinc-700 hover:text-red-300 flex items-center gap-2">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {sortedNotes.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-zinc-600">
            {searchQuery ? 'No matching documents.' : 'No documents found.'}
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="border-t border-zinc-800 p-1 relative" ref={userMenuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-300 shrink-0 uppercase">
              {userProfile.fullName ? userProfile.fullName.substring(0, 2) : 'GU'}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium text-zinc-200">{userProfile.username || 'guest'}</span>
            </div>
          </div>
          <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
            <Store size={16} />
          </div>
        </button>

        {/* User Menu Popup */}
        {showUserMenu && (
          <div className="absolute bottom-full left-3 w-64 mb-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1.5 z-50 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50 cursor-pointer transition-colors" onClick={() => setShowUserMenu(false)}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-300 uppercase">
                  {userProfile.fullName ? userProfile.fullName.substring(0, 2) : 'GU'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-200">{userProfile.username || 'guest'}</span>
                  <span className="text-[11px] text-zinc-400">{userProfile.email || 'guest@example.com'}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-500" />
            </div>
            
            <div className="h-px bg-zinc-800 my-1.5 mx-4" />
            
            <div className="px-1.5">
              <button className="w-full text-left px-3 py-2 text-[13px] text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 rounded-md transition-colors flex items-center gap-3">
                <Sparkles size={16} className="text-zinc-400" />
                Upgrade plan
              </button>
              
              <button className="w-full text-left px-3 py-2 text-[13px] text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 rounded-md transition-colors flex items-center gap-3">
                <Paintbrush size={16} className="text-zinc-400" />
                Personalization
              </button>
              
              <button 
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenProfile?.();
                }}
                className="w-full text-left px-3 py-2 text-[13px] text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 rounded-md transition-colors flex items-center gap-3"
              >
                <User size={16} className="text-zinc-400" />
                Profile
              </button>
              
              <button 
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenSettings?.();
                }}
                className="w-full text-left px-3 py-2 text-[13px] text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 rounded-md transition-colors flex items-center gap-3"
              >
                <Settings size={16} className="text-zinc-400" />
                Settings
              </button>
            </div>
            
            <div className="h-px bg-zinc-800 my-1.5 mx-4" />
            
            <div className="px-1.5">
              <button className="w-full flex justify-between items-center px-3 py-2 text-[13px] text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 rounded-md transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle size={16} className="text-zinc-400" />
                  Help
                </div>
                <ChevronRight size={14} className="text-zinc-500" />
              </button>
              
              <button className="w-full text-left px-3 py-2 text-[13px] text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 rounded-md transition-colors flex items-center gap-3">
                <LogOut size={16} className="text-zinc-400" />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setNoteToDelete(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-zinc-100 mb-2">Delete Document</h3>
            <p className="text-sm text-zinc-400 mb-6">Are you sure you want to delete this document? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setNoteToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onDeleteNote(noteToDelete);
                  setNoteToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
