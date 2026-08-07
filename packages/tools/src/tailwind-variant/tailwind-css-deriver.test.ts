import { beforeAll, describe, expect, it } from 'vitest';
import { parseCssRules } from './component-styles-parser';
import { canonicaliseCssDeclarations, diffCssParity } from './css-parity-gate';
import {
  splitSelectorIntoAnchorAndVariants,
  translateCssToTailwind,
  translateDeclarationToTailwind,
} from './css-to-tailwind-translator';
import {
  TailwindCompiler,
  createTailwindCompiler,
  deriveCssFromTailwind,
} from './tailwind-css-deriver';

describe('translateDeclarationToTailwind', () => {
  it('maps exact declarations to idiomatic utilities', () => {
    expect(translateDeclarationToTailwind('display', 'flex').cls).toBe('flex');
    expect(translateDeclarationToTailwind('padding-left', '1rem').cls).toBe('pl-4');
    expect(translateDeclarationToTailwind('height', '2.75rem').cls).toBe('h-11');
    expect(translateDeclarationToTailwind('width', '40px').cls).toBe('w-10');
    expect(translateDeclarationToTailwind('border-radius', '0.75rem').cls).toBe('rounded-xl');
    expect(translateDeclarationToTailwind('color', 'var(--ngp-text-primary)').cls).toBe(
      'text-(--ngp-text-primary)',
    );
    expect(translateDeclarationToTailwind('box-shadow', 'var(--ngp-button-shadow)').cls).toBe(
      'shadow-(--ngp-button-shadow)',
    );
    expect(translateDeclarationToTailwind('border', '1px solid var(--ngp-border)').cls).toBe(
      'border border-(--ngp-border)',
    );
  });

  it('pairs font-size with its scale line-height into one text utility', () => {
    const result = translateDeclarationToTailwind('font-size', '0.875rem', {
      prop: 'line-height',
      value: '1.25rem',
    });
    expect(result).toEqual({ cls: 'text-sm', consumedNext: true });
  });

  it('falls back to an arbitrary property for anything else', () => {
    expect(translateDeclarationToTailwind('font-size', '0.875rem').cls).toBe(
      '[font-size:0.875rem]',
    );
    expect(translateDeclarationToTailwind('grid-template-columns', 'repeat(7, 1fr)').cls).toBe(
      '[grid-template-columns:repeat(7,_1fr)]',
    );
    // outline stays arbitrary on purpose: `outline-none` writes the
    // --tw-outline-style variable a later `outline-2` would read back
    expect(translateDeclarationToTailwind('outline', 'none').cls).toBe('[outline:none]');
  });
});

describe('splitSelectorIntoAnchorAndVariants', () => {
  it('lifts state and pseudo suffixes into variants', () => {
    expect(splitSelectorIntoAnchorAndVariants('[ngpInput][data-focus-visible]')).toEqual({
      anchor: '[ngpInput]',
      variants: ['data-focus-visible'],
    });
    expect(splitSelectorIntoAnchorAndVariants(":host[data-orientation='vertical']")).toEqual({
      anchor: ':host',
      variants: ['data-[orientation=vertical]'],
    });
    expect(splitSelectorIntoAnchorAndVariants('[ngpInput]::placeholder')).toEqual({
      anchor: '[ngpInput]',
      variants: ['placeholder'],
    });
    expect(splitSelectorIntoAnchorAndVariants('[ngpInput]::-webkit-search-cancel-button')).toEqual({
      anchor: '[ngpInput]',
      variants: ['[&::-webkit-search-cancel-button]'],
    });
    expect(splitSelectorIntoAnchorAndVariants('.slot[data-caret]::after')).toEqual({
      anchor: '.slot',
      variants: ['data-caret', 'after'],
    });
  });

  it('never lifts a suffix across a combinator', () => {
    // the [data-open] belongs to the trigger, not to ng-icon
    expect(splitSelectorIntoAnchorAndVariants('[ngpAccordionTrigger][data-open] ng-icon')).toEqual({
      anchor: '[ngpAccordionTrigger][data-open] ng-icon',
      variants: [],
    });
  });
});

describe('translateCssToTailwind hazard notes', () => {
  it('flags all: unset and keeps its rule as raw CSS', () => {
    const plan = translateCssToTailwind(
      parseCssRules(`[ngpButton] { all: unset; display: flex; }`),
    );
    expect(plan.notes.some(note => note.startsWith('ALL_UNSET'))).toBe(true);
    expect(plan.rules[0].requiresRawCss).toBe(true);
  });

  it('flags a custom property written by multiple rules and keeps them as raw CSS', () => {
    const plan = translateCssToTailwind(
      parseCssRules(`
        :host[data-position-y='top'] { --y: translateY(-100%); }
        :host[data-enter] { --y: translateY(0); }
      `),
    );
    expect(
      plan.notes.some(note => note.startsWith('ORDER_DEPENDENT') && note.includes('--y')),
    ).toBe(true);
    expect(plan.rules.every(rule => rule.requiresRawCss)).toBe(true);
  });

  it('marks a combinator rule as raw CSS', () => {
    const plan = translateCssToTailwind(
      parseCssRules(`[ngpTrigger][data-open] ng-icon { transform: rotate(180deg); }`),
    );
    expect(plan.rules[0].requiresRawCss).toBe(true);
  });
});

describe('deriveCssFromTailwind', () => {
  let compiler: TailwindCompiler;

  beforeAll(async () => {
    compiler = await createTailwindCompiler();
  });

  const derive = (css: string) =>
    deriveCssFromTailwind(translateCssToTailwind(parseCssRules(css)), compiler);

  it('flattens every --tw-* variable out of the output', () => {
    const { css } = derive(`[ngpButton] { border: 1px solid var(--ngp-border); }`);
    expect(css).not.toContain('--tw-');
    expect(css).toContain('border-style: solid');
    expect(css).toContain('border-width: 1px');
    expect(css).toContain('border-color: var(--ngp-border)');
  });

  it('keeps the base+focus outline pair working (the outline-none trap)', () => {
    const { css } = derive(`
      [ngpInput] { outline: none; }
      [ngpInput][data-focus-visible] { outline: 2px solid var(--ngp-focus-ring); }
    `);
    // the focus state must not inherit the base rule's none
    expect(css).toMatch(
      /\[ngpInput\]\[data-focus-visible\] \{\n {2}outline: 2px solid var\(--ngp-focus-ring\);/,
    );
  });

  it('emits declarations in authored order, not the compiler order (all: unset)', () => {
    const { css } = derive(`[ngpButton] { all: unset; display: flex; width: 100%; }`);
    const allIndex = css.indexOf('all: unset');
    const flexIndex = css.indexOf('display: flex');
    expect(allIndex).toBeGreaterThanOrEqual(0);
    expect(allIndex).toBeLessThan(flexIndex);
  });

  it('preserves the source cascade between equal-specificity rules (toast)', () => {
    const { css } = derive(`
      :host[data-position-y='top'] { --y: translateY(-100%); }
      :host[data-enter] { --y: translateY(0); }
    `);
    // last in source must be last in output so it wins the cascade
    expect(css.indexOf("[data-position-y='top']")).toBeLessThan(css.indexOf('[data-enter]'));
  });

  it('hoists prefers-reduced-motion to a top-level @media block', () => {
    const { css } = derive(`
      [ngpContent] { overflow: hidden; }
      @media (prefers-reduced-motion: reduce) {
        [ngpContent] { animation-duration: 0s; }
      }
    `);
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\n {2}\[ngpContent\] \{\n {4}animation-duration: 0s;/,
    );
  });

  it('passes @keyframes through verbatim', () => {
    const { css } = derive(`
      [ngpContent][data-open] { animation: slideDown 0.2s ease-in-out forwards; }
      @keyframes slideDown { from { height: 0; } to { height: var(--ngp-h); } }
    `);
    expect(css).toContain('animation: slideDown 0.2s ease-in-out forwards');
    expect(css).toContain('@keyframes slideDown');
  });

  it('collapses the repeated content declarations of before/after utilities', () => {
    const { css } = derive(`
      :host::before { content: ''; position: absolute; inset: 0; border-radius: 9999px; }
    `);
    expect(css.match(/content:/g)).toHaveLength(1);
  });

  it('strips box-shadow zero sentinels around a real shadow', () => {
    const { css } = derive(`[ngpInput] { box-shadow: var(--ngp-input-shadow); }`);
    expect(css).toContain('box-shadow: var(--ngp-input-shadow);');
    expect(css).not.toContain('0 0 #0000');
  });
});

describe('parity gate', () => {
  let compiler: TailwindCompiler;

  const SAMPLE = `
    :host { display: block; }
    [ngpTrigger] {
      display: flex;
      height: 2.75rem;
      border-radius: 0.75rem;
      outline: none;
      color: var(--ngp-text-primary);
    }
    [ngpTrigger][data-focus-visible] { outline: 2px solid var(--ngp-focus-ring); }
    @media (prefers-reduced-motion: reduce) {
      [ngpTrigger] { animation-duration: 0s; }
    }
  `;

  beforeAll(async () => {
    compiler = await createTailwindCompiler();
  });

  it('is green on a faithful round trip', () => {
    const entries = parseCssRules(SAMPLE);
    const { css } = deriveCssFromTailwind(translateCssToTailwind(entries), compiler);
    const result = diffCssParity(
      canonicaliseCssDeclarations(entries),
      canonicaliseCssDeclarations(parseCssRules(css)),
    );
    expect(result.mismatches).toEqual([]);
  });

  // a green gate that inspects nothing is worse than none: prove each failure
  // mode of the derived output turns the gate red
  it.each([
    ['a changed value', (css: string) => css.replace('height: 2.75rem', 'height: 2.5rem')],
    ['a dropped declaration', (css: string) => css.replace(/\s*display: flex;/, '')],
    [
      'a dropped state rule',
      (css: string) => css.replace(/\[ngpTrigger\]\[data-focus-visible\] \{[^}]*\}/, ''),
    ],
    [
      'a dropped @media block',
      (css: string) => css.replace(/@media \(prefers-reduced-motion[^{]*\{[\s\S]*?\n\}/, ''),
    ],
    [
      'a swapped token',
      (css: string) => css.replace('var(--ngp-text-primary)', 'var(--ngp-text-secondary)'),
    ],
  ])('turns red on %s', (_, sabotage) => {
    const entries = parseCssRules(SAMPLE);
    const { css } = deriveCssFromTailwind(translateCssToTailwind(entries), compiler);
    const broken = sabotage(css);
    expect(broken).not.toBe(css);
    const result = diffCssParity(
      canonicaliseCssDeclarations(entries),
      canonicaliseCssDeclarations(parseCssRules(broken)),
    );
    expect(result.mismatches.length).toBeGreaterThan(0);
  });
});
