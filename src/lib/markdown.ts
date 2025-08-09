import { highlight } from './shiki';

export interface CodeBlock {
  language: string;
  code: string;
  highlightedCode?: string;
}

export interface ParsedContent {
  type: 'text' | 'code';
  content: string;
  language?: string;
  highlightedCode?: string;
}

const CODE_BLOCK_REGEX = /```(\w+)?\n([\s\S]*?)```/g;

export async function parseMarkdownWithCodeBlocks(content: string): Promise<ParsedContent[]> {
  const parts: ParsedContent[] = [];
  let lastIndex = 0;
  let match;

  CODE_BLOCK_REGEX.lastIndex = 0;

  while ((match = CODE_BLOCK_REGEX.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index);
      if (textContent.trim()) {
        parts.push({
          type: 'text',
          content: textContent,
        });
      }
    }

    const language = match[1] || 'text';
    const code = match[2].trim();
    
    try {
      const highlightedCode = await highlight(code, language as any, 'github-light');
      parts.push({
        type: 'code',
        content: code,
        language,
        highlightedCode,
      });
    } catch (error) {
      parts.push({
        type: 'code',
        content: code,
        language,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex);
    if (textContent.trim()) {
      parts.push({
        type: 'text',
        content: textContent,
      });
    }
  }

  return parts;
}

export function hasCodeBlocks(content: string): boolean {
  return CODE_BLOCK_REGEX.test(content);
}
