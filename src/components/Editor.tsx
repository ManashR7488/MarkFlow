interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  spellCheck?: boolean;
}

export function Editor({ content, onChange, spellCheck = false }: EditorProps) {
  return (
    <textarea
      id="editor-textarea"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start typing your markdown..."
      className="w-full h-full bg-zinc-950 text-zinc-300 font-mono text-[15px] p-6 resize-none outline-none leading-relaxed custom-scrollbar"
      spellCheck={spellCheck}
    />
  );
}
