type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
import { WidgetContract } from '@lieselthuriot/widget-renderer';
// The recursive object shape is local to the formatter and cannot use a named Record alias.
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
interface JsonObject {
  [key: string]: JsonValue;
}

const enumTypes: Record<string, string> = {
  anchor: 'ElementAnchor',
  fit: 'ImageFit',
  method: 'ButtonMethod',
  orientation: 'DividerOrientation',
  size: 'WidgetSize',
  style: 'ButtonStyle',
  unit: 'GridUnit',
  align: 'TextAlign',
  backgroundSize: 'BackgroundSize',
};

const enumMembers: Record<string, Record<string, string>> = {
  anchor: {
    'top left': 'TopLeft',
    'top center': 'TopCenter',
    'top right': 'TopRight',
    'center left': 'CenterLeft',
    center: 'Center',
    'center right': 'CenterRight',
    'bottom left': 'BottomLeft',
    'bottom center': 'BottomCenter',
    'bottom right': 'BottomRight',
  },
  fit: { cover: 'Cover', contain: 'Contain', fill: 'Fill' },
  method: { get: 'Get', post: 'Post' },
  orientation: { horizontal: 'Horizontal', vertical: 'Vertical' },
  size: {
    mini: 'Mini',
    compact: 'Compact',
    tall: 'Tall',
    square: 'Square',
    wide: 'Wide',
    mega: 'Mega',
    banner: 'Banner',
    hero: 'Hero',
  },
  style: { solid: 'Solid', outline: 'Outline' },
  unit: { pixel: 'Pixel', auto: 'Auto', star: 'Star' },
  align: { left: 'Left', center: 'Center', right: 'Right' },
  backgroundSize: { cover: 'Cover', contain: 'Contain', auto: 'Auto' },
};

const elementTypes: Record<string, string> = {
  text: 'TextElement',
  image: 'ImageElement',
  button: 'ButtonElement',
  divider: 'DividerElement',
  pie: 'PieElement',
  donut: 'DonutElement',
  funnel: 'FunnelElement',
  gauge: 'GaugeElement',
  bar: 'BarElement',
  line: 'LineElement',
  progress: 'ProgressElement',
};

export function generateCsharpContract(value: WidgetContract): string {
  const serializedContract = JSON.parse(JSON.stringify(value)) as JsonObject;
  return [
    'using WidgetStudio.Contracts;',
    'using WidgetStudio.Contracts.Data;',
    'using WidgetStudio.Contracts.Elements;',
    'using WidgetStudio.Contracts.Elements.Charts;',
    'using WidgetStudio.Contracts.Enums;',
    'using WidgetStudio.Contracts.Styles;',
    '',
    `WidgetContract widget = new()${formatInitializer(serializedContract, 0)};`,
  ].join('\n');
}

function formatInitializer(value: JsonObject, level: number): string {
  const entries = Object.entries(value).filter(([key]) => key !== 'type' && key !== 'kind');
  const indent = '  '.repeat(level);
  const childIndent = '  '.repeat(level + 1);
  const properties = entries.map(
    ([key, child]) =>
      `${childIndent}${propertyName(key)} = ${formatValue(child, key, value, level + 1)},`,
  );
  return [`\n${indent}{`, ...properties, `${indent}}`].join('\n');
}

function formatObject(value: JsonObject, type: string, level: number): string {
  if (value === null || value === undefined) return 'null';
  const entries = Object.entries(value).filter(([key]) => key !== 'type' && key !== 'kind');
  if (entries.length === 0) return `new ${type}()`;
  const indent = '  '.repeat(level);
  const childIndent = '  '.repeat(level + 1);
  const properties = entries.map(
    ([key, child]) =>
      `${childIndent}${propertyName(key)} = ${formatValue(child, key, value, level + 1, type)},`,
  );
  return [`new ${type}()`, `${indent}{`, ...properties, `${indent}}`].join('\n');
}

function formatValue(
  value: JsonValue,
  key: string,
  parent: JsonObject,
  level: number,
  parentType?: string,
): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') {
    const enumKey = key === 'size' && parentType === 'BackgroundConfig' ? 'backgroundSize' : key;
    const enumType = enumTypes[enumKey];
    if (enumType) return `${enumType}.${enumMembers[enumKey][value] ?? value}`;
    return quote(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).toLowerCase();
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const itemValues = value.map((item) => formatArrayItem(item, key, parent, level + 1));
    const indent = '  '.repeat(level);
    const childIndent = '  '.repeat(level + 1);
    return [`[`, ...itemValues.map((item) => `${childIndent}${item},`), `${indent}]`].join('\n');
  }
  return formatNestedObject(value, key, parent, level);
}

function formatArrayItem(value: JsonValue, key: string, parent: JsonObject, level: number): string {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return formatValue(value, key, parent, level);
  const object = value as JsonObject;
  if (key === 'elements')
    return formatObject(object, elementTypes[String(object['type'])] ?? 'WidgetElement', level);
  if (key === 'items')
    return formatObject(
      object,
      object['kind'] === 'segment' ? 'ProgressSegment' : 'ProgressGap',
      level,
    );
  if (key === 'data' && parent['type'] === 'gauge') return formatObject(object, 'GaugeData', level);
  if (key === 'rows' || key === 'columns') return formatGridTrack(object);
  if (key === 'data') return formatObject(object, 'ChartDataPoint', level);
  return formatObject(object, 'object', level);
}

function formatGridTrack(value: JsonObject): string {
  const unit = value['unit'];
  const size = value['size'];
  if (unit === 'auto') return 'GridTrack.Auto';
  if (unit === 'pixel' && typeof size === 'number') return `GridTrack.Pixel(${size})`;
  if (unit === 'star' && size === 1) return 'GridTrack.Star()';
  if (unit === 'star' && typeof size === 'number') return `GridTrack.Star(${size})`;
  return formatObject(value, 'GridTrack', 1);
}

function formatNestedObject(
  value: JsonObject,
  key: string,
  parent: JsonObject,
  level: number,
): string {
  const type = nestedType(key, parent, value);
  return formatObject(value, type, level);
}

function nestedType(key: string, parent: JsonObject, value: JsonObject): string {
  if (key === 'background') return 'BackgroundConfig';
  if (key === 'refresh') return 'RefreshConfig';
  if (key === 'grid') return 'ElementGrid';
  if (key === 'font')
    return 'align' in parent || 'wrap' in parent ? 'TextFontStyle' : 'ChartFontStyle';
  if (key === 'padding') return 'TextPadding';
  if (key === 'style') {
    switch (parent?.['type']) {
      case 'text':
        return 'TextStyle';
      case 'image':
        return 'ImageStyle';
      case 'button':
        return 'ButtonStyle';
      case 'divider':
        return 'DividerStyle';
      case 'gauge':
        return 'ValueChartStyle';
      case 'progress':
        return 'ProgressStyle';
      case 'bar':
      case 'line':
        return 'AxisChartStyle';
      default:
        return 'ChartStyle';
    }
  }
  if (key === 'color') {
    if ('fill' in value) return 'ValueChartColor';
    if ('line' in value) return 'AxisChartColor';
    if ('track' in value && 'title' in value) return 'ProgressColor';
    return 'ChartColor';
  }
  if (key === 'axis') return 'AxisStyle';
  if (key === 'radius') return 'ProgressRadius';
  if (key === 'data' && parent?.['type'] === 'gauge') return 'GaugeData';
  if (key === 'data' && parent?.['type'] === 'progress') return 'ProgressData';
  return 'object';
}

function propertyName(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function quote(value: string): string {
  if (value.includes('\n') || value.includes('\r')) return rawString(value);
  return (
    `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('\r', '\\r').replaceAll('\n', '\\n')}` +
    '"'
  );
}

function rawString(value: string): string {
  const normalized = value.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
  const longestQuoteRun = Math.max(0, ...(normalized.match(/"+/g)?.map((run) => run.length) ?? []));
  const delimiter = '"'.repeat(Math.max(3, longestQuoteRun + 1));
  return `${delimiter}\n${normalized}\n${delimiter}`;
}
