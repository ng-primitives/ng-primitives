import { Component, input } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { NgpButton } from 'ng-primitives/button';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { injectToolbarState, NgpToolbar } from 'ng-primitives/toolbar';
import { describe, expect, it } from 'vitest';

/**
 * Inline fixtures mirroring
 * `apps/components/.../reusable-components/toolbar/toolbar.ts` and
 * `toolbar-button.ts`. Used by the reusable-component test suite.
 */
@Component({
  selector: 'app-toolbar',
  hostDirectives: [{ directive: NgpToolbar, inputs: ['ngpToolbarOrientation:orientation'] }],
  template: `
    <ng-content />
  `,
})
class Toolbar {
  readonly orientation = input<NgpOrientation>('horizontal');

  private readonly toolbar = injectToolbarState();

  constructor() {
    // default to horizontal orientation
    this.toolbar().setOrientation('horizontal');
  }
}

@Component({
  selector: 'button[app-toolbar-button]',
  hostDirectives: [
    { directive: NgpButton, inputs: ['disabled'] },
    { directive: NgpRovingFocusItem, inputs: ['ngpRovingFocusItemDisabled:disabled'] },
  ],
  host: { type: 'button' },
  template: `
    <ng-content />
  `,
})
class ToolbarButton {}

describe('Toolbar (reusable component) — standalone', () => {
  it('exposes role="toolbar"', async () => {
    const { getByRole } = await render(
      `<app-toolbar>
        <button app-toolbar-button aria-label="One">1</button>
      </app-toolbar>`,
      { imports: [Toolbar, ToolbarButton] },
    );

    expect(getByRole('toolbar')).toBeTruthy();
  });

  it('defaults to a horizontal orientation', async () => {
    const { getByRole } = await render(
      `<app-toolbar>
        <button app-toolbar-button aria-label="One">1</button>
      </app-toolbar>`,
      { imports: [Toolbar, ToolbarButton] },
    );

    const toolbar = getByRole('toolbar');
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(toolbar).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('navigates between buttons with the arrow keys', async () => {
    const { getByRole, detectChanges } = await render(
      `<app-toolbar>
        <button app-toolbar-button aria-label="One">1</button>
        <button app-toolbar-button aria-label="Two">2</button>
        <button app-toolbar-button aria-label="Three">3</button>
      </app-toolbar>`,
      { imports: [Toolbar, ToolbarButton] },
    );

    const one = getByRole('button', { name: 'One' });
    one.focus();
    detectChanges();

    fireEvent.keyDown(one, { key: 'ArrowRight' });
    detectChanges();

    expect(document.activeElement).toBe(getByRole('button', { name: 'Two' }));
  });

  it('skips a disabled button during navigation', async () => {
    const { getByRole, detectChanges } = await render(
      `<app-toolbar>
        <button app-toolbar-button aria-label="One">1</button>
        <button app-toolbar-button aria-label="Two" disabled>2</button>
        <button app-toolbar-button aria-label="Three">3</button>
      </app-toolbar>`,
      { imports: [Toolbar, ToolbarButton] },
    );

    const one = getByRole('button', { name: 'One' });
    one.focus();
    detectChanges();

    fireEvent.keyDown(one, { key: 'ArrowRight' });
    detectChanges();

    expect(document.activeElement).toBe(getByRole('button', { name: 'Three' }));
  });

  it('makes only the active button tabbable', async () => {
    const { getByRole } = await render(
      `<app-toolbar>
        <button app-toolbar-button aria-label="One">1</button>
        <button app-toolbar-button aria-label="Two">2</button>
      </app-toolbar>`,
      { imports: [Toolbar, ToolbarButton] },
    );

    expect(getByRole('button', { name: 'One' })).toHaveAttribute('tabindex', '0');
    expect(getByRole('button', { name: 'Two' })).toHaveAttribute('tabindex', '-1');
  });
});
