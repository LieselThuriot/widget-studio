import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error('Run this script through npm, for example: npm run verify:packages');
}
const require = createRequire(join(root, 'package.json'));
const commandOptions = { cwd: root, stdio: 'inherit' };

// Runs the npm CLI with the current Node binary so no shell is needed on Windows.
function npm(args, options = commandOptions) {
  execFileSync(process.execPath, [npmCli, ...args], options);
}

/**
 * Builds the given libraries, packs them from dist/, installs the tarballs into a temporary
 * consumer project together with Angular, and runs the verification module there.
 */
export function verifyInConsumer({ buildScript, libraries, dependencies = [], verifyModule }) {
  const temporaryRoot = mkdtempSync(join(tmpdir(), 'widget-package-consumer-'));
  const consumer = join(temporaryRoot, 'consumer');
  const angularVersion = require('@angular/core/package.json').version;

  try {
    npm(['run', buildScript]);
    const tarballs = libraries.map((library) => {
      const { name, version } = require(join(root, 'dist', library, 'package.json'));
      npm(['pack', `./dist/${library}`, '--pack-destination', temporaryRoot]);
      return join(temporaryRoot, `${name.replace('@', '').replace('/', '-')}-${version}.tgz`);
    });
    npm(['init', '--yes'], { ...commandOptions, cwd: temporaryRoot, stdio: 'ignore' });
    npm([
      'install',
      '--yes',
      '--prefix',
      consumer,
      ...tarballs,
      `@angular/compiler@${angularVersion}`,
      `@angular/core@${angularVersion}`,
      `@angular/common@${angularVersion}`,
      ...dependencies.map((dependency) => `${dependency}@${require(`${dependency}/package.json`).version}`),
    ]);
    writeFileSync(join(consumer, 'verify.mjs'), `import '@angular/compiler';\n${verifyModule}`);
    execFileSync(process.execPath, ['verify.mjs'], { cwd: consumer, stdio: 'inherit' });
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

export const sampleWidget = {
  version: 2,
  id: 'package-test-widget',
  size: 'square',
  rows: [{ size: 1, unit: 'star' }],
  columns: [{ size: 1, unit: 'star' }],
  background: { sensitive: false, repeat: false, size: 'auto', anchor: 'center' },
  refresh: { enabled: false, label: 'Refresh' },
  elements: [],
};
