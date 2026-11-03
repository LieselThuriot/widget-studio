// Spec files share workers, so leaked fake timers would stall Angular's scheduler in later files.
afterEach(() => {
  vi.useRealTimers();
});

// ECharts probes canvas support even when configured to render SVG charts.
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: () => null,
});

// jsdom does not compute layout, so give ECharts hosts a size to avoid zero-size warnings.
for (const [property, size] of [
  ['clientWidth', 300],
  ['clientHeight', 150],
] as const) {
  Object.defineProperty(HTMLElement.prototype, property, {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains('chart-host') ? size : 0;
    },
  });
}
