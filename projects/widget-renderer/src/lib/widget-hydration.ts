import { WidgetElement, WidgetElementContract, WidgetInput } from './widget.model';

function normalizeElement(
  element: WidgetElement | WidgetElementContract,
): WidgetElement | WidgetElementContract {
  return {
    ...element,
    ...(element.type === 'text' && !element.style.padding
      ? { style: { ...element.style, padding: { vertical: 0, horizontal: 0 } } }
      : {}),
    ...(element.type === 'button'
      ? {
          requestRefresh: element.requestRefresh ?? false,
          showOnlyOnHover: element.showOnlyOnHover ?? false,
        }
      : {}),
    sensitive: element.type === 'divider' ? false : element.sensitive,
  } as WidgetElement;
}

export function normalizeWidgetInput(widget: WidgetInput): WidgetInput {
  return {
    ...widget,
    elements: widget.elements.map(normalizeElement),
  };
}
