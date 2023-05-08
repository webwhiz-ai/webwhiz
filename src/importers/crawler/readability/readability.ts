import { CleanedHtmlData } from './readability.types';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import * as TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

turndown.addRule('pre', {
  filter: 'pre',
  replacement: (content: string, node: any) => {
    const lang = node.getAttribute('data-language') || '';
    return `\n\n\`\`\`${lang}\n${content.trim()}\n\`\`\`\n\n`;
  },
});

function getCleanedHtmlContent(html: string): CleanedHtmlData | null {
  const doc = new JSDOM(html);
  const reader = new Readability(doc.window.document);
  const result = reader.parse();

  if (result === null) return null;

  const md = turndown.turndown(result.content);

  return {
    htmlContent: result.content,
    textContent: result.textContent,
    markdownContent: md,
  };
}

export { getCleanedHtmlContent };
