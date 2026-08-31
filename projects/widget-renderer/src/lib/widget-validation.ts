import {
  ElementAnchor,
  GridUnit,
  Widget,
  WidgetContract,
  WidgetInput,
  WidgetElementType,
} from './widget.model';

export interface WidgetValidationIssue {
  path: string;
  message: string;
}

export interface WidgetParseSuccess {
  success: true;
  data: WidgetInput;
}

export interface WidgetParseFailure {
  success: false;
  issues: WidgetValidationIssue[];
}

export type WidgetParseResult = WidgetParseSuccess | WidgetParseFailure;

export class WidgetValidationError extends Error {
  constructor(readonly issues: WidgetValidationIssue[]) {
    super(issues.map(({ path, message }) => `${path}: ${message}`).join('; '));
    this.name = 'WidgetValidationError';
  }
}

const anchors: ElementAnchor[] = [
  'top left',
  'top center',
  'top right',
  'center left',
  'center',
  'center right',
  'bottom left',
  'bottom center',
  'bottom right',
];
const elementTypes: WidgetElementType[] = [
  'text',
  'image',
  'button',
  'divider',
  'pie',
  'donut',
  'funnel',
  'gauge',
  'bar',
  'line',
  'progress',
];
const gridUnits: GridUnit[] = ['pixel', 'auto', 'star'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isOneOf<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === 'string' && values.includes(value as T);
}

function addIssue(issues: WidgetValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

function requiredString(
  value: unknown,
  path: string,
  issues: WidgetValidationIssue[],
  allowEmpty = false,
): value is string {
  if (!isString(value) || (!allowEmpty && value.length === 0)) {
    addIssue(issues, path, allowEmpty ? 'must be a string' : 'must be a non-empty string');
    return false;
  }
  return true;
}

function requiredBoolean(value: unknown, path: string, issues: WidgetValidationIssue[]): boolean {
  if (!isBoolean(value)) {
    addIssue(issues, path, 'must be a boolean');
    return false;
  }
  return true;
}

function requiredNumber(
  value: unknown,
  path: string,
  issues: WidgetValidationIssue[],
  minimum = 0,
): boolean {
  if (!isFiniteNumber(value) || value < minimum) {
    addIssue(issues, path, `must be a finite number greater than or equal to ${minimum}`);
    return false;
  }
  return true;
}

function validateTextFont(value: unknown, path: string, issues: WidgetValidationIssue[]): void {
  if (!isRecord(value)) {
    addIssue(issues, path, 'must be an object');
    return;
  }
  requiredNumber(value['size'], `${path}.size`, issues, 1);
  for (const key of ['bold', 'italic', 'underline', 'strikethrough']) {
    if (value[key] !== undefined) requiredBoolean(value[key], `${path}.${key}`, issues);
  }
}

function validateChartFont(value: unknown, path: string, issues: WidgetValidationIssue[]): void {
  if (!isRecord(value)) {
    addIssue(issues, path, 'must be an object');
    return;
  }
  requiredNumber(value['size'], `${path}.size`, issues, 1);
}

function validateGrid(value: unknown, path: string, issues: WidgetValidationIssue[]): void {
  if (!isRecord(value)) {
    addIssue(issues, path, 'must be an object');
    return;
  }
  requiredNumber(value['row'], `${path}.row`, issues);
  requiredNumber(value['column'], `${path}.column`, issues);
  requiredNumber(value['rowSpan'], `${path}.rowSpan`, issues, 1);
  requiredNumber(value['columnSpan'], `${path}.columnSpan`, issues, 1);
  if (value['anchor'] !== undefined && !isOneOf(value['anchor'], anchors)) {
    addIssue(issues, `${path}.anchor`, 'has an unsupported value');
  }
}

function validateStyle(
  value: unknown,
  path: string,
  issues: WidgetValidationIssue[],
  axisMode: 'required' | 'forbidden' | 'optional' = 'optional',
  fontMode: 'text' | 'chart' = 'chart',
  requiredColors: readonly string[] = [],
): void {
  if (!isRecord(value)) {
    addIssue(issues, path, 'must be an object');
    return;
  }
  (fontMode === 'text' ? validateTextFont : validateChartFont)(
    value['font'],
    `${path}.font`,
    issues,
  );
  const color = value['color'];
  if (isRecord(color)) {
    for (const key of ['legend', 'title', 'line', 'fill', 'track']) {
      if (requiredColors.includes(key) || color[key] !== undefined)
        requiredString(color[key], `${path}.color.${key}`, issues, true);
    }
  } else if (requiredColors.length) {
    addIssue(issues, `${path}.color`, 'must be an object');
  } else {
    requiredString(color, `${path}.color`, issues, true);
  }
  if (axisMode === 'required') {
    if (!isRecord(value['axis'])) addIssue(issues, `${path}.axis`, 'must be an object');
    else
      for (const key of ['label', 'line', 'grid'])
        requiredString(value['axis'][key], `${path}.axis.${key}`, issues, true);
  } else if (axisMode === 'forbidden' && value['axis'] !== undefined) {
    addIssue(issues, `${path}.axis`, 'is not supported for this chart');
  }
}

function validateDataPoints(
  value: unknown,
  path: string,
  issues: WidgetValidationIssue[],
  allowNullColor: boolean,
): void {
  if (!Array.isArray(value)) {
    addIssue(issues, path, 'must be an array');
    return;
  }
  value.forEach((point, index) => {
    const pointPath = `${path}[${index}]`;
    if (!isRecord(point)) {
      addIssue(issues, pointPath, 'must be an object');
      return;
    }
    requiredString(point['label'], `${pointPath}.label`, issues, true);
    requiredNumber(point['value'], `${pointPath}.value`, issues);
    if (point['color'] === undefined) {
      if (!allowNullColor) addIssue(issues, `${pointPath}.color`, 'must be a string');
    } else if (point['color'] === null) {
      if (!allowNullColor) addIssue(issues, `${pointPath}.color`, 'must be a string');
    } else requiredString(point['color'], `${pointPath}.color`, issues, true);
  });
}

function validateProgressData(value: unknown, path: string, issues: WidgetValidationIssue[]): void {
  if (!isRecord(value)) {
    addIssue(issues, path, 'must be an object');
    return;
  }
  requiredNumber(value['min'], `${path}.min`, issues);
  requiredNumber(value['max'], `${path}.max`, issues);
  if (
    typeof value['min'] === 'number' &&
    typeof value['max'] === 'number' &&
    value['min'] >= value['max']
  ) {
    addIssue(issues, `${path}.max`, 'must be greater than min');
  }
  const items = value['items'];
  if (!Array.isArray(items)) {
    addIssue(issues, `${path}.items`, 'must be an array');
    return;
  }
  let total = 0;
  items.forEach((item, index) => {
    const itemPath = `${path}.items[${index}]`;
    if (!isRecord(item)) {
      addIssue(issues, itemPath, 'must be an object');
      return;
    }
    if (!isOneOf(item['kind'], ['segment', 'gap'] as const)) {
      addIssue(issues, `${itemPath}.kind`, 'has an unsupported value');
      return;
    }
    requiredNumber(item['value'], `${itemPath}.value`, issues);
    if (typeof item['value'] === 'number' && Number.isFinite(item['value'])) {
      if (item['value'] < 0) addIssue(issues, `${itemPath}.value`, 'must not be negative');
      else total += item['value'];
    }
    if (item['kind'] === 'segment') {
      requiredString(item['label'], `${itemPath}.label`, issues);
      requiredString(item['color'], `${itemPath}.color`, issues);
      requiredBoolean(item['active'], `${itemPath}.active`, issues);
    }
  });
  if (
    typeof value['min'] === 'number' &&
    typeof value['max'] === 'number' &&
    Number.isFinite(value['min']) &&
    Number.isFinite(value['max']) &&
    total > value['max'] - value['min']
  ) {
    addIssue(issues, `${path}.items`, 'total value must not exceed the progress range');
  }
}

function validateElement(value: unknown, path: string, issues: WidgetValidationIssue[]): void {
  if (!isRecord(value)) {
    addIssue(issues, path, 'must be an object');
    return;
  }
  const issuePath = path;
  if (!isOneOf(value['type'], elementTypes)) {
    addIssue(issues, `${issuePath}.type`, 'has an unsupported value');
    return;
  }
  validateGrid(value['grid'], `${issuePath}.grid`, issues);
  if (value['type'] !== 'divider' || value['sensitive'] !== undefined) {
    requiredBoolean(value['sensitive'], `${issuePath}.sensitive`, issues);
  }
  switch (value['type']) {
    case 'text':
      requiredString(value['text'], `${issuePath}.text`, issues, true);
      validateStyle(value['style'], `${issuePath}.style`, issues, 'optional', 'text');
      if (!isRecord(value['style'])) break;
      requiredString(value['style']['color'], `${issuePath}.style.color`, issues, true);
      if (value['style']['background'] !== undefined)
        requiredString(value['style']['background'], `${issuePath}.style.background`, issues, true);
      if (value['style']['padding'] !== undefined) {
        const padding = value['style']['padding'];
        if (padding !== null && !isRecord(padding)) {
          addIssue(issues, `${issuePath}.style.padding`, 'must be an object or null');
        } else if (padding !== null) {
          requiredNumber(padding['vertical'], `${issuePath}.style.padding.vertical`, issues);
          requiredNumber(padding['horizontal'], `${issuePath}.style.padding.horizontal`, issues);
        }
      }
      if (value['style']['radius'] !== undefined)
        requiredNumber(value['style']['radius'], `${issuePath}.style.radius`, issues);
      if (!isOneOf(value['style']['align'], ['left', 'center', 'right'] as const))
        addIssue(issues, `${issuePath}.style.align`, 'has an unsupported value');
      requiredBoolean(value['style']['wrap'], `${issuePath}.style.wrap`, issues);
      break;
    case 'image':
      requiredString(value['source'], `${issuePath}.source`, issues);
      requiredString(value['alt'], `${issuePath}.alt`, issues, true);
      if (!isOneOf(value['fit'], ['cover', 'contain', 'fill'] as const))
        addIssue(issues, `${issuePath}.fit`, 'has an unsupported value');
      requiredNumber(value['radius'], `${issuePath}.radius`, issues);
      break;
    case 'button':
      requiredString(value['label'], `${issuePath}.label`, issues, true);
      if (!isOneOf(value['method'], ['get', 'post'] as const))
        addIssue(issues, `${issuePath}.method`, 'has an unsupported value');
      requiredString(value['url'], `${issuePath}.url`, issues, true);
      if (value['body'] !== undefined && value['body'] !== null && !isString(value['body']))
        addIssue(issues, `${issuePath}.body`, 'must be a string or null');
      if (value['method'] === 'get' && value['body'] !== undefined && value['body'] !== null)
        addIssue(issues, `${issuePath}.body`, 'must be empty for GET buttons');
      if (value['requestRefresh'] !== undefined)
        requiredBoolean(value['requestRefresh'], `${issuePath}.requestRefresh`, issues);
      if (value['showOnlyOnHover'] !== undefined)
        requiredBoolean(value['showOnlyOnHover'], `${issuePath}.showOnlyOnHover`, issues);
      if (!isOneOf(value['style'], ['solid', 'outline'] as const))
        addIssue(issues, `${issuePath}.style`, 'has an unsupported value');
      break;
    case 'divider':
      if (!isOneOf(value['orientation'], ['horizontal', 'vertical'] as const))
        addIssue(issues, `${issuePath}.orientation`, 'has an unsupported value');
      if (!isRecord(value['style'])) addIssue(issues, `${issuePath}.style`, 'must be an object');
      else requiredString(value['style']['color'], `${issuePath}.style.color`, issues);
      break;
    case 'gauge':
      if (value['title'] !== undefined)
        requiredString(value['title'], `${issuePath}.title`, issues, true);
      requiredBoolean(value['showLegend'], `${issuePath}.showLegend`, issues);
      validateRange(value['data'], `${issuePath}.data`, issues, false);
      validateStyle(value['style'], `${issuePath}.style`, issues, 'optional', 'chart', [
        'legend',
        'title',
        'fill',
        'track',
      ]);
      break;
    case 'progress':
      if (value['title'] !== undefined)
        requiredString(value['title'], `${issuePath}.title`, issues, true);
      validateProgressData(value['data'], `${issuePath}.data`, issues);
      validateStyle(value['style'], `${issuePath}.style`, issues, 'optional', 'chart', [
        'legend',
        'title',
        'track',
      ]);
      if (isRecord(value['style'])) {
        const radius = value['style']['radius'];
        if (radius !== undefined && radius !== null) {
          if (!isRecord(radius))
            addIssue(issues, `${issuePath}.style.radius`, 'must be an object, null, or undefined');
          else {
            requiredNumber(radius['segment'], `${issuePath}.style.radius.segment`, issues);
            requiredNumber(radius['track'], `${issuePath}.style.radius.track`, issues);
          }
        }
      }
      requiredBoolean(value['showLegend'], `${issuePath}.showLegend`, issues);
      break;
    case 'pie':
    case 'donut':
    case 'funnel':
    case 'bar':
    case 'line':
      if (value['title'] !== undefined)
        requiredString(value['title'], `${issuePath}.title`, issues, true);
      requiredBoolean(value['showLegend'], `${issuePath}.showLegend`, issues);
      validateDataPoints(value['data'], `${issuePath}.data`, issues, value['type'] === 'line');
      validateStyle(
        value['style'],
        `${issuePath}.style`,
        issues,
        value['type'] === 'pie' || value['type'] === 'donut' || value['type'] === 'funnel'
          ? 'forbidden'
          : 'required',
        'chart',
        value['type'] === 'bar' || value['type'] === 'line'
          ? ['legend', 'title', 'line']
          : ['legend', 'title'],
      );
      break;
  }
}

function validateRange(
  value: unknown,
  path: string,
  issues: WidgetValidationIssue[],
  hasLabel: boolean,
): void {
  if (!isRecord(value)) {
    addIssue(issues, path, 'must be an object');
    return;
  }
  if (hasLabel) requiredString(value['label'], `${path}.label`, issues, true);
  if (hasLabel) {
    optionalString(value['separator'], `${path}.separator`, issues);
    optionalString(value['suffix'], `${path}.suffix`, issues);
  }
  requiredNumber(value['value'], `${path}.value`, issues);
  requiredNumber(value['min'], `${path}.min`, issues);
  requiredNumber(value['max'], `${path}.max`, issues);
  if (
    isFiniteNumber(value['min']) &&
    isFiniteNumber(value['max']) &&
    value['min'] >= value['max']
  ) {
    addIssue(issues, path, 'minimum must be less than maximum');
  }
}

function optionalString(value: unknown, path: string, issues: WidgetValidationIssue[]): void {
  if (value !== undefined && value !== null && !isString(value)) {
    addIssue(issues, path, 'must be a string, null, or undefined');
  }
}

function validateWidget(value: unknown): WidgetValidationIssue[] {
  const issues: WidgetValidationIssue[] = [];
  if (!isRecord(value)) return [{ path: '$', message: 'must be an object' }];
  if (value['version'] !== 2) addIssue(issues, 'version', 'must be 2');
  requiredString(value['id'], 'id', issues, true);
  if (
    !isOneOf(value['size'], [
      'mini',
      'compact',
      'tall',
      'square',
      'wide',
      'mega',
      'banner',
      'hero',
    ] as const)
  )
    addIssue(issues, 'size', 'must be mini, compact, tall, square, wide, mega, banner, or hero');
  for (const key of ['rows', 'columns'] as const) {
    if (!Array.isArray(value[key]) || value[key].length === 0) {
      addIssue(issues, key, 'must be a non-empty array');
      continue;
    }
    value[key].forEach((track, index) => {
      const path = `${key}[${index}]`;
      if (!isRecord(track)) {
        addIssue(issues, path, 'must be an object');
        return;
      }
      const unit = track['unit'];
      if (!isOneOf(unit, gridUnits)) addIssue(issues, `${path}.unit`, 'has an unsupported value');
      if (unit === 'auto') {
        if (track['size'] !== undefined)
          addIssue(issues, `${path}.size`, 'must not be set for auto tracks');
      } else {
        requiredNumber(track['size'], `${path}.size`, issues, 0);
      }
    });
  }
  const background = value['background'];
  if (!isRecord(background)) addIssue(issues, 'background', 'must be an object');
  else {
    requiredBoolean(background['sensitive'], 'background.sensitive', issues);
    requiredBoolean(background['repeat'], 'background.repeat', issues);
    if (!isOneOf(background['size'], ['cover', 'contain', 'auto'] as const))
      addIssue(issues, 'background.size', 'has an unsupported value');
    if (!isOneOf(background['anchor'], anchors))
      addIssue(issues, 'background.anchor', 'has an unsupported value');
    if (background['image'] !== undefined)
      requiredString(background['image'], 'background.image', issues, true);
  }
  const refresh = value['refresh'];
  if (refresh !== undefined && refresh !== null && !isRecord(refresh))
    addIssue(issues, 'refresh', 'must be an object or null');
  else if (isRecord(refresh)) {
    requiredBoolean(refresh['enabled'], 'refresh.enabled', issues);
    requiredString(refresh['label'], 'refresh.label', issues, true);
  }
  if (!Array.isArray(value['elements'])) addIssue(issues, 'elements', 'must be an array');
  else {
    value['elements'].forEach((element, index) =>
      validateElement(element, `elements[${index}]`, issues),
    );
  }
  return issues;
}

export function safeParseWidgetInput(value: unknown): WidgetParseResult {
  const issues = validateWidget(value);
  return issues.length ? { success: false, issues } : { success: true, data: value as WidgetInput };
}

export function parseWidgetInput(value: unknown): WidgetInput {
  const result = safeParseWidgetInput(value);
  if (!result.success) throw new WidgetValidationError(result.issues);
  return result.data;
}

export function isWidgetContract(value: unknown): value is WidgetContract {
  const result = safeParseWidgetInput(value);
  return result.success;
}

export function isWidget(value: unknown): value is Widget {
  const result = safeParseWidgetInput(value);
  return result.success;
}
