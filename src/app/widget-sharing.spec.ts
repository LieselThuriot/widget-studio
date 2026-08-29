import { encodeWidgetShareUrl } from './widget-sharing';

describe('widget sharing', () => {
  it('creates share links on the compose route', async () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        location: {
          origin: 'https://widget.example',
          pathname: '/landscape',
          search: '?theme=dark',
        },
      },
    });
    vi.stubGlobal(
      'Blob',
      class MockBlob {
        constructor(private readonly parts: BlobPart[]) {}

        stream(): ReadableStream<Uint8Array> {
          return new ReadableStream({
            start: (controller) => {
              const part = this.parts[0];
              controller.enqueue(
                part instanceof ArrayBuffer
                  ? new Uint8Array(part)
                  : new TextEncoder().encode(String(part)),
              );
              controller.close();
            },
          });
        }
      },
    );
    vi.stubGlobal(
      'CompressionStream',
      class MockCompressionStream {
        readonly readable: ReadableStream<Uint8Array>;
        readonly writable: WritableStream<Uint8Array>;

        constructor() {
          const transform = new TransformStream<Uint8Array, Uint8Array>();
          this.readable = transform.readable;
          this.writable = transform.writable;
        }
      },
    );
    const url = await encodeWidgetShareUrl('{}');

    expect(url).toMatch(/^https:\/\/widget\.example\/compose\?theme=dark#widget=/);
  });
});
