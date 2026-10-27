import { sampleWidget, verifyInConsumer } from './package-consumer.mjs';

verifyInConsumer({
  buildScript: 'build:libraries',
  libraries: ['widget-renderer', 'widget-landscape'],
  dependencies: ['echarts'],
  verifyModule: `import {
  WidgetLandscape,
  landscapeFootprintForSize,
  normalizeLandscapeState,
} from '@lieselthuriot/widget-landscape';
import { safeParseWidgetInput } from '@lieselthuriot/widget-renderer';

const widget = ${JSON.stringify(sampleWidget)};
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (typeof WidgetLandscape !== 'function') fail('WidgetLandscape is not exported.');
if (!safeParseWidgetInput(widget).success) fail('The renderer peer dependency did not resolve.');

const footprint = landscapeFootprintForSize('wide');
if (footprint.columnSpan !== 4 || footprint.rowSpan !== 2) fail('Unexpected wide footprint.');

const state = normalizeLandscapeState({
  version: 1,
  columns: 4,
  responsive: false,
  widgets: [
    { id: 'first', size: 'square', row: 0, column: 0, widget },
    { id: 'overlapping', size: 'square', row: 0, column: 0, widget },
    { id: 'too-wide', size: 'hero', row: 0, column: 0, widget: { ...widget, size: 'hero' } },
  ],
});
const [first, second] = state.widgets;
if (state.widgets.length !== 2) fail('Widgets that cannot fit were not removed.');
if (first.row === second.row && first.column === second.column) fail('Overlaps were not resolved.');
`,
});
