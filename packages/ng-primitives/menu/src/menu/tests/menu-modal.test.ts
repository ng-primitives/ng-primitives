import { Component, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuTrigger,
  NgpMenuTriggerGroup,
  NgpSubmenuTrigger,
  provideMenuConfig,
} from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
  template: `
    <button (click)="pageClicks.set(pageClicks() + 1)" data-testid="page-button">Page</button>

    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerModal]="modal()"
      [ngpMenuTriggerOpenTriggers]="triggers()"
      data-testid="trigger"
    >
      Open
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <p data-testid="menu-label">Actions</p>
        <button ngpMenuItem data-testid="item">Item</button>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="submenu-trigger">
          More
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item">Sub item</button>
      </div>
    </ng-template>
  `,
})
class ModalMenuHost {
  readonly modal = signal(true);
  readonly triggers = signal<('click' | 'hover')[]>(['click']);
  readonly pageClicks = signal(0);
}

function isInert(element: Element): boolean {
  return element.closest('[inert]') !== null;
}

async function openMenu(): Promise<HTMLElement> {
  await userEvent.click(screen.getByTestId('trigger'));
  return screen.findByTestId('menu');
}

async function openSubmenu(): Promise<HTMLElement> {
  fireEvent.pointerEnter(screen.getByTestId('submenu-trigger'), { pointerType: 'mouse' });
  return screen.findByTestId('submenu');
}

/** Click like a user would. `force` skips Playwright's check that the target takes pointer events. */
async function clickThrough(element: HTMLElement): Promise<void> {
  await userEvent.click(element, { force: true });
}

describe('NgpMenuTrigger modal', () => {
  // The pointer keeps its position across test files: park it where nothing renders, so a later
  // file does not open something on hover.
  afterEach(async () => {
    const corner = document.body.appendChild(document.createElement('div'));
    corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;';
    await userEvent.hover(corner);
    corner.remove();
  });

  it('makes the rest of the page inert, but not the trigger', async () => {
    await render(ModalMenuHost);
    const menu = await openMenu();

    expect(isInert(screen.getByTestId('page-button'))).toBe(true);
    expect(isInert(screen.getByTestId('trigger'))).toBe(false);
    expect(isInert(menu)).toBe(false);
  });

  it('closes on a click outside without letting the click through', async () => {
    const { fixture } = await render(ModalMenuHost);
    await openMenu();

    await clickThrough(screen.getByTestId('page-button'));

    await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull());
    expect(fixture.componentInstance.pageClicks()).toBe(0);
    expect(isInert(screen.getByTestId('page-button'))).toBe(false);
  });

  it('lets the click through when it is not modal', async () => {
    const { fixture } = await render(ModalMenuHost);
    fixture.componentInstance.modal.set(false);
    fixture.detectChanges();
    await openMenu();

    expect(isInert(screen.getByTestId('page-button'))).toBe(false);

    await userEvent.click(screen.getByTestId('page-button'));

    await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull());
    expect(fixture.componentInstance.pageClicks()).toBe(1);
  });

  it('keeps a submenu usable', async () => {
    await render(ModalMenuHost);
    await openMenu();
    const submenu = await openSubmenu();

    expect(isInert(submenu)).toBe(false);
  });

  it('closes the menu and its submenu together on a click outside both', async () => {
    const { fixture } = await render(ModalMenuHost);
    await openMenu();
    await openSubmenu();

    await clickThrough(screen.getByTestId('page-button'));

    await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull());
    expect(screen.queryByTestId('submenu')).toBeNull();
    expect(fixture.componentInstance.pageClicks()).toBe(0);
  });

  it('closes only the submenu on a click in the root menu', async () => {
    await render(ModalMenuHost);
    const menu = await openMenu();
    await openSubmenu();

    await userEvent.click(screen.getByTestId('menu-label'));

    await waitFor(() => expect(screen.queryByTestId('submenu')).toBeNull());
    expect(menu.isConnected).toBe(true);
  });

  it('is never modal when it opens on hover', async () => {
    const { fixture } = await render(ModalMenuHost);
    fixture.componentInstance.triggers.set(['click', 'hover']);
    fixture.detectChanges();

    await userEvent.hover(screen.getByTestId('trigger'));
    await screen.findByTestId('menu');

    expect(isInert(screen.getByTestId('page-button'))).toBe(false);
  });

  it('is modal when a menu that also opens on hover is opened by a click', async () => {
    const { fixture } = await render(ModalMenuHost);
    fixture.componentInstance.triggers.set(['click', 'hover']);
    fixture.detectChanges();
    // opened on hover first, then closed
    await userEvent.hover(screen.getByTestId('trigger'));
    await screen.findByTestId('menu');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull());

    fireEvent.click(screen.getByTestId('trigger'));
    await screen.findByTestId('menu');

    expect(isInert(screen.getByTestId('page-button'))).toBe(true);
  });

  it('is never modal in a trigger group', async () => {
    @Component({
      imports: [NgpMenuTrigger, NgpMenuTriggerGroup, NgpMenu, NgpMenuItem],
      template: `
        <button data-testid="page-button">Page</button>
        <div ngpMenuTriggerGroup>
          <button [ngpMenuTrigger]="menu" ngpMenuTriggerModal data-testid="trigger">File</button>
          <button [ngpMenuTrigger]="menu" ngpMenuTriggerModal>Edit</button>
        </div>
        <ng-template #menu>
          <div ngpMenu data-testid="menu"><button ngpMenuItem>Item</button></div>
        </ng-template>
      `,
    })
    class TriggerGroupHost {}

    await render(TriggerGroupHost);
    await openMenu();

    expect(isInert(screen.getByTestId('page-button'))).toBe(false);
  });

  it('can be made modal from the config', async () => {
    @Component({
      imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
      providers: [provideMenuConfig({ modal: true })],
      template: `
        <button data-testid="page-button">Page</button>
        <button [ngpMenuTrigger]="menu" data-testid="trigger">Open</button>
        <ng-template #menu>
          <div ngpMenu data-testid="menu"><button ngpMenuItem>Item</button></div>
        </ng-template>
      `,
    })
    class ConfiguredHost {}

    await render(ConfiguredHost);
    await openMenu();

    expect(isInert(screen.getByTestId('page-button'))).toBe(true);
  });
});
