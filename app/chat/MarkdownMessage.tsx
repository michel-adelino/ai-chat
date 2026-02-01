"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  p: ({ children }) => <p className="mb-3 last:mb-0 text-[15px] leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block font-mono text-sm text-foreground" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-black/[.08] dark:bg-white/[.12] px-1.5 py-0.5 font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.08] p-4 text-sm">
      {children}
    </pre>
  ),
  ul: ({ children }) => <ul className="mb-3 list-disc pl-6 space-y-1 text-[15px]">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal pl-6 space-y-1 text-[15px]">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:underline underline-offset-2"
    >
      {children}
    </a>
  ),
  h1: ({ children }) => <h1 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 mt-2 text-sm font-semibold first:mt-0">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-foreground/20 pl-4 my-2 text-zinc-600 dark:text-zinc-400">
      {children}
    </blockquote>
  ),
};

export function MarkdownMessage({ content }: { content: string }) {
  if (!content.trim()) return <span className="text-zinc-500">…</span>;
  return (
    <div className="markdown-content break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
