import { safeParseWidgetInput } from './widget-validation';
import { WidgetElementContract, WidgetInput } from './widget.model';

/**
 * Version prefix of the fingerprint algorithm. Change it whenever the set of
 * fingerprinted properties or the canonical encoding changes.
 */
export const WIDGET_FINGERPRINT_VERSION = 1;

type CanonicalValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | CanonicalValue[]
  | { [key: string]: CanonicalValue };

/**
 * Computes a stable fingerprint of a widget's look, for example to gate
 * user-built widgets behind an approval step. Content that may vary per
 * visitor (text, labels, alt text, titles, chart data, button URLs and bodies,
 * the widget id, and the refresh label) is ignored; only whether text, labels,
 * alt text, and titles are empty is included. Returns `null` for invalid input.
 */
export function computeWidgetFingerprint(input: unknown): string | null {
  const result = safeParseWidgetInput(input);
  if (!result.success) return null;
  const canonical = canonicalJson(widgetShape(result.data));
  return `wfp:${WIDGET_FINGERPRINT_VERSION}:${sha256Hex(new TextEncoder().encode(canonical))}`;
}

function widgetShape(widget: WidgetInput): CanonicalValue {
  return {
    version: widget.version,
    size: widget.size,
    rows: widget.rows as unknown as CanonicalValue,
    columns: widget.columns as unknown as CanonicalValue,
    background: widget.background as unknown as CanonicalValue,
    refresh: { enabled: widget.refresh?.enabled ?? false },
    elements: widget.elements.map(elementShape),
  };
}

function hasContent(value: string | null | undefined): boolean {
  return (value ?? '').trim().length > 0;
}

function elementShape(element: WidgetElementContract): CanonicalValue {
  const base = { type: element.type, grid: element.grid as unknown as CanonicalValue };
  switch (element.type) {
    case 'text':
      return {
        ...base,
        sensitive: element.sensitive,
        hasText: hasContent(element.text),
        style: {
          ...(element.style as unknown as Record<string, CanonicalValue>),
          font: {
            size: element.style.font.size,
            bold: element.style.font.bold ?? false,
            italic: element.style.font.italic ?? false,
            underline: element.style.font.underline ?? false,
            strikethrough: element.style.font.strikethrough ?? false,
          },
          padding: (element.style.padding ?? {
            vertical: 0,
            horizontal: 0,
          }) as unknown as CanonicalValue,
        },
      };
    case 'image':
      return {
        ...base,
        sensitive: element.sensitive,
        source: element.source,
        hasAlt: hasContent(element.alt),
        fit: element.fit,
        overlayColor: element.overlayColor,
        radius: element.radius,
      };
    case 'button':
      return {
        ...base,
        sensitive: element.sensitive,
        hasLabel: hasContent(element.label),
        method: element.method,
        requestRefresh: element.requestRefresh ?? false,
        showOnlyOnHover: element.showOnlyOnHover ?? false,
        style: element.style,
      };
    case 'divider':
      return {
        ...base,
        orientation: element.orientation,
        style: element.style as unknown as CanonicalValue,
      };
    default:
      return {
        ...base,
        sensitive: element.sensitive,
        hasTitle: hasContent(element.title),
        showLegend: element.showLegend,
        style: element.style as unknown as CanonicalValue,
      };
  }
}

function canonicalJson(value: CanonicalValue): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return canonicalNumber(value);
  if (typeof value === 'string') return canonicalString(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const entries = Object.keys(value)
    .filter((key) => value[key] !== undefined && value[key] !== null)
    .sort(compareOrdinal)
    .map((key) => `${canonicalString(key)}:${canonicalJson(value[key])}`);
  return `{${entries.join(',')}}`;
}

function compareOrdinal(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalNumber(value: number): string {
  const fixed = value.toFixed(6).replace(/\.?0+$/, '');
  return fixed === '-0' ? '0' : fixed;
}

function canonicalString(value: string): string {
  const normalized = value.startsWith('#') ? value.toLowerCase() : value;
  let output = '"';
  for (const character of normalized) {
    const code = character.charCodeAt(0);
    if (character === '"' || character === '\\') output += `\\${character}`;
    else if (code < 0x20) output += `\\u${code.toString(16).padStart(4, '0')}`;
    else output += character;
  }
  return `${output}"`;
}

const roundConstants = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function sha256Hex(message: Uint8Array): string {
  const bitLength = message.length * 8;
  const paddedLength = Math.ceil((message.length + 9) / 64) * 64;
  const bytes = new Uint8Array(paddedLength);
  bytes.set(message);
  bytes[message.length] = 0x80;
  const view = new DataView(bytes.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
  view.setUint32(paddedLength - 4, bitLength >>> 0);

  const hash = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const words = new Uint32Array(64);
  const rotate = (value: number, bits: number) => (value >>> bits) | (value << (32 - bits));

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index++) words[index] = view.getUint32(offset + index * 4);
    for (let index = 16; index < 64; index++) {
      const w15 = words[index - 15];
      const w2 = words[index - 2];
      const s0 = rotate(w15, 7) ^ rotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rotate(w2, 17) ^ rotate(w2, 19) ^ (w2 >>> 10);
      words[index] = words[index - 16] + s0 + words[index - 7] + s1;
    }
    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index++) {
      const s1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + choice + roundConstants[index] + words[index]) >>> 0;
      const s0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    hash[0] += a;
    hash[1] += b;
    hash[2] += c;
    hash[3] += d;
    hash[4] += e;
    hash[5] += f;
    hash[6] += g;
    hash[7] += h;
  }
  return Array.from(hash, (word) => word.toString(16).padStart(8, '0')).join('');
}
