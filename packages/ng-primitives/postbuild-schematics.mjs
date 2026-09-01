// The package publishes with `"type": "module"` (Angular Package Format), but the
// compiled schematics are CommonJS `.js` files — without an override Node evaluates
// them as ESM and `ng add`/`ng g` crash with "exports is not defined in ES module
// scope". Same fix as @angular/cdk: a `{"type": "commonjs"}` marker package.json in
// the schematics directory. It must be written after ng-packagr, whose generated
// .npmignore (`**/package.json`) would otherwise strip the marker from the tarball.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const dist = 'dist/packages/ng-primitives';

writeFileSync(
  `${dist}/schematics/package.json`,
  `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`,
);

const exception = '!schematics/package.json';
const npmignore = readFileSync(`${dist}/.npmignore`, 'utf8');
if (!npmignore.includes(exception)) {
  const separator = npmignore.endsWith('\n') ? '' : '\n';
  appendFileSync(`${dist}/.npmignore`, `${separator}${exception}\n`);
}
