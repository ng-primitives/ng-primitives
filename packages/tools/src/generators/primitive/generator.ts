import { librarySecondaryEntryPointGenerator } from '@nx/angular/generators';
import { formatFiles, getWorkspaceLayout, Tree, updateJson } from '@nx/devkit';
import { getPrimitiveIndex } from '../../utils';
import { PrimitiveGeneratorSchema } from './schema';

export async function primitiveGenerator(tree: Tree, options: PrimitiveGeneratorSchema) {
  await librarySecondaryEntryPointGenerator(tree, {
    library: 'ng-primitives',
    name: options.name,
    skipFormat: true,
    skipModule: true,
  });

  tree.write(getPrimitiveIndex(tree, options.name), '');

  normalizeLibTsconfig(tree);

  await formatFiles(tree);
}

/**
 * Nx's secondary entry point generator appends a per-entry-point block of
 * include/exclude globs (e.g. `collapsible/**\/*.ts`) to the library tsconfig on
 * every run. Those are already covered by the base `**\/*` globs, and because the
 * generator re-prefixes existing entries it compounds them into nonsensical nested
 * patterns (e.g. `collapsible/password/**\/*.ts`). Strip the nested patterns so the
 * tsconfig stays at the canonical base globs.
 */
function normalizeLibTsconfig(tree: Tree): void {
  const { libsDir } = getWorkspaceLayout(tree);
  const tsconfigPath = `${libsDir}/ng-primitives/tsconfig.lib.json`;

  if (!tree.exists(tsconfigPath)) {
    return;
  }

  // A per-entry-point pattern is one scoped to a sub-directory (e.g. `foo/**/*.ts`)
  // rather than a top-level `**/*` glob or a specific `src/`/config file.
  const isNestedPattern = (pattern: string): boolean =>
    !pattern.startsWith('**/') && pattern.includes('/**/');

  updateJson(tree, tsconfigPath, json => {
    if (Array.isArray(json.include)) {
      json.include = [...new Set(json.include.filter((p: string) => !isNestedPattern(p)))];
    }
    if (Array.isArray(json.exclude)) {
      json.exclude = [...new Set(json.exclude.filter((p: string) => !isNestedPattern(p)))];
    }
    return json;
  });
}

export default primitiveGenerator;
