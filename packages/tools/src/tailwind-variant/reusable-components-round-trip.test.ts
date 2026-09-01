import { globSync } from 'glob';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { extractComponentStyles, parseCssRules } from './component-styles-parser';
import { canonicaliseCssDeclarations, diffCssParity } from './css-parity-gate';
import { translateCssToTailwind } from './css-to-tailwind-translator';
import {
  TailwindCompiler,
  createTailwindCompiler,
  deriveCssFromTailwind,
} from './tailwind-css-deriver';

// Round-trip gate over every styled reusable component: hand-written CSS ->
// Tailwind candidates -> real compiler -> derived CSS -> semantic diff against
// the original. 100% parity here is what makes the pre-generated tailwind
// template variant trustworthy.

const WORKSPACE = path.resolve(__dirname, '../../../..');
const COMPONENTS = path.join(WORKSPACE, 'apps/components/src/app/pages/reusable-components');

const styled = globSync(`${COMPONENTS}/*/*.ts`)
  .sort()
  .map(file => ({
    name: path.relative(COMPONENTS, file).replace(/\.ts$/, ''),
    css: extractComponentStyles(readFileSync(file, 'utf8')),
  }))
  .filter((entry): entry is { name: string; css: string } => entry.css !== null);

describe('tailwind round-trip parity', () => {
  let compiler: TailwindCompiler;

  beforeAll(async () => {
    compiler = await createTailwindCompiler();
  });

  it('finds the styled reusable components', () => {
    expect(styled.length).toBeGreaterThanOrEqual(45);
  });

  it.each(styled.map(entry => [entry.name, entry] as const))(
    'round-trips %s at 100%% parity',
    (_, entry) => {
      const entries = parseCssRules(entry.css);
      const plan = translateCssToTailwind(entries);
      const { css: derived } = deriveCssFromTailwind(plan, compiler);
      const result = diffCssParity(
        canonicaliseCssDeclarations(entries),
        canonicaliseCssDeclarations(parseCssRules(derived)),
      );

      expect(result.mismatches).toEqual([]);
      expect(result.total).toBeGreaterThan(0);
    },
  );

  it('every candidate is understood by the compiler (no verbatim fallbacks)', () => {
    const failures: string[] = [];
    for (const entry of styled) {
      const { failedCandidates } = deriveCssFromTailwind(
        translateCssToTailwind(parseCssRules(entry.css)),
        compiler,
      );
      failures.push(...failedCandidates.map(failed => `${entry.name}: ${failed.cls}`));
    }
    expect(failures).toEqual([]);
  });

  it('flags the known authoring hazards for the raw-Tailwind variant', () => {
    const notes = styled.flatMap(entry =>
      translateCssToTailwind(parseCssRules(entry.css)).notes.map(note => `${entry.name}: ${note}`),
    );
    // all: unset appears in date-picker, pagination and native-select today; if
    // this fails because a component was rewritten, update the count downward.
    expect(notes.filter(note => note.includes('ALL_UNSET')).length).toBeGreaterThan(0);
  });
});
