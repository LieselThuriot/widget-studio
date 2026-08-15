import { Widget, WidgetElement, WidgetElementContract, WidgetInput } from './widget.model';

let fallbackId = 0;

function createElementId(type: WidgetElement['type']): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${type}-${globalThis.crypto.randomUUID()}`;
  }
  fallbackId += 1;
  return `${type}-${fallbackId}`;
}

function isHydratedElement(
  element: WidgetElementContract | WidgetElement,
): element is WidgetElement {
  return 'id' in element && typeof element.id === 'string' && element.id.length > 0;
}

function hydrateElement(
  element: WidgetElementContract | WidgetElement,
  previous: WidgetElement | undefined,
): WidgetElement {
  return isHydratedElement(element)
    ? element
    : ({
        ...element,
        id: previous?.type === element.type ? previous.id : createElementId(element.type),
      } as WidgetElement);
}

export function hydrateWidget(widget: WidgetInput, previous?: Widget): Widget {
  return {
    ...widget,
    elements: widget.elements.map((element, index) =>
      hydrateElement(element, previous?.elements[index]),
    ),
  };
}
