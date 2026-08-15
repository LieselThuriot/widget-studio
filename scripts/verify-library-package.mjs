import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { platform } from 'node:process';

const root = process.cwd();
const temporaryRoot = mkdtempSync(join(tmpdir(), 'widget-renderer-consumer-'));
const consumer = join(temporaryRoot, 'consumer');
const npm = platform === 'win32' ? 'npm.cmd' : 'npm';

try {
  const commandOptions = { cwd: root, stdio: 'inherit', shell: platform === 'win32' };
  execFileSync(npm, ['run', 'build:library'], commandOptions);
  execFileSync(npm, ['pack', './dist/widget-renderer', '--pack-destination', temporaryRoot], {
    ...commandOptions,
  });
  execFileSync(npm, ['init', '--yes'], { ...commandOptions, cwd: temporaryRoot, stdio: 'ignore' });
  execFileSync(npm, ['install', '--yes', '--prefix', consumer, join(temporaryRoot, 'widget-renderer-0.1.0.tgz')], {
    ...commandOptions,
  });
  execFileSync(npm, ['install', '--yes', '--prefix', consumer, '@angular/compiler@22.1.2'], {
    ...commandOptions,
  });
  writeFileSync(
    join(consumer, 'verify.mjs'),
    `import '@angular/compiler';
import { safeParseWidgetInput, hydrateWidget } from 'widget-renderer';
const payload = {
  version: 2,
  size: 'square',
  rows: [{ size: 1, unit: 'star' }],
  columns: [{ size: 1, unit: 'star' }],
  background: { sensitive: false, repeat: false, size: 'auto', anchor: 'center' },
  refresh: { enabled: false, label: 'Refresh' },
  elements: [],
};
if (!safeParseWidgetInput(payload).success || hydrateWidget(payload).elements.length !== 0) process.exit(1);
`,
  );
  execFileSync('node', ['verify.mjs'], { cwd: consumer, stdio: 'inherit' });
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
