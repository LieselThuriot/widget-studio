import { highlightCsharp } from './csharp-highlighting';
import { highlightJson } from './json-highlighting';

describe('syntax highlighting', () => {
  it('highlights JSON properties, strings, numbers, and booleans', () => {
    const source = '{\n  "enabled": true,\n  "count": 2\n}';

    const result = highlightJson(source);

    expect(result).toContain('class="syntax-string syntax-property"');
    expect(result).toContain('class="syntax-boolean"');
    expect(result).toContain('class="syntax-number"');
    expect(result).toContain('&quot;enabled&quot;');
  });

  it('highlights C# keywords, types, strings, and comments', () => {
    const source = '// comment\nWidgetContract widget = new() { Name = "Demo" };';

    const result = highlightCsharp(source);

    expect(result).toContain('class="syntax-comment"');
    expect(result).toContain('class="syntax-type"');
    expect(result).toContain('class="syntax-keyword"');
    expect(result).toContain('class="syntax-string"');
  });

  it('escapes model content before adding token markup', () => {
    const result = highlightJson('{"value":"<script>alert(1)</script>"}');

    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
