import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

interface PreviewProps {
  content: string;
  fontSize: number;
  lineHeight: number;
}

export function Preview({ content, fontSize, lineHeight }: PreviewProps) {
  return (
    <div className="flex flex-col w-full h-full bg-zinc-950">
      <div className="flex-1 w-full p-6 md:p-12 overflow-y-auto custom-scrollbar">
        <div className="">
          <div 
            className="prose prose-invert prose-zinc max-w-none w-full break-words prose-img:rounded-lg prose-img:shadow-md prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline"
            style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
          >
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeRaw]}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
                img: ({ node, ...props }) => (
                  <img {...props} style={{ maxWidth: '100%', height: 'auto' }} loading="lazy" />
                )
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
