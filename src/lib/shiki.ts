import { getHighlighter, Highlighter, Lang, Theme } from 'shiki';

let highlighter: Highlighter;

async function getShikiHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await getHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: ['js', 'ts', 'tsx', 'jsx', 'python', 'json', 'bash', 'css', 'html'],
    });
  }
  return highlighter;
}

export async function highlight(
  code: string,
  lang: Lang,
  theme: Theme = 'github-light',
) {
  const shikiHighlighter = await getShikiHighlighter();
  // Ensure the language is supported, fallback to 'txt' if not.
  const supportedLang = shikiHighlighter.getLoadedLanguages().includes(lang) ? lang : 'txt';
  return shikiHighlighter.codeToHtml(code, { lang: supportedLang, theme });
}
