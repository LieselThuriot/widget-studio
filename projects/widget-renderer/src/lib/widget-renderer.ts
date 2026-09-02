import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { WidgetElementRenderer } from './widget-element-renderer';
import { WidgetSkeleton } from './widget-skeleton';
import { WidgetBackground } from './widget-background';
import { WidgetToolbar } from './widget-toolbar';
import { WidgetValidationOverlay } from './widget-validation-overlay';
import { ButtonElement, Widget, WidgetInput } from './widget.model';
import { normalizeWidgetInput } from './widget-hydration';
import { safeParseWidgetInput, WidgetValidationIssue } from './widget-validation';
import {
  gridTemplate,
  widgetHeight as getWidgetHeight,
  widgetWidth as getWidgetWidth,
} from './widget-layout';
import { WidgetTooltip } from './widget-tooltip';
import {
  defaultWidgetRendererLocale,
  WidgetRendererLocale,
  WidgetRendererLocaleOverrides,
} from './widget-locale';

export type WidgetLoading = boolean | Widget['size'];

@Component({
  selector: 'widget-renderer',
  templateUrl: './widget-renderer.html',
  styleUrl: './widget-renderer.css',
  providers: [WidgetTooltip],
  imports: [
    WidgetElementRenderer,
    WidgetSkeleton,
    WidgetBackground,
    WidgetToolbar,
    WidgetValidationOverlay,
  ],
})
export class WidgetRenderer implements OnDestroy {
  readonly widget = input<WidgetInput | null>(null);
  readonly loading = input<WidgetLoading>(false);
  readonly darkMode = input(false);
  readonly locale = input<WidgetRendererLocaleOverrides>({});
  readonly refreshRequested = output<void>();
  readonly actionRequested = output<{ element: ButtonElement; event: Event }>();
  readonly sensitiveVisible = signal(false);
  protected readonly tooltip = inject(WidgetTooltip);
  private readonly tooltipLayer = viewChild<ElementRef<HTMLElement>>('tooltipLayer');
  private readonly parsedWidget = computed(() => {
    const widget = this.widget();
    return widget === null ? { success: false as const, issues: [] } : safeParseWidgetInput(widget);
  });
  protected readonly isLoading = computed(() => this.loading() !== false);
  protected readonly resolvedLocale = computed<WidgetRendererLocale>(() => ({
    ...defaultWidgetRendererLocale,
    aria: {
      ...defaultWidgetRendererLocale.aria,
      ...this.locale().aria,
      chart: { ...defaultWidgetRendererLocale.aria.chart, ...this.locale().aria?.chart },
    },
  }));
  protected readonly loadingSize = computed<Widget['size']>(() => {
    const loading = this.loading();
    return typeof loading === 'string' ? loading : 'square';
  });
  readonly validationIssues = computed<WidgetValidationIssue[]>(() => {
    const result = this.parsedWidget();
    return result.success ? [] : result.issues;
  });
  protected readonly renderWidget = computed<Widget>(() => {
    const result = this.parsedWidget();
    if (!result.success) {
      return { ...emptyWidget, size: widgetSizeOrSquare(this.widget()?.size) };
    }
    return {
      ...normalizeWidgetInput(result.data),
      refresh: result.data.refresh ?? emptyWidget.refresh,
    } as Widget;
  });
  readonly hasSensitiveElements = computed(() => {
    const widget = this.renderWidget();
    return (
      widget.background.sensitive ||
      widget.elements.some((element) => 'sensitive' in element && element.sensitive)
    );
  });
  readonly backgroundSensitive = computed(() => {
    const widget = this.renderWidget();
    return widget.background.sensitive && !this.sensitiveVisible();
  });
  readonly gridRows = computed(() => gridTemplate(this.renderWidget().rows));
  readonly gridColumns = computed(() => gridTemplate(this.renderWidget().columns));
  readonly widgetWidth = computed(() => getWidgetWidth(this.renderWidget().size));
  readonly widgetHeight = computed(() => getWidgetHeight(this.renderWidget().size));
  readonly backgroundImage = computed(() => {
    const image = this.renderWidget().background.image;
    return image ? `url("${image}")` : 'none';
  });

  constructor() {
    effect(() => {
      this.widget();
      this.sensitiveVisible.set(false);
    });
    effect(() => {
      if (this.loading() !== false) this.sensitiveVisible.set(false);
    });
    effect(() => {
      const layer = this.tooltipLayer()?.nativeElement;
      if (layer) this.tooltip.setOverlay(layer);
    });
  }

  ngOnDestroy(): void {
    this.tooltip.clear();
  }

  protected toggleSensitive(): void {
    this.sensitiveVisible.update((visible) => !visible);
  }
}

const emptyWidget: Widget = {
  version: 2,
  id: 'empty-widget',
  size: 'square',
  rows: [{ size: 1, unit: 'star' }],
  columns: [{ size: 1, unit: 'star' }],
  background: {
    sensitive: false,
    repeat: false,
    size: 'auto',
    anchor: 'center',
  },
  refresh: { enabled: false, label: 'Refresh widget' },
  elements: [],
};

function widgetSizeOrSquare(value: unknown): Widget['size'] {
  return ['mini', 'compact', 'tall', 'square', 'wide', 'mega', 'banner', 'hero'].includes(
    value as Widget['size'],
  )
    ? (value as Widget['size'])
    : 'square';
}
