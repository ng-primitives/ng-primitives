import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpMenuItem } from '../menu-item/menu-item';
import { NgpMenuTrigger } from '../menu-trigger/menu-trigger';
import { NgpMenu } from '../menu/menu';
import { NgpSubmenuTrigger } from './submenu-trigger';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button [ngpSubmenuTrigger]="level1" ngpMenuItem data-testid="level1-trigger">
          Level 1
        </button>
      </div>
    </ng-template>

    <ng-template #level1>
      <div ngpMenu data-testid="level1-menu">
        <button ngpMenuItem data-testid="level1-item">Sub Item</button>
        <button [ngpSubmenuTrigger]="level2" ngpMenuItem data-testid="level2-trigger">
          Level 2
        </button>
      </div>
    </ng-template>

    <ng-template #level2>
      <div ngpMenu data-testid="level2-menu">
        <button ngpMenuItem data-testid="nested-item">Nested Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class NestedSubmenuComponent {}

/**
 * Opens the root menu, hovers into the level-1 submenu and returns the level-1
 * panel with its geometry mocked: the level-1 trigger sits in the root panel on
 * the left and the level-1 panel opens to its right.
 */
async function openLevelOneSubmenu(): Promise<{
  level1Trigger: HTMLElement;
  level1Menu: HTMLElement;
}> {
  const rootTrigger = document.querySelector('[data-testid="root-trigger"]') as HTMLElement;

  fireEvent.click(rootTrigger);
  await waitFor(() =>
    expect(document.querySelector('[data-testid="level1-trigger"]')).toBeInTheDocument(),
  );

  const level1Trigger = document.querySelector('[data-testid="level1-trigger"]') as HTMLElement;
  fireEvent.pointerEnter(level1Trigger, { pointerType: 'mouse' });
  await waitFor(() =>
    expect(document.querySelector('[data-testid="level1-menu"]')).toBeInTheDocument(),
  );

  const level1Menu = document.querySelector('[data-testid="level1-menu"]') as HTMLElement;
  vi.spyOn(level1Trigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 120, 30));
  vi.spyOn(level1Menu, 'getBoundingClientRect').mockReturnValue(new DOMRect(200, 0, 160, 120));

  // Leave the level-1 trigger heading toward its panel, travel through the
  // corridor and arrive on the level-1 panel.
  fireEvent.pointerLeave(level1Trigger, { pointerType: 'mouse', clientX: 120, clientY: 15 });
  fireEvent.pointerMove(document, { clientX: 160, clientY: 15 });
  fireEvent.pointerEnter(level1Menu, { pointerType: 'mouse' });
  fireEvent.pointerMove(document, { clientX: 240, clientY: 20 });

  return { level1Trigger, level1Menu };
}

/**
 * From an open level-1 submenu, hovers the nested (level-2) submenu trigger and
 * returns the opened level-2 panel with its geometry mocked: the level-2
 * trigger is the second item of the level-1 panel and the level-2 panel opens
 * to its right.
 */
async function openLevelTwoSubmenu(): Promise<{
  level2Trigger: HTMLElement;
  level2Menu: HTMLElement;
}> {
  const level2Trigger = document.querySelector('[data-testid="level2-trigger"]') as HTMLElement;

  // pointerenter fires before the compatibility mouseenter in real browsers.
  fireEvent.pointerEnter(level2Trigger, { pointerType: 'mouse' });
  fireEvent.mouseEnter(level2Trigger);
  await waitFor(() =>
    expect(document.querySelector('[data-testid="level2-menu"]')).toBeInTheDocument(),
  );

  const level2Menu = document.querySelector('[data-testid="level2-menu"]') as HTMLElement;
  vi.spyOn(level2Trigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(200, 40, 160, 30));
  vi.spyOn(level2Menu, 'getBoundingClientRect').mockReturnValue(new DOMRect(400, 40, 160, 90));

  return { level2Trigger, level2Menu };
}

describe('NgpSubmenuTrigger nested submenus (#805)', () => {
  afterEach(() => {
    document.querySelectorAll('[data-overlay]').forEach(el => el.remove());
    vi.useRealTimers();
  });

  it('keeps a nested submenu open once the pointer reaches its panel', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await render(NestedSubmenuComponent);

    const { level1Menu } = await openLevelOneSubmenu();
    const { level2Trigger, level2Menu } = await openLevelTwoSubmenu();

    // Leave the level-2 trigger heading toward its panel. Crossing the panel
    // boundary also leaves the level-1 panel.
    fireEvent.pointerLeave(level2Trigger, { pointerType: 'mouse', clientX: 360, clientY: 55 });
    fireEvent.pointerLeave(level1Menu, { pointerType: 'mouse', clientX: 360, clientY: 55 });
    fireEvent.pointerMove(document, { clientX: 380, clientY: 55 });
    fireEvent.pointerEnter(level2Menu, { pointerType: 'mouse' });

    // Moving around inside the nested panel must not close it.
    fireEvent.pointerMove(document, { clientX: 440, clientY: 60 });
    vi.advanceTimersByTime(300);

    expect(document.querySelector('[data-testid="level2-menu"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="level1-menu"]')).toBeInTheDocument();

    // Hovering an item inside the nested panel must not close it either.
    const nestedItem = document.querySelector('[data-testid="nested-item"]') as HTMLElement;
    fireEvent.pointerEnter(nestedItem, { pointerType: 'mouse' });
    fireEvent.mouseEnter(nestedItem);
    fireEvent.pointerMove(document, { clientX: 440, clientY: 60 });
    vi.advanceTimersByTime(300);

    expect(document.querySelector('[data-testid="level2-menu"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="level1-menu"]')).toBeInTheDocument();
  });

  it('keeps the level-1 submenu open while the pointer moves within its panel', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await render(NestedSubmenuComponent);

    await openLevelOneSubmenu();

    // Move around inside the level-1 panel well past every fallback window.
    fireEvent.pointerMove(document, { clientX: 260, clientY: 60 });
    vi.advanceTimersByTime(300);
    fireEvent.pointerMove(document, { clientX: 280, clientY: 90 });
    vi.advanceTimersByTime(300);

    expect(document.querySelector('[data-testid="level1-menu"]')).toBeInTheDocument();
  });

  it('closes the whole chain when the root menu closes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await render(NestedSubmenuComponent);

    await openLevelOneSubmenu();
    await openLevelTwoSubmenu();

    // Toggle the root menu closed - both submenus must cascade closed with it.
    const rootTrigger = document.querySelector('[data-testid="root-trigger"]') as HTMLElement;
    fireEvent.click(rootTrigger);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="root-menu"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-testid="level1-menu"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-testid="level2-menu"]')).not.toBeInTheDocument();
    });
  });

  it('closes the whole chain when an item in the nested submenu is selected', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await render(NestedSubmenuComponent);

    await openLevelOneSubmenu();
    await openLevelTwoSubmenu();

    // Selecting a regular item closes all menus via closeAllMenus.
    const nestedItem = document.querySelector('[data-testid="nested-item"]') as HTMLElement;
    fireEvent.click(nestedItem);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="root-menu"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-testid="level1-menu"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-testid="level2-menu"]')).not.toBeInTheDocument();
    });
  });

  it('closes the whole chain when Escape is pressed inside the nested submenu', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await render(NestedSubmenuComponent);

    await openLevelOneSubmenu();
    await openLevelTwoSubmenu();

    const level2Menu = document.querySelector('[data-testid="level2-menu"]') as HTMLElement;
    fireEvent.keyDown(level2Menu, { key: 'Escape' });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="root-menu"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-testid="level1-menu"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-testid="level2-menu"]')).not.toBeInTheDocument();
    });
  });

  it('closes the nested submenu when a sibling item in the level-1 panel is hovered', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await render(NestedSubmenuComponent);

    await openLevelOneSubmenu();
    await openLevelTwoSubmenu();

    // Move back to the plain sibling item in the level-1 panel - no corridor is
    // active, so the nested submenu must close.
    const siblingItem = document.querySelector('[data-testid="level1-item"]') as HTMLElement;
    fireEvent.pointerEnter(siblingItem, { pointerType: 'mouse' });
    fireEvent.mouseEnter(siblingItem);

    await waitFor(() =>
      expect(document.querySelector('[data-testid="level2-menu"]')).not.toBeInTheDocument(),
    );
    expect(document.querySelector('[data-testid="level1-menu"]')).toBeInTheDocument();
  });
});
