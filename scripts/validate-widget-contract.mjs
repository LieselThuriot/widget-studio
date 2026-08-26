import '@angular/compiler';
import { readFileSync } from 'node:fs';
import { safeParseWidgetInput } from '../dist/widget-renderer/fesm2022/widget-renderer.mjs';

try {
  const payload = JSON.parse(readFileSync(0, 'utf8'));
  const result = safeParseWidgetInput(payload);

  process.stdout.write(JSON.stringify(result));
  process.exitCode = result.success ? 0 : 1;
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
}
