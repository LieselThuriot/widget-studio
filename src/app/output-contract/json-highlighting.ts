import { escapeHtml, highlightTokens } from './syntax-highlight-utils';

const jsonTokenPattern =
  /"(?:\\.|[^"\\])*"|-?\b(?:\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|\b(?:true|false|null)\b|[{}[\],:]/g;

export function highlightJson(value: string): string {
  return highlightTokens(value, jsonTokenPattern, (token, source, end) => {
    const escaped = escapeHtml(token);
    if (token.startsWith('"')) {
      return `<span class="syntax-string${source.slice(end).match(/^\s*:/) ? ' syntax-property' : ''}">${escaped}</span>`;
    }
    if (/^-?\d/.test(token)) return `<span class="syntax-number">${escaped}</span>`;
    if (token === 'true' || token === 'false')
      return `<span class="syntax-boolean">${escaped}</span>`;
    if (token === 'null') return `<span class="syntax-null">${escaped}</span>`;
    return `<span class="syntax-punctuation">${escaped}</span>`;
  });
}
