import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ── Console Welcome Messages ──
console.log(
  '%c ✦ MarkFlow ',
  'background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; font-size: 28px; font-weight: 900; padding: 12px 24px; border-radius: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);'
);

console.log(
  '%cA modern, distraction-free Markdown editor with AI superpowers.',
  'color: #a1a1aa; font-size: 13px; font-style: italic; padding: 4px 0;'
);

console.log(
  '%c⚡ Features%c\n' +
  '  • Live split-pane preview with sync scroll\n' +
  '  • AI-powered Prompt → Markdown conversion\n' +
  '  • AI template generation\n' +
  '  • Emoji picker & autocomplete\n' +
  '  • Export to PDF & .md\n' +
  '  • Google OAuth for Gemini integration',
  'color: #a855f7; font-size: 13px; font-weight: bold; padding-top: 8px;',
  'color: #d4d4d8; font-size: 12px;'
);

console.log(
  '%c🛠 Built with%c React · TypeScript · Vite · Lucide',
  'color: #a855f7; font-size: 12px; font-weight: bold;',
  'color: #71717a; font-size: 12px;'
);

console.log(
  '%c💜 Made by Manash Ranjan%c — https://github.com/manashr7488',
  'color: #c084fc; font-size: 12px; font-weight: bold;',
  'color: #52525b; font-size: 11px;'
);

console.log(
  '%c⚠️ If you see errors here, don\'t panic — they\'re probably just React being strict.',
  'color: #fbbf24; font-size: 11px; padding: 4px 0;'
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
