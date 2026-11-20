// The package publishes with "type": "module" but the compiled schematics are CommonJS, so
// without this marker Node loads them as ESM (same fix as @angular/cdk). It is written here
// rather than committed because Nx infers a project from any nested package.json, and the
// .npmignore re-includes it past the `**/package.json` rule ng-packagr writes to the root.
// Lives in the project root so it is part of the build target's cache inputs.
import { writeFileSync } from 'node:fs';

const dir = 'dist/packages/ng-primitives/schematics';

writeFileSync(`${dir}/package.json`, '{ "type": "commonjs" }\n');
writeFileSync(`${dir}/.npmignore`, '!package.json\n');
