import { Component, input } from '@angular/core';
import { render } from '@testing-library/angular';
import { NgpOrientation } from 'ng-primitives/common';
import { describe, expect, it } from 'vitest';
import { NgpSeparator } from '../separator';

/**
 * Inline fixture mirroring
 * `apps/components/.../reusable-components/separator/separator.ts`.
 * Used by the reusable-component test suite.
 */
@Component({
  selector: '[app-separator]',
  hostDirectives: [{ directive: NgpSeparator, inputs: ['ngpSeparatorOrientation:orientation'] }],
  template: ``,
})
class Separator {
  readonly orientation = input<NgpOrientation>('horizontal');
}

describe('Separator (reusable component) — standalone', () => {
  it('exposes role="separator"', async () => {
    const { getByRole } = await render(`<div app-separator></div>`, {
      imports: [Separator],
    });

    expect(getByRole('separator')).toBeTruthy();
  });

  it('defaults to a horizontal orientation', async () => {
    const { getByRole } = await render(`<div app-separator></div>`, {
      imports: [Separator],
    });

    const separator = getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('forwards a vertical orientation to the primitive', async () => {
    const { getByRole } = await render(`<div app-separator orientation="vertical"></div>`, {
      imports: [Separator],
    });

    const separator = getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });
});
