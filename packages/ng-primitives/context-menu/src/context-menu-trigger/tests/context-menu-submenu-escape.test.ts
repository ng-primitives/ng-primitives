import { Component } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuSubmenuTrigger,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" tabindex="0" data-testid="area">Right-click me</div>

    <ng-template #menu>
      <div ngpContextMenu data-testid="menu">
        <button [ngpContextMenuSubmenuTrigger]="submenu" ngpContextMenuItem data-testid="share">
          Share
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpContextMenu data-testid="submenu">
        <button ngpContextMenuItem data-testid="email">Email</button>
      </div>
    </ng-template>
  `,
  imports: [
    NgpContextMenuTrigger,
    NgpContextMenu,
    NgpContextMenuItem,
    NgpContextMenuSubmenuTrigger,
  ],
})
class ContextMenuComponent {}

const byId = (id: string) => screen.getByTestId(id);
const present = (id: string) => !!screen.queryByTestId(id);

describe('NgpContextMenu Escape in a submenu', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpContextMenu]').forEach(el => el.remove());
  });

  it('closes only the submenu and focuses its trigger', async () => {
    await render(ContextMenuComponent);
    byId('area').focus();
    fireEvent.contextMenu(byId('area'));
    await waitFor(() => expect(present('menu')).toBe(true));
    byId('share').focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(document.activeElement).toBe(byId('email')));

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(present('submenu')).toBe(false));
    // a context menu closing with it would be removed a task later
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(present('menu')).toBe(true);
    expect(document.activeElement).toBe(byId('share'));
    expect(byId('share')).toHaveAttribute('data-focus-visible');
  });
});
