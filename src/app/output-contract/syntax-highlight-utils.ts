export function highlightTokens(
  value: string,
  pattern: RegExp,
  renderToken: (token: string, source: string, end: number) => string,
): string {
  let result = '';
  let lastIndex = 0;
  for (const match of value.matchAll(pattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    result += escapeHtml(value.slice(lastIndex, index));
    result += renderToken(token, value, index + token.length);
    lastIndex = index + token.length;
  }
  return result + escapeHtml(value.slice(lastIndex));
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
