import { generateCsharpContract } from './csharp-contract';

describe('generateCsharpContract', () => {
  it('uses GridTrack helpers including the default Star overload', () => {
    const output = generateCsharpContract({
      version: 2,
      id: 'grid-track-test',
      size: 'wide',
      rows: [{ unit: 'auto' }, { unit: 'star', size: 1 }, { unit: 'star', size: 2.5 }],
      columns: [{ unit: 'pixel', size: 120 }],
      background: {
        sensitive: false,
        repeat: false,
        size: 'auto',
        anchor: 'center',
      },
      refresh: { enabled: false, label: '' },
      elements: [],
    });

    expect(output).toContain('GridTrack.Auto');
    expect(output).toContain('GridTrack.Star()');
    expect(output).toContain('GridTrack.Star(2.5)');
    expect(output).toContain('GridTrack.Pixel(120)');
  });

  it('uses raw string literals for multiline values', () => {
    const output = generateCsharpContract({
      version: 2,
      id: 'multiline-test',
      size: 'wide',
      rows: [],
      columns: [],
      background: {
        sensitive: false,
        repeat: false,
        size: 'auto',
        anchor: 'center',
      },
      refresh: { enabled: false, label: '' },
      elements: [
        {
          type: 'text',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1, anchor: 'center' },
          sensitive: false,
          text: 'First line\nSecond line',
          style: {
            color: '#fff',
            font: { size: 14 },
            align: 'center',
            wrap: true,
          },
        },
      ],
    });

    expect(output).toContain('Text = """\nFirst line\nSecond line\n"""');
    expect(output).not.toContain('First line\\nSecond line');
  });

  it('generates progress data with the package contract type', () => {
    const output = generateCsharpContract({
      version: 2,
      id: 'progress-test',
      size: 'wide',
      rows: [],
      columns: [],
      background: { sensitive: false, repeat: false, size: 'auto', anchor: 'center' },
      refresh: { enabled: false, label: '' },
      elements: [
        {
          type: 'progress',
          grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
          sensitive: false,
          showLegend: true,
          data: { min: 0, max: 100, items: [{ kind: 'gap', value: 25 }] },
          style: {
            color: { legend: '#111', title: '#222', track: '#333' },
            font: { size: 12 },
            radius: null,
          },
        },
      ],
    });

    expect(output).toContain('Data = new ProgressData()');
    expect(output).toContain('new ProgressGap()');
    expect(output).not.toContain('Data = new object()');
  });
});
