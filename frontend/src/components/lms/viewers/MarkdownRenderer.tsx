'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  title?: string;
  className?: string;
}

export function MarkdownRenderer({ content, title, className }: MarkdownRendererProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Headings
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl sm:text-2xl font-bold mt-5 mb-3" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2" {...props} />
              ),
              // Paragraphs
              p: ({ node, ...props }) => (
                <p className="my-3 leading-relaxed" {...props} />
              ),
              // Lists
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside my-3 space-y-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside my-3 space-y-2" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="ml-4" {...props} />
              ),
              // Code
              code: ({ node, inline, ...props }: any) =>
                inline ? (
                  <code
                    className="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono"
                    {...props}
                  />
                ) : (
                  <code
                    className="block p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono my-3"
                    {...props}
                  />
                ),
              pre: ({ node, ...props }) => (
                <pre className="my-3" {...props} />
              ),
              // Blockquote
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-blue-500 pl-4 py-2 my-3 italic bg-blue-50"
                  {...props}
                />
              ),
              // Links
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              // Images
              img: ({ node, ...props }) => (
                <img
                  className="max-w-full h-auto rounded-lg my-3"
                  {...props}
                />
              ),
              // Tables
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-3">
                  <table className="min-w-full border-collapse border border-gray-300" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 px-4 py-2" {...props} />
              ),
              // Horizontal rule
              hr: ({ node, ...props }) => (
                <hr className="my-6 border-t-2 border-gray-300" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
