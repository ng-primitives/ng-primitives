import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { NgpContextMenuItem } from 'ng-primitives/context-menu';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { describe, expect, it } from 'vitest';

/** Items hosted by a container composed from lower-level primitives rather than ngpContextMenu. */
@Component({
  template: `
    <div ngpFocusTrap ngpRovingFocusGroup ngpRovingFocusGroupOrientation="vertical" role="menu">
      <button (click)="clicks.push('first')" ngpContextMenuItem data-testid="first">First</button>
      <button [ngpContextMenuItemDisabled]="true" ngpContextMenuItem data-testid="disabled">
        Disabled
      </button>
      <button (click)="clicks.push('last')" ngpContextMenuItem data-testid="last">Last</button>
    </div>
  `,
  imports: [NgpContextMenuItem, NgpFocusTrap, NgpRovingFocusGroup],
})
class StandaloneItemsComponent {
  readonly clicks: string[] = [];
}

describe('NgpContextMenuItem outside a context menu', () => {
  it('renders as a menu item, marks disabled items and skips them with arrow keys', async () => {
    const { getByTestId } = await render(StandaloneItemsComponent);
    const first = getByTestId('first');

    expect(first).toHaveAttribute('role', 'menuitem');
    expect(getByTestId('disabled')).toHaveAttribute('data-disabled');

    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });

    expect(document.activeElement).toBe(getByTestId('last'));
  });

  it('runs click handlers without an enclosing menu to close', async () => {
    const { getByTestId, fixture } = await render(StandaloneItemsComponent);

    fireEvent.click(getByTestId('first'));

    expect(fixture.componentInstance.clicks).toEqual(['first']);
  });
});
