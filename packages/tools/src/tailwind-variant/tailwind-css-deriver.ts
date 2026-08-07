import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import postcss, { AtRule, Container, Rule } from 'postcss';
import { compile } from 'tailwindcss';
import { TailwindTranslationPlan } from './css-to-tailwind-translator';

export interface TailwindCompiler {
  build(candidates: string[]): string;
}

export interface DerivedCssResult {
  css: string;
  /** Candidates the compiler did not recognise; their declarations were emitted verbatim. */
  failedCandidates: { selector: string; cls: string }[];
}

// Inline theme so scale utilities flatten to plain values instead of
// referencing Tailwind-owned theme variables in the derived CSS.
const INLINE_THEME = `@theme inline {
  --spacing: 0.25rem;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --text-xs: 0.75rem;
  --text-xs--line-height: 1rem;
  --text-sm: 0.875rem;
  --text-sm--line-height: 1.25rem;
  --text-base: 1rem;
  --text-base--line-height: 1.5rem;
}`;

/**
 * Create a standalone Tailwind compiler (theme + utilities, no preflight),
 * resolving the tailwindcss stylesheets from the workspace's node_modules.
 */
export async function createTailwindCompiler(): Promise<TailwindCompiler> {
  const resolver = createRequire(path.join(process.cwd(), 'noop.js'));
  return compile(
    `@import 'tailwindcss/theme.css' layer(theme);\n@import 'tailwindcss/utilities.css' layer(utilities);\n${INLINE_THEME}`,
    {
      loadStylesheet: async (id: string) => {
        const resolved = resolver.resolve(id);
        return {
          path: resolved,
          base: path.dirname(resolved),
          content: readFileSync(resolved, 'utf8'),
        };
      },
    },
  );
}

const unescapeClassName = (selector: string): string => selector.replace(/\\(.)/g, '$1');

/** Index the compiled sheet: utility AST nodes by class name + @property initial values. */
function indexCompiledStylesheet(css: string): {
  utilities: Map<string, Rule>;
  propertyInitialValues: Map<string, string>;
} {
  const root = postcss.parse(css);
  const utilities = new Map<string, Rule>();
  const propertyInitialValues = new Map<string, string>();

  root.walkAtRules('property', atRule => {
    atRule.walkDecls('initial-value', decl => {
      propertyInitialValues.set(atRule.params, decl.value);
    });
  });
  root.walkAtRules('layer', layer => {
    if (layer.params !== 'utilities') {
      return;
    }
    layer.each(node => {
      if (node.type === 'rule' && node.selector.startsWith('.')) {
        utilities.set(unescapeClassName(node.selector.slice(1)), node);
      }
    });
  });

  return { utilities, propertyInitialValues };
}

/** Resolve spacing arithmetic and other compiler artifacts into plain values. */
function resolveCompilerArithmetic(value: string): string {
  return value
    .replace(/calc\((\d*\.?\d+)rem\s*\*\s*(-?\d*\.?\d+)\)/g, (_, a: string, b: string) => {
      const rem = Number(a) * Number(b);
      return `${Number(rem.toFixed(5))}rem`;
    })
    .replace(/calc\(infinity\s*\*\s*1px\)/g, '9999px');
}

interface FlattenedDeclaration {
  selectorSuffixes: string[];
  media: string | null;
  prop: string;
  value: string;
}

/**
 * Flatten one utility into plain declarations. Every var(--tw-*) resolves from
 * the utility's own scope first, then the @property initial values, then the
 * var() fallback — so no Tailwind-owned variable survives into the output.
 * Scopes are per-utility on purpose: one utility's `--tw-*` write must never
 * leak into another's read (the `outline-none` + `outline-2` focus-ring trap).
 */
function flattenUtilityDeclarations(
  utilityNode: Rule,
  propertyInitialValues: Map<string, string>,
): FlattenedDeclaration[] {
  const flattened: FlattenedDeclaration[] = [];

  const resolveTailwindVariables = (value: string, scopes: Map<string, string>[]): string => {
    let resolved = value;
    for (let pass = 0; pass < 8; pass++) {
      const before = resolved;
      resolved = resolved.replace(
        /var\((--tw-[\w-]+)(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/g,
        (full, name: string, fallback: string | undefined) => {
          for (let i = scopes.length - 1; i >= 0; i--) {
            const local = scopes[i].get(name);
            if (local !== undefined) {
              return local;
            }
          }
          return propertyInitialValues.get(name) ?? fallback ?? full;
        },
      );
      if (resolved === before) {
        break;
      }
    }
    return resolved;
  };

  const walk = (
    container: Container,
    selectorSuffixes: string[],
    media: string | null,
    scopes: Map<string, string>[],
  ): void => {
    const localVariables = new Map<string, string>();
    container.each(child => {
      if (child.type === 'decl' && child.prop.startsWith('--tw-')) {
        localVariables.set(child.prop, child.value);
      }
    });
    const scopeChain = [...scopes, localVariables];

    container.each(child => {
      if (child.type === 'decl') {
        if (child.prop.startsWith('--tw-')) {
          return;
        }
        let value = resolveCompilerArithmetic(resolveTailwindVariables(child.value, scopeChain));
        if (child.prop === 'box-shadow') {
          // strip the zero sentinels the ring/shadow machinery threads through
          const terms = value
            .split(/,(?![^(]*\))/)
            .map(term => term.trim())
            .filter(term => term !== '0 0 #0000');
          if (terms.length === 0) {
            return;
          }
          value = terms.join(', ');
        }
        flattened.push({ selectorSuffixes, media, prop: child.prop, value });
      } else if (child.type === 'rule') {
        walk(child, [...selectorSuffixes, child.selector], media, scopeChain);
      } else if (child.type === 'atrule' && child.name === 'media') {
        walk(child as AtRule, selectorSuffixes, child.params, scopeChain);
      }
      // @supports blocks are progressive enhancement (forced-colors) — the base
      // declaration stands without them.
    });
  };

  walk(utilityNode, [], null, []);
  return flattened;
}

/** Compose a nested-selector suffix chain onto the anchor selector. */
function composeNestedSelector(anchor: string, selectorSuffixes: string[]): string {
  let selector = anchor;
  for (const suffix of selectorSuffixes) {
    selector = suffix.includes('&') ? suffix.replace(/&/g, selector) : `${selector} ${suffix}`;
  }
  return selector;
}

interface GroupedCssRule {
  selector: string;
  decls: { prop: string; value: string }[];
}

/**
 * Derive flat, readable CSS from a translation plan.
 *
 * Rules are emitted in authored order — never the compiler's — which is what
 * neutralises `all: unset` resets and order-dependent cascades in the derived
 * output. @media blocks are hoisted to the end, matching how the repo's
 * hand-written CSS is laid out.
 */
export function deriveCssFromTailwind(
  plan: TailwindTranslationPlan,
  compiler: TailwindCompiler,
): DerivedCssResult {
  const candidates = [...new Set(plan.rules.flatMap(rule => rule.candidates.map(c => c.cls)))];
  const { utilities, propertyInitialValues } = indexCompiledStylesheet(compiler.build(candidates));

  const flat: { selector: string; prop: string; value: string }[] = [];
  const mediaBuckets = new Map<string, { selector: string; prop: string; value: string }[]>();
  const failedCandidates: DerivedCssResult['failedCandidates'] = [];

  for (const rule of plan.rules) {
    for (const candidate of rule.candidates) {
      const utilityNode = utilities.get(candidate.cls);
      if (!utilityNode) {
        // unknown to the compiler — emit the original declaration verbatim
        failedCandidates.push({ selector: rule.selector, cls: candidate.cls });
        flat.push({ selector: rule.selector, prop: candidate.prop, value: candidate.value });
        continue;
      }
      for (const declaration of flattenUtilityDeclarations(utilityNode, propertyInitialValues)) {
        const selector = composeNestedSelector(rule.anchor, declaration.selectorSuffixes);
        const mediaParams = declaration.media ?? rule.media;
        if (mediaParams) {
          const bucket = mediaBuckets.get(mediaParams) ?? [];
          bucket.push({ selector, prop: declaration.prop, value: declaration.value });
          mediaBuckets.set(mediaParams, bucket);
        } else {
          flat.push({ selector, prop: declaration.prop, value: declaration.value });
        }
      }
    }
  }

  const groupIntoRules = (
    declarations: { selector: string; prop: string; value: string }[],
  ): GroupedCssRule[] => {
    const grouped: GroupedCssRule[] = [];
    for (const declaration of declarations) {
      const value =
        declaration.prop === 'content'
          ? declaration.value.replace(/^''$/, '""')
          : declaration.value;
      const last = grouped[grouped.length - 1];
      if (last && last.selector === declaration.selector) {
        // repeated identical declarations are noise (every `before:` utility
        // re-emits `content`); a repeat with a *different* value must stay
        const previous = [...last.decls].reverse().find(d => d.prop === declaration.prop);
        if (previous && previous.value === value) {
          continue;
        }
        last.decls.push({ prop: declaration.prop, value });
      } else {
        grouped.push({
          selector: declaration.selector,
          decls: [{ prop: declaration.prop, value }],
        });
      }
    }
    return grouped;
  };

  const parts: string[] = [];
  for (const rule of groupIntoRules(flat)) {
    parts.push(
      `${rule.selector} {\n${rule.decls.map(d => `  ${d.prop}: ${d.value};`).join('\n')}\n}`,
    );
  }
  for (const [params, declarations] of mediaBuckets) {
    const inner = groupIntoRules(declarations)
      .map(
        rule =>
          `  ${rule.selector} {\n${rule.decls.map(d => `    ${d.prop}: ${d.value};`).join('\n')}\n  }`,
      )
      .join('\n\n');
    parts.push(`@media ${params} {\n${inner}\n}`);
  }
  parts.push(...plan.keyframes);

  return { css: parts.join('\n\n'), failedCandidates };
}
