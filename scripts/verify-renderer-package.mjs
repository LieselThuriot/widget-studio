import { sampleWidget, verifyInConsumer } from './package-consumer.mjs';

verifyInConsumer({
  buildScript: 'build:renderer',
  libraries: ['widget-renderer'],
  verifyModule: `import { normalizeWidgetInput, safeParseWidgetInput } from '@lieselthuriot/widget-renderer';

const payload = ${JSON.stringify(sampleWidget)};
if (!safeParseWidgetInput(payload).success || normalizeWidgetInput(payload).elements.length !== 0) process.exit(1);
if (!safeParseWidgetInput({ ...payload, rows: [{ unit: 'auto' }] }).success) process.exit(1);
if (safeParseWidgetInput({ ...payload, rows: [{ size: 1, unit: 'auto' }] }).success) process.exit(1);
`,
});
