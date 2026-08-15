import { Widget, WidgetElement, WidgetElementContract, WidgetInput } from './widget.model';

let fallbackId = 0;

function createElementId(type: WidgetElement['type']): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${type}-${globalThis.crypto.randomUUID()}`;
  }
  fallbackId += 1;
  return `${type}-${fallbackId}`;
}

function elementId(element: WidgetElementContract | WidgetElement): string | undefined {
  return 'id' in element && typeof element.id === 'string' && element.id.length > 0
    ? element.id
    : undefined;
}

function hydrateElement(
  element: WidgetElementContract | WidgetElement,
  previous: WidgetElement | undefined,
): WidgetElement {
  const id = elementId(element);
  return {
    ...element,
    id: id ?? (previous?.type === element.type ? previous.id : createElementId(element.type)),
  } as WidgetElement;
}

export function hydrateWidget(widget: WidgetInput, previous?: Widget): Widget {
  const usedPreviousIds = new Set<string>();
  return {
    ...widget,
    elements: widget.elements.map((element, index) => {
      if (elementId(element)) return hydrateElement(element, undefined);

      const previousElement = previous?.elements[index];
      const reusablePrevious =
        previousElement && !usedPreviousIds.has(previousElement.id) ? previousElement : undefined;
      const hydrated = hydrateElement(
        element,
        reusablePrevious?.type === element.type ? reusablePrevious : undefined,
      );
      if (reusablePrevious?.id === hydrated.id) usedPreviousIds.add(hydrated.id);
      return hydrated;
    }),
  };
}
