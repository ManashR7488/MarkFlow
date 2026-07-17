import { useState, useCallback, useRef } from 'react';
import getCaretCoordinates from 'textarea-caret';

export type SuggestionType = 'slash' | 'emoji' | 'heading' | 'code' | 'table' | 'link' | 'none';

export interface SuggestionItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  insertText: string;
  description?: string;
}

export interface SuggestionState {
  active: boolean;
  type: SuggestionType;
  x: number;
  y: number;
  query: string;
  items: SuggestionItem[];
  selectedIndex: number;
  triggerIndex: number;
}

const SLASH_COMMANDS: SuggestionItem[] = [
  { id: 'h1', title: 'Heading 1', insertText: '# ', description: 'Big section heading' },
  { id: 'h2', title: 'Heading 2', insertText: '## ', description: 'Medium section heading' },
  { id: 'h3', title: 'Heading 3', insertText: '### ', description: 'Small section heading' },
  { id: 'quote', title: 'Quote', insertText: '> ', description: 'Capture a quote' },
  { id: 'ul', title: 'Bullet List', insertText: '- ', description: 'Create a simple list' },
  { id: 'ol', title: 'Numbered List', insertText: '1. ', description: 'Create a list with numbering' },
  { id: 'todo', title: 'Todo List', insertText: '- [ ] ', description: 'Track tasks with a to-do list' },
  { id: 'code', title: 'Code Block', insertText: '```\n\n```', description: 'Insert a code block' },
  { id: 'table', title: 'Table', insertText: '| Column | Column |\n|--------|--------|\n|        |        |', description: 'Insert a simple table' },
  { id: 'hr', title: 'Divider', insertText: '---', description: 'Insert a horizontal rule' },
];

const CODE_LANGUAGES: SuggestionItem[] = [
  { id: 'js', title: 'JavaScript', insertText: '```javascript\n\n```' },
  { id: 'ts', title: 'TypeScript', insertText: '```typescript\n\n```' },
  { id: 'py', title: 'Python', insertText: '```python\n\n```' },
  { id: 'html', title: 'HTML', insertText: '```html\n\n```' },
  { id: 'css', title: 'CSS', insertText: '```css\n\n```' },
  { id: 'json', title: 'JSON', insertText: '```json\n\n```' },
  { id: 'bash', title: 'Bash', insertText: '```bash\n\n```' },
  { id: 'md', title: 'Markdown', insertText: '```markdown\n\n```' },
];

const EMOJIS: SuggestionItem[] = [
  { id: 'smile', title: 'Smile 😀', insertText: '😀' },
  { id: 'rocket', title: 'Rocket 🚀', insertText: '🚀' },
  { id: 'fire', title: 'Fire 🔥', insertText: '🔥' },
  { id: 'check', title: 'Check ✅', insertText: '✅' },
  { id: 'cross', title: 'Cross ❌', insertText: '❌' },
  { id: 'star', title: 'Star ⭐', insertText: '⭐' },
  { id: 'sparkles', title: 'Sparkles ✨', insertText: '✨' },
];

const LINK_SUGGESTIONS: SuggestionItem[] = [
  { id: 'link_blank', title: 'Empty Link', insertText: '[](url)', description: 'Insert an empty link' },
  { id: 'link_google', title: 'Google', insertText: '[Google](https://google.com)', description: 'Link to Google' },
  { id: 'link_github', title: 'GitHub', insertText: '[GitHub](https://github.com)', description: 'Link to GitHub' },
  { id: 'link_youtube', title: 'YouTube', insertText: '[YouTube](https://youtube.com)', description: 'Link to YouTube' },
  { id: 'link_readme', title: 'README.md', insertText: '[README.md](README.md)', description: 'Link to README.md' },
];

export function useAutocomplete() {
  const [state, setState] = useState<SuggestionState>({
    active: false,
    type: 'none',
    x: 0,
    y: 0,
    query: '',
    items: [],
    selectedIndex: 0,
    triggerIndex: -1,
  });

  const getSuggestions = (type: SuggestionType, query: string): SuggestionItem[] => {
    let items: SuggestionItem[] = [];
    if (type === 'slash') items = SLASH_COMMANDS;
    if (type === 'code') items = CODE_LANGUAGES;
    if (type === 'emoji') items = EMOJIS;
    if (type === 'link') items = LINK_SUGGESTIONS;

    if (!query) return items;
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.id.toLowerCase().includes(lowerQuery)
    );
  };

  const handleInput = useCallback((textarea: HTMLTextAreaElement) => {
    const value = textarea.value;
    const cursor = textarea.selectionStart;
    
    // We only care about what happens just before the cursor up to the start of the line or last few words.
    const lastNewline = value.lastIndexOf('\n', cursor - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const currentLineBeforeCursor = value.substring(lineStart, cursor);

    let active = false;
    let type: SuggestionType = 'none';
    let query = '';
    let triggerIndex = -1;

    // Detect Slash Command
    const slashMatch = currentLineBeforeCursor.match(/(^|\s)\/([a-zA-Z0-9]*)$/);
    if (slashMatch) {
      active = true;
      type = 'slash';
      query = slashMatch[2];
      triggerIndex = cursor - query.length - 1;
    }

    // Detect Code Block
    const codeMatch = currentLineBeforeCursor.match(/(^|\s)```([a-zA-Z]*)$/);
    if (!active && codeMatch) {
      active = true;
      type = 'code';
      query = codeMatch[2];
      triggerIndex = cursor - query.length - 3;
    }

    // Detect Emoji
    const emojiMatch = currentLineBeforeCursor.match(/(^|\s):([a-zA-Z0-9_]*)$/);
    if (!active && emojiMatch) {
      active = true;
      type = 'emoji';
      query = emojiMatch[2];
      triggerIndex = cursor - query.length - 1;
    }

    // Detect tbl
    const tblMatch = currentLineBeforeCursor.match(/(^|\s)tbl$/);
    if (!active && tblMatch) {
      active = true;
      type = 'slash'; // Reuse slash items
      query = 'table';
      triggerIndex = cursor - 3;
    }

    // Detect #
    const headingMatch = currentLineBeforeCursor.match(/^(#{1,3})$/);
    if (!active && headingMatch) {
      active = true;
      type = 'slash';
      // Map '#' to 'Heading 1', '##' to 'Heading 2', etc.
      const hashes = headingMatch[1].length;
      query = `heading ${hashes}`;
      triggerIndex = cursor - currentLineBeforeCursor.length;
    }

    // Detect Link
    const linkMatch = currentLineBeforeCursor.match(/(^|\s)\[([a-zA-Z0-9]*)$/);
    if (!active && linkMatch) {
      active = true;
      type = 'link';
      query = linkMatch[2];
      triggerIndex = cursor - query.length - 1;
    }

    if (active) {
      const items = getSuggestions(type, query);
      if (items.length > 0) {
        const caret = getCaretCoordinates(textarea, cursor);
        setState(prev => ({
          active: true,
          type,
          x: caret.left - textarea.scrollLeft,
          y: caret.top + caret.height + 4 - textarea.scrollTop,
          query,
          items,
          selectedIndex: prev.active && prev.type === type ? Math.min(prev.selectedIndex, items.length - 1) : 0,
          triggerIndex,
        }));
      } else {
        setState(prev => ({ ...prev, active: false }));
      }
    } else {
      setState(prev => prev.active ? { ...prev, active: false } : prev);
    }
  }, []);

  const closeSuggestions = useCallback(() => {
    setState({
      active: false,
      type: 'none',
      x: 0,
      y: 0,
      query: '',
      items: [],
      selectedIndex: 0,
      triggerIndex: -1,
    });
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>, insertCallback: (text: string, triggerIdx: number, type: SuggestionType) => void) => {
    if (!state.active) return false;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setState(prev => ({ ...prev, selectedIndex: (prev.selectedIndex + 1) % prev.items.length }));
      return true;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setState(prev => ({ ...prev, selectedIndex: (prev.selectedIndex - 1 + prev.items.length) % prev.items.length }));
      return true;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (state.items[state.selectedIndex]) {
        insertCallback(state.items[state.selectedIndex].insertText, state.triggerIndex, state.type);
        closeSuggestions();
      }
      return true;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSuggestions();
      return true;
    }

    return false;
  }, [state, closeSuggestions]);

  return { state, handleInput, onKeyDown, closeSuggestions };
}
