// Spec files share workers, so leaked fake timers would stall Angular's scheduler in later files.
afterEach(() => {
  vi.useRealTimers();
});

// jsdom does not compute layout, so give chart hosts a size so charts render their shapes.
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
