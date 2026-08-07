import { describe, expect, it } from 'vitest';
import { generateTailwindComponentVariant } from './tailwind-component-generator';

const COMPONENT = `import { Component } from '@angular/core';

@Component({
  selector: 'app-thing',
  template: \`
    <button ngpThingTrigger>
      {{ heading() }}
      <ng-icon name="chevron" />
    </button>
    <div ngpThingContent>
      <ng-content />
    </div>
  \`,
  styles: \`
    :host {
      display: block;
    }

    [ngpThingTrigger] {
      display: flex;
      height: 2.75rem;
      color: var(--ngp-text-primary);
    }

    [ngpThingTrigger][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    [ngpThingContent][data-open] {
      animation: slideDown 0.2s ease-in-out forwards;
    }

    ng-icon {
      color: var(--ngp-text-secondary);
    }

    [ngpThingTrigger][data-open] ng-icon {
      transform: rotate(180deg);
    }

    @keyframes slideDown {
      from {
        height: 0;
      }
      to {
        height: var(--ngp-h);
      }
    }
  \`,
})
export class Thing {}
`;

describe('generateTailwindComponentVariant', () => {
  const variant = generateTailwindComponentVariant(COMPONENT);

  it('injects utility classes on the element carrying the directive attribute', () => {
    expect(variant.source).toContain(
      '<button class="flex h-11 text-(--ngp-text-primary) data-focus-visible:[outline:2px_solid_var(--ngp-focus-ring)]" ngpThingTrigger>',
    );
  });

  it('keeps an animation referencing a local keyframe as raw CSS, next to its keyframes', () => {
    // Angular scopes component @keyframes, so a global Tailwind class could
    // never resolve the scoped name — both must live in the same styles block
    expect(variant.source).toContain('<div ngpThingContent>');
    expect(variant.rawCssRules).toContainEqual(
      '[ngpThingContent][data-open] {\n  animation: slideDown 0.2s ease-in-out forwards;\n}',
    );
  });

  it('injects classes on elements matched by bare tag', () => {
    expect(variant.source).toContain(
      '<ng-icon class="text-(--ngp-text-secondary)" name="chevron" />',
    );
  });

  it('moves :host rules onto a host class binding', () => {
    expect(variant.source).toMatch(/host: \{\n\s*class: 'block',\n\s*\},/);
  });

  it('keeps only the inexpressible rules and keyframes as raw CSS', () => {
    expect(variant.rawCssRules).toEqual([
      '[ngpThingContent][data-open] {\n  animation: slideDown 0.2s ease-in-out forwards;\n}',
      '[ngpThingTrigger][data-open] ng-icon {\n  transform: rotate(180deg);\n}',
    ]);
    expect(variant.source).toContain('@keyframes slideDown');
    // everything else left the styles block
    expect(variant.source).not.toMatch(/styles:[\s\S]*display: flex/);
  });

  it('merges host classes into an existing host block without clobbering it', () => {
    const withHost = COMPONENT.replace(
      'template:',
      "host: {\n    '(focusout)': 'onTouched?.()',\n  },\n  template:",
    );
    const merged = generateTailwindComponentVariant(withHost);
    expect(merged.source).toContain("class: 'block',");
    expect(merged.source).toContain("'(focusout)': 'onTouched?.()'");
  });

  it('drops the styles property entirely when nothing needs raw CSS', () => {
    const simple = generateTailwindComponentVariant(`@Component({
  selector: 'app-x',
  template: \`
    <div ngpX></div>
  \`,
  styles: \`
    [ngpX] {
      display: flex;
    }
  \`,
})
export class X {}
`);
    expect(simple.source).not.toContain('styles:');
    expect(simple.source).toContain('<div class="flex" ngpX></div>');
  });

  it('sends a rule whose anchor matches nothing in the template to raw CSS', () => {
    const unmatched = generateTailwindComponentVariant(`@Component({
  selector: 'app-x',
  template: \`
    <div ngpX></div>
  \`,
  styles: \`
    .missing {
      display: flex;
    }
  \`,
})
export class X {}
`);
    expect(unmatched.rawCssRules).toEqual(['.missing {\n  display: flex;\n}']);
    expect(unmatched.source).toContain('styles:');
  });

  it('keeps a :host referenced inside an arbitrary variant as raw CSS', () => {
    // in the consumer's global stylesheet :host matches nothing, so a
    // [&:has(+_:host)] utility would silently never apply
    const sibling = generateTailwindComponentVariant(`@Component({
  selector: 'app-x',
  template: \`
    <div ngpX></div>
  \`,
  styles: \`
    :host:has(+ :host) {
      border-bottom: 1px solid var(--ngp-border);
    }
  \`,
})
export class X {}
`);
    expect(sibling.rawCssRules).toHaveLength(1);
    expect(sibling.rawCssRules[0]).toContain(':host:has(+ :host)');
  });

  it('restores the @media wrapper of a raw CSS rule', () => {
    const media = generateTailwindComponentVariant(`@Component({
  selector: 'app-x',
  template: \`
    <div ngpX></div>
  \`,
  styles: \`
    @media (prefers-reduced-motion: reduce) {
      [ngpX] span {
        animation-duration: 0s;
      }
    }
  \`,
})
export class X {}
`);
    expect(media.rawCssRules[0]).toContain('@media (prefers-reduced-motion: reduce)');
    expect(media.rawCssRules[0]).toContain('animation-duration: 0s;');
  });

  it('returns the source untouched when there is no styles block', () => {
    const source = `@Component({ selector: 'app-x', template: '<div></div>' })\nexport class X {}`;
    expect(generateTailwindComponentVariant(source).source).toBe(source);
  });
});
