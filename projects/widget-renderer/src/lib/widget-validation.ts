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
  'pie',
  'donut',
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

function elementPath(path: string, id: string): string {
  const elementsPath = path.slice(0, path.lastIndexOf('['));
  return `${elementsPath}[${JSON.stringify(id)}]`;
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

function validateFont(value: unknown, path: string, issues: WidgetValidationIssue[]): void {
  if (!isRecord(value)) {
    addIssue(issues, path, 'must be an object');
    return;
  }
  requiredNumber(value['size'], `${path}.size`, issues, 1);
  if (value['weight'] !== undefined && ![400, 500, 600, 700].includes(value['weight'] as number)) {
    addIssue(issues, `${path}.weight`, 'must be 400, 500, 600, or 700');
  }
  if (value['style'] !== undefined && !isOneOf(value['style'], ['normal', 'italic'] as const)) {
    addIssue(issues, `${path}.style`, 'must be normal or italic');
  }
  if (
    value['decoration'] !== undefined &&
    !isOneOf(value['decoration'], [
      'none',
      'underline',
      'line-through',
      'underline line-through',
    ] as const)
  ) {
    addIssue(issues, `${path}.decoration`, 'has an unsupported value');
  }
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
): void {
  if (!isRecord(value)) {
    addIssue(issues, path, 'must be an object');
    return;
  }
  validateFont(value['font'], `${path}.font`, issues);
  const color = value['color'];
  if (isRecord(color)) {
    for (const key of ['legend', 'title', 'line', 'fill', 'track']) {
      if (color[key] !== undefined)
        requiredString(color[key], `${path}.color.${key}`, issues, true);
    }
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

function validateDataPoints(value: unknown, path: string, issues: WidgetValidationIssue[]): void {
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
    if (point['color'] !== undefined)
      requiredString(point['color'], `${pointPath}.color`, issues, true);
  });
}

function validateElement(
  value: unknown,
  path: string,
  issues: WidgetValidationIssue[],
  ids: Set<string>,
): void {
  if (!isRecord(value)) {
    addIssue(issues, path, 'must be an object');
    return;
  }
  let issuePath = path;
  if (value['id'] !== undefined && value['id'] !== null && value['id'] !== '') {
    if (!requiredString(value['id'], `${path}.id`, issues)) return;
    issuePath = elementPath(path, value['id']);
    if (ids.has(value['id'])) addIssue(issues, `${issuePath}.id`, 'must be unique');
    ids.add(value['id']);
  }
  if (!isOneOf(value['type'], elementTypes)) {
    addIssue(issues, `${issuePath}.type`, 'has an unsupported value');
    return;
  }
  validateGrid(value['grid'], `${issuePath}.grid`, issues);
  requiredBoolean(value['sensitive'], `${issuePath}.sensitive`, issues);
  switch (value['type']) {
    case 'text':
      requiredString(value['text'], `${issuePath}.text`, issues, true);
      validateStyle(value['style'], `${issuePath}.style`, issues);
      if (!isRecord(value['style'])) break;
      requiredString(value['style']['color'], `${issuePath}.style.color`, issues, true);
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
      if (!isOneOf(value['style'], ['solid', 'outline'] as const))
        addIssue(issues, `${issuePath}.style`, 'has an unsupported value');
      break;
    case 'gauge':
      requiredString(value['title'], `${issuePath}.title`, issues, true);
      requiredBoolean(value['showLegend'], `${issuePath}.showLegend`, issues);
      validateRange(value['data'], `${issuePath}.data`, issues, false);
      validateStyle(value['style'], `${issuePath}.style`, issues);
      break;
    case 'progress':
      validateRange(value['data'], `${issuePath}.data`, issues, true);
      validateStyle(value['style'], `${issuePath}.style`, issues);
      requiredBoolean(value['showLegend'], `${issuePath}.showLegend`, issues);
      requiredBoolean(value['active'], `${issuePath}.active`, issues);
      break;
    case 'pie':
    case 'donut':
    case 'bar':
    case 'line':
      requiredString(value['title'], `${issuePath}.title`, issues, true);
      requiredBoolean(value['showLegend'], `${issuePath}.showLegend`, issues);
      validateDataPoints(value['data'], `${issuePath}.data`, issues);
      validateStyle(
        value['style'],
        `${issuePath}.style`,
        issues,
        value['type'] === 'pie' || value['type'] === 'donut' ? 'forbidden' : 'required',
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

function validateWidget(value: unknown): WidgetValidationIssue[] {
  const issues: WidgetValidationIssue[] = [];
  if (!isRecord(value)) return [{ path: '$', message: 'must be an object' }];
  if (value['version'] !== 2) addIssue(issues, 'version', 'must be 2');
  if (!isOneOf(value['size'], ['square', 'wide'] as const))
    addIssue(issues, 'size', 'must be square or wide');
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
      requiredNumber(track['size'], `${path}.size`, issues, 0);
      if (!isOneOf(track['unit'], gridUnits))
        addIssue(issues, `${path}.unit`, 'has an unsupported value');
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
  if (!isRecord(refresh)) addIssue(issues, 'refresh', 'must be an object');
  else {
    requiredBoolean(refresh['enabled'], 'refresh.enabled', issues);
    requiredString(refresh['label'], 'refresh.label', issues, true);
  }
  if (!Array.isArray(value['elements'])) addIssue(issues, 'elements', 'must be an array');
  else {
    const ids = new Set<string>();
    value['elements'].forEach((element, index) =>
      validateElement(element, `elements[${index}]`, issues, ids),
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
  return result.success && !('id' in (result.data.elements[0] ?? {}));
}

export function isWidget(value: unknown): value is Widget {
  const result = safeParseWidgetInput(value);
  return result.success && result.data.elements.every((element) => 'id' in element);
}
