import { escapeHtml, highlightTokens } from './syntax-highlight-utils';

const csharpTokenPattern =
  /\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|@?"(?:""|\\.|[^"\\])*"|\b\d+(?:\.\d+)?[fFdDmM]?\b|\b[A-Za-z_]\w*\b|[{}()[\].,;:=<>]/g;

const csharpKeywords = new Set([
  'as',
  'async',
  'await',
  'base',
  'bool',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'else',
  'enum',
  'false',
  'for',
  'foreach',
  'if',
  'in',
  'interface',
  'internal',
  'is',
  'namespace',
  'new',
  'null',
  'object',
  'out',
  'override',
  'private',
  'protected',
  'public',
  'readonly',
  'return',
  'sealed',
  'static',
  'string',
  'struct',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'using',
  'var',
  'void',
  'while',
]);

const csharpTypes = new Set([
  'BackgroundConfig',
  'ButtonElement',
  'ButtonMethod',
  'ButtonStyle',
  'ChartDataPoint',
  'ChartFontStyle',
  'ElementAnchor',
  'ElementGrid',
  'GridTrack',
  'ImageElement',
  'ImageFit',
  'ImageStyle',
  'RefreshConfig',
  'TextElement',
  'TextFontStyle',
  'TextPadding',
  'TextStyle',
  'WidgetContract',
]);

export function highlightCsharp(value: string): string {
  return highlightTokens(value, csharpTokenPattern, (token) => {
    const escaped = escapeHtml(token);
    if (token.startsWith('//') || token.startsWith('/*'))
      return `<span class="syntax-comment">${escaped}</span>`;
    if (token.startsWith('"') || token.startsWith('@"'))
      return `<span class="syntax-string">${escaped}</span>`;
    if (/^\d/.test(token)) return `<span class="syntax-number">${escaped}</span>`;
    if (csharpKeywords.has(token)) return `<span class="syntax-keyword">${escaped}</span>`;
    if (csharpTypes.has(token)) return `<span class="syntax-type">${escaped}</span>`;
    if (/^[{}()[\].,;:=<>]$/.test(token))
      return `<span class="syntax-punctuation">${escaped}</span>`;
    return escaped;
  });
}
