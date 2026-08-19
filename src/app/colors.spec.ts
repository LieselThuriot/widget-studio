import { describe, expect, it } from 'vitest';
import { randomPastelColor, readableTextColor } from './colors';

describe('readableTextColor', () => {
  it('returns dark text for light backgrounds', () => {
    expect(readableTextColor('#edf4ef')).toBe('#172033');
  });

  it('returns light text for dark backgrounds', () => {
    expect(readableTextColor('#101827')).toBe('#f6f7fb');
  });

  it('supports short and alpha hex colors', () => {
    expect(readableTextColor('#fff')).toBe('#172033');
    expect(readableTextColor('#101827ee')).toBe('#f6f7fb');
  });
});

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
