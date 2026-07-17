import { useState, useEffect } from 'react';
import { Template } from '../types';

const STORAGE_KEY = 'markdown-templates-v1';

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: crypto.randomUUID(),
    name: 'Journal Entry',
    content: `# Journal Entry - ${new Date().toLocaleDateString()}\n\n## Intentions\n- \n\n## What happened today?\n\n## Gratitude\n1. \n2. \n3. `,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: crypto.randomUUID(),
    name: 'Meeting Notes',
    content: `# Meeting Notes\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:** \n\n## Agenda\n1. \n\n## Discussion\n\n## Action Items\n- [ ] `,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: crypto.randomUUID(),
    name: 'Project Plan',
    content: `# Project Plan: [Project Name]\n\n## Overview\n\n## Objectives\n- \n\n## Timeline\n- Phase 1:\n- Phase 2:\n\n## Resources\n- `,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse templates from local storage');
      }
    }
    return DEFAULT_TEMPLATES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const addTemplate = (name: string, content: string) => {
    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates(prev => prev.map(template => template.id === id ? { ...template, ...updates, updatedAt: Date.now() } : template));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  return { templates, addTemplate, updateTemplate, deleteTemplate };
}
