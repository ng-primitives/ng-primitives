import { Component } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuSubmenuTrigger,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';
import { afterEach, describe, expect, it } from 'vitest';

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="area">Right-click me</div>

    <ng-template #menu>
      <div ngpContextMenu data-testid="context-menu">
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
class ContextMenuWithSubmenuComponent {}

const present = (id: string) => !!screen.queryByTestId(id);

describe('NgpContextMenu closing the chain', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpContextMenu]').forEach(el => el.remove());
  });

  it('closes the submenu and the context menu when a submenu item is selected', async () => {
    await render(ContextMenuWithSubmenuComponent);
    fireEvent.contextMenu(screen.getByTestId('area'));
    await waitFor(() => expect(present('context-menu')).toBe(true));
    const share = screen.getByTestId('share');
    share.focus();
    fireEvent.keyDown(share, { key: 'ArrowRight' });
    await waitFor(() => expect(present('submenu')).toBe(true));

    // hold the submenu's exit animation: it closes itself, so it animates out
    let release!: () => void;
    const finished = new Promise<void>(resolve => (release = resolve));
    const submenu = screen.getByTestId('submenu');
    submenu.getAnimations = () =>
      [
        {
          finished,
          cancel: () => undefined,
          finish: () => undefined,
          effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
        },
      ] as unknown as Animation[];

    try {
      fireEvent.click(screen.getByTestId('email'));
      await waitFor(() => expect(submenu).toHaveAttribute('data-exit'));
      expect(submenu.isConnected).toBe(true);
    } finally {
      release();
      // let the released exit animation finish detaching, even when an assertion above failed
      await new Promise(resolve => setTimeout(resolve));
    }

    await waitFor(() =>
      expect({ menu: present('context-menu'), submenu: present('submenu') }).toEqual({
        menu: false,
        submenu: false,
      }),
    );
  });
});
