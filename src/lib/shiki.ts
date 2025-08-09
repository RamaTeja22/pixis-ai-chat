// Syntax highlighting utility using rehype-highlight
import { unified } from 'unified';
import rehypeHighlight from 'rehype-highlight';

export async function highlight(
  code: string,
  lang: string,
  theme: string = 'light'
): Promise<string> {
  try {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const html = `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
    
    const result = await unified()
      .use(rehypeHighlight)
      .process(html);

    const processedHtml = String(result);
    
    const codeBlockMatch = processedHtml.match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/);
    
    if (codeBlockMatch) {
      return `<pre class="syntax-highlighted"><code class="hljs language-${lang}">${codeBlockMatch[1]}</code></pre>`;
    }
    
    return `<pre class="syntax-highlighted"><code class="language-${lang}">${escapedCode}</code></pre>`;
  } catch (error) {
    console.error('Error highlighting code:', error);
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    return `<pre class="syntax-highlighted"><code class="language-${lang}">${escapedCode}</code></pre>`;
  }
}

export function getThemeForMode(isDark: boolean): string {
  return isDark ? 'dark' : 'light';
}
