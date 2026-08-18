import { describe, expect, it } from 'vitest';
import { randomPastelColor } from './colors';

describe('randomPastelColor', () => {
  it('returns a six-digit hex color', () => {
    expect(randomPastelColor()).toMatch(/^#[\da-f]{6}$/i);
  });

  it('selects a different hue from existing colors', () => {
    const first = '#80dca0';
    const second = randomPastelColor([first]);

    expect(second).not.toBe(first);
  });
});
