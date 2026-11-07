import { FocusOrigin } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Actions</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="rename">Rename</button>
        <button
          [ngpSubmenuTrigger]="submenu"
          [ngpSubmenuTriggerDisabled]="shareDisabled()"
          ngpMenuItem
          data-testid="share"
        >
          Share
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div [ngpMenuFinalFocus]="recordOrigin" ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="email">Email</button>
        <button type="button" data-testid="help">Help</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class MenuComponent {
  readonly shareDisabled = signal(false);
  readonly closeOrigins: FocusOrigin[] = [];
  readonly recordOrigin = (origin: FocusOrigin) => {
    this.closeOrigins.push(origin);
    return null;
  };
}

const byId = (id: string) => screen.getByTestId(id);
const present = (id: string) => !!screen.queryByTestId(id);
const open = () => ({ menu: present('menu'), submenu: present('submenu') });

async function openSubmenuWithKeyboard(): Promise<void> {
  byId('trigger').focus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(present('menu')).toBe(true));
  byId('share').focus();
  await userEvent.keyboard('{ArrowRight}');
  await waitFor(() => expect(document.activeElement).toBe(byId('email')));
}

/** Waits for the submenu to close, then a little longer, so a root menu closing with it shows. */
async function submenuClosed(): Promise<void> {
  await waitFor(() => expect(present('submenu')).toBe(false));
  await new Promise(resolve => setTimeout(resolve, 50));
}

describe('Escape in a submenu', () => {
  afterEach(async () => {
    document.querySelectorAll('[ngpMenu]').forEach(el => el.remove());

    // the real pointer stays where a test left it, across files: park it away from fixtures
    const corner = document.body.appendChild(document.createElement('div'));
    corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;';
    await userEvent.hover(corner);
    corner.remove();
  });

  it('closes only the submenu and focuses its trigger with a focus ring', async () => {
    await render(MenuComponent);
    await openSubmenuWithKeyboard();

    await userEvent.keyboard('{Escape}');

    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    expect(document.activeElement).toBe(byId('share'));
    expect(byId('share')).toHaveAttribute('data-focus-visible');
  });

  it('closes the submenu with a keyboard origin', async () => {
    const { fixture } = await render(MenuComponent);
    await openSubmenuWithKeyboard();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(fixture.componentInstance.closeOrigins).toEqual(['keyboard']));
  });

  it('cancels the default action of an Escape in a submenu', async () => {
    await render(MenuComponent);
    await openSubmenuWithKeyboard();

    // fireEvent returns false when a listener called preventDefault
    const notCancelled = fireEvent.keyDown(byId('email'), { key: 'Escape' });

    expect(notCancelled).toBe(false);
    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
  });

  it('keeps an Escape in a submenu from reaching listeners outside the menu', async () => {
    const outside: string[] = [];
    const listener = (event: KeyboardEvent) => outside.push(event.key);
    document.addEventListener('keydown', listener);

    try {
      await render(MenuComponent);
      await openSubmenuWithKeyboard();

      await userEvent.keyboard('{Escape}');
      await submenuClosed();
    } finally {
      document.removeEventListener('keydown', listener);
    }

    expect(open()).toEqual({ menu: true, submenu: false });
    expect(outside.filter(key => key === 'Escape')).toEqual([]);
  });

  it('closes the menu on a second Escape and returns focus to the trigger', async () => {
    await render(MenuComponent);
    await openSubmenuWithKeyboard();

    await userEvent.keyboard('{Escape}');
    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(open()).toEqual({ menu: false, submenu: false }));
    expect(document.activeElement).toBe(byId('trigger'));
  });

  it('closes only the submenu from an element inside it that is not an item', async () => {
    await render(MenuComponent);
    await openSubmenuWithKeyboard();
    byId('help').focus();

    await userEvent.keyboard('{Escape}');

    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    expect(document.activeElement).toBe(byId('share'));
  });

  it('closes only the submenu of a submenu opened by hovering', async () => {
    await render(MenuComponent);
    await userEvent.click(byId('trigger'));
    await waitFor(() => expect(present('menu')).toBe(true));
    await userEvent.hover(byId('share'));
    await waitFor(() => expect(present('submenu')).toBe(true));
    byId('email').focus();

    await userEvent.keyboard('{Escape}');

    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    expect(document.activeElement).toBe(byId('share'));
  });

  it('closes a submenu whose trigger was disabled while it was open', async () => {
    const { fixture } = await render(MenuComponent);
    await openSubmenuWithKeyboard();
    fixture.componentInstance.shareDisabled.set(true);
    fixture.detectChanges();

    await userEvent.keyboard('{Escape}');

    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    expect(byId('share')).toHaveAttribute('aria-expanded', 'false');
  });
});
