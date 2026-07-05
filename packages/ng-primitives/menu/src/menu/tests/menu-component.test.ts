import { Component } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { describe, expect, it } from 'vitest';

/**
 * Inline fixtures mirroring
 * `apps/components/.../reusable-components/menu/menu.ts` and `menu-item.ts`.
 * The `ngpMenu` / `ngpMenuItem` directives are applied via hostDirectives so
 * the wrapper component host element is the menu / item element.
 */
@Component({
  selector: 'app-menu',
  hostDirectives: [NgpMenu],
  template: `
    <ng-content />
  `,
})
class Menu {}

@Component({
  selector: 'button[app-menu-item]',
  hostDirectives: [NgpMenuItem],
  template: `
    <ng-content />
  `,
})
class MenuItem {}

@Component({
  selector: 'app-menu-example',
  imports: [Menu, MenuItem, NgpButton, NgpMenuTrigger],
  template: `
    <button [ngpMenuTrigger]="menu" ngpButton data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <app-menu data-testid="menu">
        <button app-menu-item data-testid="item-1">Item 1</button>
        <button app-menu-item data-testid="item-2">Item 2</button>
        <button app-menu-item data-testid="item-3">Item 3</button>
      </app-menu>
    </ng-template>
  `,
})
class MenuExample {}

async function openMenu(): Promise<HTMLElement> {
  const trigger = screen.getByTestId('trigger');
  fireEvent.click(trigger);
  await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());
  return trigger;
}

describe('Menu (reusable component) — standalone', () => {
  it('opens the menu on trigger click with role="menu"', async () => {
    await render(MenuExample);
    await openMenu();

    expect(screen.getByTestId('menu')).toHaveAttribute('role', 'menu');
  });

  it('renders items with role="menuitem"', async () => {
    await render(MenuExample);
    await openMenu();

    expect(screen.getByTestId('item-1')).toHaveAttribute('role', 'menuitem');
    expect(screen.getByTestId('item-2')).toHaveAttribute('role', 'menuitem');
    expect(screen.getByTestId('item-3')).toHaveAttribute('role', 'menuitem');
  });

  it('exposes aria-haspopup and reflects aria-expanded on the trigger', async () => {
    await render(MenuExample);

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await openMenu();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('traps focus in the menu per WAI-ARIA', async () => {
    await render(MenuExample);
    await openMenu();

    expect(screen.getByTestId('menu')).toHaveAttribute('data-focus-trap');
  });

  it('closes the menu when an item is selected', async () => {
    await render(MenuExample);
    const trigger = await openMenu();

    fireEvent.click(screen.getByTestId('item-1'));

    await waitFor(() => {
      expect(trigger).not.toHaveAttribute('data-open');
      expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
    });
  });

  it('closes the menu on Escape', async () => {
    await render(MenuExample);
    const trigger = await openMenu();

    fireEvent.keyDown(screen.getByTestId('menu'), { key: 'Escape' });

    await waitFor(() => {
      expect(trigger).not.toHaveAttribute('data-open');
      expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
    });
  });
});
