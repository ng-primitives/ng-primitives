import { Component, TemplateRef, viewChild } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpMenuItem } from '../menu-item/menu-item';
import { NgpMenu } from '../menu/menu';
import { NgpSubmenuTrigger } from '../submenu-trigger/submenu-trigger';
import { NgpMenuTrigger } from './menu-trigger';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" [ngpMenuTriggerOpenTriggers]="['hover']" data-testid="trigger">
      Open Menu
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="item-1">Item 1</button>
        <button ngpMenuItem data-testid="item-2">Item 2</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class HoverMenuComponent {
  menu = viewChild<TemplateRef<unknown>>('menu');
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button ngpMenuItem data-testid="item-1">Item 1</button>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="submenu-trigger">
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class SubmenuComponent {}

describe('NgpMenuTrigger safe-polygon hover bridge', () => {
  afterEach(() => {
    document.querySelectorAll('[data-overlay]').forEach(el => el.remove());
    vi.useRealTimers();
  });

  it('keeps the menu open while the pointer stays inside the corridor and closes when it leaves', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { fixture } = await render(HoverMenuComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="trigger"]',
    ) as HTMLElement;

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
    await waitFor(() => expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument());

    const menu = document.querySelector('[data-testid="menu"]') as HTMLElement;
    // Mock geometry: trigger on the left, menu panel to the right, so the
    // corridor runs horizontally between the exit point and the panel.
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 40, 20));
    vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue(new DOMRect(200, 0, 120, 90));

    // Leave the trigger heading toward the panel, then move inside the corridor.
    fireEvent.pointerLeave(trigger, { pointerType: 'mouse', clientX: 40, clientY: 10 });
    fireEvent.pointerMove(document, { clientX: 160, clientY: 15 });
    vi.advanceTimersByTime(1);
    expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();

    // Move well outside the corridor - the menu should close.
    fireEvent.pointerMove(document, { clientX: 160, clientY: 300 });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu"]')).not.toBeInTheDocument(),
    );
  });

  it('closes the menu when the pointer leaves the trigger and never reaches the panel', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { fixture } = await render(HoverMenuComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="trigger"]',
    ) as HTMLElement;

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
    await waitFor(() => expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument());

    const menu = document.querySelector('[data-testid="menu"]') as HTMLElement;
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 40, 20));
    vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue(new DOMRect(200, 0, 120, 90));

    // Leave the trigger but never move toward the panel - the fallback closes it.
    fireEvent.pointerLeave(trigger, { pointerType: 'mouse', clientX: 40, clientY: 10 });
    vi.advanceTimersByTime(200);

    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu"]')).not.toBeInTheDocument(),
    );
  });

  it('keeps an open submenu open while the pointer crosses sibling items inside the corridor', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { fixture } = await render(SubmenuComponent);
    const rootTrigger = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="root-trigger"]',
    ) as HTMLElement;

    fireEvent.click(rootTrigger);
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
    );

    const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]') as HTMLElement;
    fireEvent.pointerEnter(submenuTrigger, { pointerType: 'mouse' });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument(),
    );

    const submenu = document.querySelector('[data-testid="submenu"]') as HTMLElement;
    // Trigger on the left, submenu panel to the right (matches right-start placement).
    vi.spyOn(submenuTrigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 120, 30));
    vi.spyOn(submenu, 'getBoundingClientRect').mockReturnValue(new DOMRect(200, 0, 120, 90));

    // Leave the submenu trigger heading toward the panel.
    fireEvent.pointerLeave(submenuTrigger, { pointerType: 'mouse', clientX: 120, clientY: 15 });

    // Hovering a sibling item normally broadcasts a close; inside the corridor it must be ignored.
    const sibling = document.querySelector('[data-testid="item-1"]') as HTMLElement;
    fireEvent.mouseEnter(sibling);
    fireEvent.pointerMove(document, { clientX: 170, clientY: 15 });
    vi.advanceTimersByTime(1);
    expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();

    // Move well outside the corridor - the submenu should close.
    fireEvent.pointerMove(document, { clientX: 170, clientY: 300 });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument(),
    );
  });

  it('keeps the menu open once the pointer reaches the panel (FEII-580 crossing)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { fixture } = await render(HoverMenuComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="trigger"]',
    ) as HTMLElement;

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
    await waitFor(() => expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument());

    const menu = document.querySelector('[data-testid="menu"]') as HTMLElement;
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 40, 20));
    vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue(new DOMRect(200, 0, 120, 90));

    // Leave the trigger, cross the corridor, then arrive at the panel.
    fireEvent.pointerLeave(trigger, { pointerType: 'mouse', clientX: 40, clientY: 10 });
    fireEvent.pointerMove(document, { clientX: 160, clientY: 15 });
    fireEvent.pointerEnter(menu);

    // Even past the fallback window, the menu stays open because the pointer arrived.
    vi.advanceTimersByTime(300);
    expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
  });

  it('keeps the menu open and drops the bridge when the pointer returns to the trigger', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { fixture } = await render(HoverMenuComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="trigger"]',
    ) as HTMLElement;

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
    await waitFor(() => expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument());

    const menu = document.querySelector('[data-testid="menu"]') as HTMLElement;
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 40, 20));
    vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue(new DOMRect(200, 0, 120, 90));

    fireEvent.pointerLeave(trigger, { pointerType: 'mouse', clientX: 40, clientY: 10 });
    // Return to the trigger before the fallback fires.
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

    vi.advanceTimersByTime(300);
    expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
  });

  it('keeps the submenu open once the pointer reaches the submenu panel', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { fixture } = await render(SubmenuComponent);
    const rootTrigger = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="root-trigger"]',
    ) as HTMLElement;

    fireEvent.click(rootTrigger);
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
    );

    const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]') as HTMLElement;
    fireEvent.pointerEnter(submenuTrigger, { pointerType: 'mouse' });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument(),
    );

    const submenu = document.querySelector('[data-testid="submenu"]') as HTMLElement;
    vi.spyOn(submenuTrigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 120, 30));
    vi.spyOn(submenu, 'getBoundingClientRect').mockReturnValue(new DOMRect(200, 0, 120, 90));

    fireEvent.pointerLeave(submenuTrigger, { pointerType: 'mouse', clientX: 120, clientY: 15 });
    fireEvent.pointerMove(document, { clientX: 170, clientY: 15 });
    fireEvent.pointerEnter(submenu);

    // Arriving at the panel clears the corridor; it stays open past the fallback.
    vi.advanceTimersByTime(300);
    expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
  });

  it('closes the submenu on a sibling hover when no corridor is active', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { fixture } = await render(SubmenuComponent);
    const rootTrigger = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="root-trigger"]',
    ) as HTMLElement;

    fireEvent.click(rootTrigger);
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
    );

    const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]') as HTMLElement;
    fireEvent.pointerEnter(submenuTrigger, { pointerType: 'mouse' });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument(),
    );

    // No pointer-leave, so no corridor is built. A sibling hover must still close it.
    const sibling = document.querySelector('[data-testid="item-1"]') as HTMLElement;
    fireEvent.mouseEnter(sibling);

    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument(),
    );
  });

  it('closes the submenu via the idle fallback when the pointer leaves and stops', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { fixture } = await render(SubmenuComponent);
    const rootTrigger = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="root-trigger"]',
    ) as HTMLElement;

    fireEvent.click(rootTrigger);
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
    );

    const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]') as HTMLElement;
    fireEvent.pointerEnter(submenuTrigger, { pointerType: 'mouse' });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument(),
    );

    const submenu = document.querySelector('[data-testid="submenu"]') as HTMLElement;
    vi.spyOn(submenuTrigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 120, 30));
    vi.spyOn(submenu, 'getBoundingClientRect').mockReturnValue(new DOMRect(200, 0, 120, 90));

    // Leave the trigger but never move toward the panel - the fallback closes it.
    fireEvent.pointerLeave(submenuTrigger, { pointerType: 'mouse', clientX: 120, clientY: 15 });
    vi.advanceTimersByTime(200);

    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument(),
    );
  });

  it('closes the menu when the pointer reverses away while still inside the corridor', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { fixture } = await render(HoverMenuComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="trigger"]',
    ) as HTMLElement;

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
    await waitFor(() => expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument());

    const menu = document.querySelector('[data-testid="menu"]') as HTMLElement;
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 40, 20));
    vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue(new DOMRect(200, 0, 120, 90));

    fireEvent.pointerLeave(trigger, { pointerType: 'mouse', clientX: 40, clientY: 10 });
    // Advance toward the panel (stays open)...
    fireEvent.pointerMove(document, { clientX: 160, clientY: 15 });
    vi.advanceTimersByTime(1);
    expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();

    // ...then reverse back toward the trigger while still geometrically inside
    // the corridor. The direction gate should close it despite being in-polygon.
    fireEvent.pointerMove(document, { clientX: 120, clientY: 15 });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu"]')).not.toBeInTheDocument(),
    );
  });
});
