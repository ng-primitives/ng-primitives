// Fails if the built ng-primitives package would publish without the CommonJS marker for its
// schematics. The schematic tests run from an unpacked layout and cannot catch this, and the
// bug shipped silently for ten releases, so the packed file list is checked instead.
import { execFileSync } from 'node:child_process';

const output = execFileSync('npm', ['pack', '--dry-run', '--json', 'dist/packages/ng-primitives'], {
  encoding: 'utf8',
});

if (!JSON.parse(output)[0].files.some(file => file.path === 'schematics/package.json')) {
  console.error('::error::schematics/package.json is missing from the ng-primitives tarball');
  process.exit(1);
}
