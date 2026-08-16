import { GridTrack, WidgetElement } from 'widget-renderer';

export const CANVAS_GAP = 8;

export function trackAt(
  position: number,
  tracks: GridTrack[],
  available: number,
  span: number,
  resolvedSizes?: number[],
): number {
  const fixed = tracks
    .filter((track) => track.unit === 'pixel')
    .reduce((sum, track) => sum + track.size, 0);
  const stars = tracks
    .filter((track) => track.unit === 'star')
    .reduce((sum, track) => sum + track.size, 0);
  const flexible = Math.max(0, available - Math.max(0, tracks.length - 1) * CANVAS_GAP - fixed);
  let cursor = 0;
  let index = 0;
  for (const [trackIndex, track] of tracks.entries()) {
    const size =
      resolvedSizes?.[trackIndex] ??
      (track.unit === 'pixel'
        ? track.size
        : track.unit === 'star'
          ? (flexible * track.size) / Math.max(1, stars)
          : flexible / Math.max(1, tracks.length));
    if (position < cursor + size / 2) break;
    cursor += size + CANVAS_GAP;
    index++;
  }
  return Math.max(0, Math.min(index, tracks.length - span));
}

export function resolvedTrackSizes(
  host: HTMLElement,
  axis: 'rows' | 'columns',
): number[] | undefined {
  const grid = host.querySelector('.widget-grid') as HTMLElement | null;
  if (!grid) return undefined;
  const value =
    getComputedStyle(grid)[axis === 'rows' ? 'gridTemplateRows' : 'gridTemplateColumns'];
  const sizes = value
    .split(' ')
    .map((size) => Number.parseFloat(size))
    .filter((size) => Number.isFinite(size));
  return sizes.length ? sizes : undefined;
}

export function elementFromEvent(
  event: Event,
  elements: WidgetElement[],
): WidgetElement | undefined {
  const id = (event.target as HTMLElement)
    .closest('[data-widget-element-id]')
    ?.getAttribute('data-widget-element-id');
  return id ? elements.find((element) => element.id === id) : undefined;
}

export function elementForEvent(
  event: MouseEvent,
  host: HTMLElement,
  elements: WidgetElement[],
): WidgetElement | undefined {
  return elementFromEvent(event, elements) ?? elementAtPoint(event, host, elements);
}

export function elementAtPoint(
  event: MouseEvent,
  host: HTMLElement,
  elements: WidgetElement[],
): WidgetElement | undefined {
  const elementNodes = Array.from(host.querySelectorAll('[data-widget-element-id]'));
  return [...elements].reverse().find((candidate) => {
    const node = elementNodes.find(
      (elementNode) => (elementNode as HTMLElement).dataset['widgetElementId'] === candidate.id,
    ) as HTMLElement | undefined;
    if (!node) return false;
    const bounds = node.getBoundingClientRect();
    return (
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom
    );
  });
}
