// ECharts probes canvas support even when configured to render SVG charts.
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: () => null,
});
