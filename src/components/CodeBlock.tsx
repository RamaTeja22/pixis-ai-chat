'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  code: string;
  language: string;
  highlightedCode?: string;
}

export function CodeBlock({ code, language, highlightedCode }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b rounded-t-lg">
        <span className="text-xs font-mono text-muted-foreground uppercase">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>

      <div className="relative">
        {highlightedCode ? (
          <div
            className="p-4 bg-muted/50 rounded-b-lg overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        ) : (
          <pre className="p-4 bg-muted/50 rounded-b-lg overflow-x-auto">
            <code className="text-sm font-mono">{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
