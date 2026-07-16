import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PreviewProps {
  content: string;
  fontSize: number;
  lineHeight: number;
}

export function Preview({ content, fontSize, lineHeight }: PreviewProps) {
  return (
    <div className="flex flex-col w-full h-full bg-zinc-950">
      <div id="preview-scroll-container" className="flex-1 w-full p-6 md:p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <div 
            className="prose prose-invert prose-zinc max-w-none w-full break-words prose-img:rounded-lg prose-img:shadow-md prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline"
            style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
          >
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
                img: ({ node, ...props }) => (
                  <img {...props} style={{ maxWidth: '100%', height: 'auto' }} loading="lazy" />
                ),
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <SyntaxHighlighter
                      PreTag="div"
                      children={String(children).replace(/\n$/, '')}
                      language={match[1]}
                      style={vscDarkPlus}
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {content || '*Nothing to preview...*'}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
