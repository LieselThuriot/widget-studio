import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { platform } from 'node:process';

const root = process.cwd();
const temporaryRoot = mkdtempSync(join(tmpdir(), 'widget-renderer-consumer-'));
const consumer = join(temporaryRoot, 'consumer');
const npm = platform === 'win32' ? 'npm.cmd' : 'npm';
const require = createRequire(join(root, 'package.json'));
const angularVersion = require('@angular/core/package.json').version;

try {
  const commandOptions = { cwd: root, stdio: 'inherit', shell: platform === 'win32' };
  execFileSync(npm, ['run', 'build:renderer'], commandOptions);
  const rendererVersion = require(join(root, 'dist', 'widget-renderer', 'package.json')).version;
  execFileSync(npm, ['pack', './dist/widget-renderer', '--pack-destination', temporaryRoot], {
    ...commandOptions,
  });
  execFileSync(npm, ['init', '--yes'], { ...commandOptions, cwd: temporaryRoot, stdio: 'ignore' });
  execFileSync(
    npm,
    [
      'install',
      '--yes',
      '--prefix',
      consumer,
      join(temporaryRoot, `lieselthuriot-widget-renderer-${rendererVersion}.tgz`),
      `@angular/compiler@${angularVersion}`,
      `@angular/core@${angularVersion}`,
      `@angular/common@${angularVersion}`,
    ],
    { ...commandOptions },
  );
  writeFileSync(
    join(consumer, 'verify.mjs'),
    `import '@angular/compiler';
 import { normalizeWidgetInput, safeParseWidgetInput } from '@lieselthuriot/widget-renderer';
 const payload = {
   version: 2,
   id: 'package-test-widget',
   size: 'square',
  rows: [{ size: 1, unit: 'star' }],
  columns: [{ size: 1, unit: 'star' }],
  background: { sensitive: false, repeat: false, size: 'auto', anchor: 'center' },
  refresh: { enabled: false, label: 'Refresh' },
  elements: [],
};
 if (!safeParseWidgetInput(payload).success || normalizeWidgetInput(payload).elements.length !== 0) process.exit(1);
 if (!safeParseWidgetInput({ ...payload, rows: [{ unit: 'auto' }] }).success) process.exit(1);
 if (safeParseWidgetInput({ ...payload, rows: [{ size: 1, unit: 'auto' }] }).success) process.exit(1);
`,
  );
  execFileSync('node', ['verify.mjs'], { cwd: consumer, stdio: 'inherit' });
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
