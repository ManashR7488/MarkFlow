import { useState, useEffect } from 'react';
import { Note } from '../types';

const STORAGE_KEY = 'markdown-notes-v1';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse notes from local storage');
      }
    }
    return [
      {
        id: crypto.randomUUID(),
        title: 'Welcome Note',
        content: '# Welcome to Markdown Editor\n\nThis is a minimalist, distraction-free markdown editor.\n\n## Features\n- Real-time preview\n- Auto-saving to local storage\n- Export to PDF\n- GitHub Flavored Markdown support\n\nStart typing on the left to see changes on the right!',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const addNote = (title = 'Untitled Note', content = '') => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => {
      const filtered = prev.filter(note => note.id !== id);
      if (activeNoteId === id) {
        setActiveNoteId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  return { notes, activeNoteId, setActiveNoteId, addNote, updateNote, deleteNote };
}
