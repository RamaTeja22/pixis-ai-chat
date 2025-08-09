'use client';

import { useEffect, useState } from 'react';
import { parseMarkdownWithCodeBlocks, ParsedContent } from '@/lib/markdown';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [parsedContent, setParsedContent] = useState<ParsedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const parseContent = async () => {
      setIsLoading(true);
      try {
        const parsed = await parseMarkdownWithCodeBlocks(content);
        setParsedContent(parsed);
      } catch (error) {
        console.error('Error parsing markdown:', error);
        setParsedContent([{ type: 'text', content }]);
      } finally {
        setIsLoading(false);
      }
    };

    if (content) {
      parseContent();
    }
  }, [content]);

  if (isLoading) {
    return <div className={className}>Loading...</div>;
  }

  return (
    <div className={className}>
      {parsedContent.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={index}
              code={part.content}
              language={part.language || 'text'}
              highlightedCode={part.highlightedCode}
            />
          );
        } else {
          return (
            <div
              key={index}
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: part.content }}
            />
          );
        }
      })}
    </div>
  );
}
