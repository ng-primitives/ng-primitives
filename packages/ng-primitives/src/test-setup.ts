import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import '@angular/compiler';
import '@testing-library/jest-dom';

// Guard against double-patching in browser mode where setup files
// may be evaluated multiple times across browser contexts.
if (!globalThis['__vitest_zone_patch__']) {
  await import('@analogjs/vitest-angular/setup-zone');
}

setupTestBed({ zoneless: false, browserMode: true });
