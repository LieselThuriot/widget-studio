import { WidgetContract } from '@lieselthuriot/widget-renderer';
import { Widget } from './editor-model';

export function toWidgetContract(widget: Widget): WidgetContract {
  const { elements, ...publicWidget } = widget;
  return {
    ...publicWidget,
    elements: elements.map(({ id: _id, ...element }) => {
      if (element.type === 'divider') {
        const { sensitive: _sensitive, ...publicDivider } = element;
        return publicDivider;
      }
      return element;
    }),
  };
}
