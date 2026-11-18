import { FocusOrigin } from '@angular/cdk/a11y';
import { Component, signal, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

/** The menu with a submenu. `rootMenuAttributes` lets a fixture opt the root menu in or leave it default. */
const menuTemplate = (rootMenuAttributes: string) => `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Actions</button>

    <ng-template #menu>
      <div ${rootMenuAttributes} ngpMenu data-testid="menu">
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
  `;

@Component({
  template: menuTemplate(''),
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class MenuComponent {
  readonly shareDisabled = signal(false);
  readonly closeOrigins: FocusOrigin[] = [];
  finalFocusResult: HTMLElement | boolean | null = null;
  readonly recordOrigin = (origin: FocusOrigin) => {
    this.closeOrigins.push(origin);
    return this.finalFocusResult;
  };
}

@Component({
  template: menuTemplate('ngpMenuEscapeClosesOnlySubmenu'),
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class OptedInMenuComponent extends MenuComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" ngpMenuTriggerHideDelay="200" data-testid="trigger">
      Actions
    </button>

    <ng-template #menu>
      <div [ngpMenuFinalFocus]="false" ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="rename">Rename</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class NoFinalFocusMenuComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Actions</button>

    <ng-template #menu>
      <div ngpMenu ngpMenuEscapeClosesOnlySubmenu data-testid="menu">
        <button ngpMenuItem data-testid="rename">Rename</button>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="share">Share</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div [ngpMenuFinalFocus]="rename" ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="email">Email</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class SubmenuFinalFocusComponent {
  readonly rename = () => document.querySelector<HTMLElement>('[data-testid="rename"]');
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Actions</button>

    <ng-template #menu>
      <div ngpMenu ngpMenuEscapeClosesOnlySubmenu data-testid="menu">
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="share">Share</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div [ngpMenuFinalFocus]="false" ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="email">Email</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class SubmenuNoFinalFocusComponent {}

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

let renderedFixture: ComponentFixture<unknown> | undefined;

async function renderMenu<T>(component: Type<T>) {
  const result = await render(component);
  renderedFixture = result.fixture;
  return result;
}

/** Closes the menus through their trigger first: they render outside the fixture. */
async function cleanUpFixtures(): Promise<void> {
  if (renderedFixture) {
    const trigger = renderedFixture.debugElement.query(By.directive(NgpMenuTrigger));
    trigger.injector.get(NgpMenuTrigger).hide();
    await waitFor(() => expect(document.querySelector('[ngpMenu]')).toBeNull());
    renderedFixture.destroy();
    renderedFixture = undefined;
  }

  // the real pointer stays where a test left it, across files: park it away from fixtures
  const corner = document.body.appendChild(document.createElement('div'));
  corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;';
  await userEvent.hover(corner);
  corner.remove();
}

afterEach(cleanUpFixtures);

describe('Escape in a submenu when opted in', () => {
  const renderOptedIn = () => renderMenu(OptedInMenuComponent);

  it('closes only the submenu and focuses its trigger with a focus ring', async () => {
    await renderOptedIn();
    await openSubmenuWithKeyboard();

    await userEvent.keyboard('{Escape}');

    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    expect(document.activeElement).toBe(byId('share'));
    expect(byId('share')).toHaveAttribute('data-focus-visible');
  });

  it('closes the submenu with a keyboard origin', async () => {
    const { fixture } = await renderOptedIn();
    await openSubmenuWithKeyboard();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(fixture.componentInstance.closeOrigins).toEqual(['keyboard']));
  });

  it('cancels the default action of an Escape in a submenu', async () => {
    await renderOptedIn();
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
      await renderOptedIn();
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
    await renderOptedIn();
    await openSubmenuWithKeyboard();

    await userEvent.keyboard('{Escape}');
    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(open()).toEqual({ menu: false, submenu: false }));
    expect(document.activeElement).toBe(byId('trigger'));
  });

  it('closes only the submenu from an element inside it that is not an item', async () => {
    await renderOptedIn();
    await openSubmenuWithKeyboard();
    byId('help').focus();

    await userEvent.keyboard('{Escape}');

    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    expect(document.activeElement).toBe(byId('share'));
  });

  it('closes only the submenu of a submenu opened by hovering', async () => {
    await renderOptedIn();
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
    const { fixture } = await renderOptedIn();
    await openSubmenuWithKeyboard();
    fixture.componentInstance.shareDisabled.set(true);
    fixture.detectChanges();
    // disabling the trigger leaves its submenu open, so the Escape is what closes it
    expect(open()).toEqual({ menu: true, submenu: true });

    await userEvent.keyboard('{Escape}');

    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    expect(byId('share')).toHaveAttribute('aria-expanded', 'false');
  });

  it('leaves focus where the overlay puts it when the submenu final focus is false', async () => {
    await renderMenu(SubmenuNoFinalFocusComponent);
    await openSubmenuWithKeyboard();

    await userEvent.keyboard('{Escape}');

    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    expect(document.activeElement).not.toBe(byId('share'));
  });

  it('leaves focus where the overlay puts it when the submenu final focus returns false', async () => {
    const { fixture } = await renderOptedIn();
    fixture.componentInstance.finalFocusResult = false;
    await openSubmenuWithKeyboard();

    await userEvent.keyboard('{Escape}');

    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    expect(document.activeElement).not.toBe(byId('share'));
    expect(fixture.componentInstance.closeOrigins).toEqual(['keyboard']);
  });

  it('sends focus to the final focus of the submenu', async () => {
    await renderMenu(SubmenuFinalFocusComponent);
    await openSubmenuWithKeyboard();

    await userEvent.keyboard('{Escape}');

    await submenuClosed();
    expect(open()).toEqual({ menu: true, submenu: false });
    expect(document.activeElement).toBe(byId('rename'));
  });
});

describe('Escape in a submenu by default', () => {
  it('closes the whole menu from a submenu opened by keyboard and focuses the root trigger', async () => {
    await renderMenu(MenuComponent);
    await openSubmenuWithKeyboard();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(open()).toEqual({ menu: false, submenu: false }));
    expect(document.activeElement).toBe(byId('trigger'));
  });

  it('closes the whole menu from a submenu opened by hovering and focuses the root trigger', async () => {
    await renderMenu(MenuComponent);
    await userEvent.click(byId('trigger'));
    await waitFor(() => expect(present('menu')).toBe(true));
    await userEvent.hover(byId('share'));
    await waitFor(() => expect(present('submenu')).toBe(true));
    byId('email').focus();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(open()).toEqual({ menu: false, submenu: false }));
    expect(document.activeElement).toBe(byId('trigger'));
  });
});

describe('Escape in a root menu', () => {
  it('leaves focus alone when the final focus of the menu is false', async () => {
    await renderMenu(NoFinalFocusMenuComponent);
    byId('trigger').focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(document.activeElement).toBe(byId('rename')));
    // an exit animation keeps the menu open, and closing, after the Escape
    let finish!: () => void;
    const finished = new Promise<void>(resolve => (finish = resolve));
    byId('menu').getAnimations = () =>
      [
        {
          finished,
          cancel: () => undefined,
          finish: () => finish(),
          effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
        },
      ] as unknown as Animation[];

    try {
      await userEvent.keyboard('{Escape}');
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(document.activeElement).not.toBe(byId('trigger'));
    } finally {
      finish();
    }
    await waitFor(() => expect(present('menu')).toBe(false));
    // a second close scheduled with the hide delay must not restore focus once the menu is gone
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(document.activeElement).not.toBe(byId('trigger'));
  });
});
