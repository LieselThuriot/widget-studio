const shareHashKey = 'widget';

export async function encodeWidgetShareUrl(modelJson: string): Promise<string> {
  if (typeof CompressionStream === 'undefined') {
    throw new Error('Compression is not supported in this browser.');
  }

  const compressed = await compress(new TextEncoder().encode(modelJson));
  const payload = bytesToBase64Url(compressed);
  return `${window.location.origin}/compose${window.location.search}#${shareHashKey}=${payload}`;
}

export async function decodeWidgetShareHash(hash: string): Promise<unknown | null> {
  const prefix = `#${shareHashKey}=`;
  if (!hash.startsWith(prefix)) return null;
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Decompression is not supported in this browser.');
  }

  const compressed = base64UrlToBytes(hash.slice(prefix.length));
  const json = new TextDecoder().decode(await decompress(compressed));
  return JSON.parse(json) as unknown;
}

async function compress(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data.buffer as ArrayBuffer])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decompress(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data.buffer as ArrayBuffer])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('The share link payload is invalid.');
  const base64 =
    value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
