import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpDialog,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

@Component({ selector: 'ngp-nested-dialog', template: '<p>Nested</p>' })
class NestedDialog {}

@Component({
  template: `
    <button [ngpDialogTrigger]="first" data-testid="open-first">Open</button>

    <ng-template #first>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="first">
          <button [ngpPopoverTrigger]="popover" data-testid="open-popover">Popover</button>
        </div>
      </div>
    </ng-template>

    <ng-template #popover>
      <div ngpPopover data-testid="popover">
        <button [ngpDialogTrigger]="second" data-testid="open-second">Open nested</button>
      </div>
    </ng-template>

    <ng-template #second>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="second">Nested</div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog, NgpDialogOverlay, NgpPopoverTrigger, NgpPopover],
})
class PopoverInDialogHost {}

@Component({
  template: `
    <button [ngpDialogTrigger]="dialog" data-testid="open-first">Open</button>

    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="first">
          <button [ngpMenuTrigger]="menu" data-testid="open-menu">Menu</button>
        </div>
      </div>
    </ng-template>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="open-submenu">More</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem>Item</button>
      </div>
    </ng-template>
  `,
  imports: [
    NgpDialogTrigger,
    NgpDialog,
    NgpDialogOverlay,
    NgpMenuTrigger,
    NgpMenu,
    NgpMenuItem,
    NgpSubmenuTrigger,
  ],
})
class SubmenuInDialogHost {}

@Component({
  template: `
    <button [ngpPopoverTrigger]="popover" data-testid="open-popover">Popover</button>

    <ng-template #popover>
      <div ngpPopover data-testid="popover">Page popover</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class PagePopoverHost {}

/** Whether assistive technology can reach the element. */
function isExposed(element: Element): boolean {
  return element.closest('[aria-hidden="true"]') === null;
}

describe('NgpDialogManager overlays opened from a dialog', () => {
  let sibling: HTMLElement;

  beforeEach(() => {
    sibling = document.createElement('div');
    document.body.appendChild(sibling);
  });

  afterEach(async () => {
    const dialog = TestBed.inject(NgpDialogManager);
    dialog.closeAll();
    // `openDialogs` empties on close, but the portals only leave the DOM after their exit step
    await waitFor(() =>
      expect(document.querySelector('[ngpDialogOverlay], ngp-nested-dialog')).toBeNull(),
    );

    sibling.remove();
  });

  async function openPopoverThenNestedDialog(): Promise<HTMLElement> {
    await render(PopoverInDialogHost);
    fireEvent.click(screen.getByTestId('open-first'));
    fireEvent.click(await screen.findByTestId('open-popover'));
    fireEvent.click(await screen.findByTestId('open-second'));
    await screen.findByTestId('second');
    return screen.getByTestId('popover');
  }

  it('should keep a popover opened from a dialog accessible while a nested dialog is open', async () => {
    const popover = await openPopoverThenNestedDialog();

    expect(isExposed(popover)).toBe(true);
    expect(isExposed(screen.getByTestId('second'))).toBe(true);
    expect(sibling.getAttribute('aria-hidden')).toBe('true');
  });

  it('should keep a popover opened from a dialog accessible after a nested dialog closes', async () => {
    const popover = await openPopoverThenNestedDialog();

    const { openDialogs } = TestBed.inject(NgpDialogManager);
    const closed = firstValueFrom(openDialogs[openDialogs.length - 1].afterClosed);

    fireEvent.keyDown(document.body, { key: 'Escape' });
    await closed;

    expect(screen.queryByTestId('second')).toBeNull();
    expect(popover.isConnected).toBe(true);
    expect(isExposed(popover)).toBe(true);
    expect(sibling.getAttribute('aria-hidden')).toBe('true');
  });

  it('should keep a submenu opened from a dialog accessible when another dialog opens and closes', async () => {
    await render(SubmenuInDialogHost);
    fireEvent.click(screen.getByTestId('open-first'));
    fireEvent.click(await screen.findByTestId('open-menu'));
    fireEvent.click(await screen.findByTestId('open-submenu'));
    const menu = screen.getByTestId('menu');
    const submenu = await screen.findByTestId('submenu');

    const nested = TestBed.inject(NgpDialogManager).open(NestedDialog);

    expect(isExposed(menu)).toBe(true);
    expect(isExposed(submenu)).toBe(true);

    await nested.close();

    expect(isExposed(menu)).toBe(true);
    expect(isExposed(submenu)).toBe(true);
    expect(sibling.getAttribute('aria-hidden')).toBe('true');
  });

  it('should still hide a popover opened from the page when a dialog opens', async () => {
    await render(PagePopoverHost);
    fireEvent.click(screen.getByTestId('open-popover'));
    const popover = await screen.findByTestId('popover');

    const dialog = TestBed.inject(NgpDialogManager).open(NestedDialog);

    expect(isExposed(popover)).toBe(false);

    dialog.close();

    expect(isExposed(popover)).toBe(true);
  });
});
