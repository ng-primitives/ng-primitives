import { Component } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';
import { describe, expect, it } from 'vitest';

/**
 * Inline fixtures mirroring
 * `apps/components/.../reusable-components/context-menu/context-menu.ts` and
 * `context-menu-item.ts`. The `ngpContextMenu` / `ngpContextMenuItem`
 * directives are applied via hostDirectives.
 */
@Component({
  selector: 'app-context-menu',
  hostDirectives: [NgpContextMenu],
  template: `
    <ng-content />
  `,
})
class ContextMenu {}

@Component({
  selector: 'button[app-context-menu-item]',
  hostDirectives: [NgpContextMenuItem],
  host: { type: 'button' },
  template: `
    <ng-content />
  `,
})
class ContextMenuItem {}

@Component({
  selector: 'app-context-menu-example',
  imports: [ContextMenu, ContextMenuItem, NgpContextMenuTrigger],
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">Right-click me</div>

    <ng-template #menu>
      <app-context-menu data-testid="menu">
        <button app-context-menu-item data-testid="item-cut">Cut</button>
        <button app-context-menu-item data-testid="item-copy">Copy</button>
        <button app-context-menu-item data-testid="item-paste">Paste</button>
      </app-context-menu>
    </ng-template>
  `,
})
class ContextMenuExample {}

async function openContextMenu(): Promise<HTMLElement> {
  const triggerArea = screen.getByTestId('trigger-area');
  fireEvent.contextMenu(triggerArea);
  await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());
  return triggerArea;
}

describe('ContextMenu (reusable component) — standalone', () => {
  it('opens on right-click with role="menu"', async () => {
    await render(ContextMenuExample);
    await openContextMenu();

    expect(screen.getByTestId('menu')).toHaveAttribute('role', 'menu');
  });

  it('renders items with role="menuitem"', async () => {
    await render(ContextMenuExample);
    await openContextMenu();

    expect(screen.getByTestId('item-cut')).toHaveAttribute('role', 'menuitem');
    expect(screen.getByTestId('item-copy')).toHaveAttribute('role', 'menuitem');
    expect(screen.getByTestId('item-paste')).toHaveAttribute('role', 'menuitem');
  });

  it('prevents the native context menu', async () => {
    await render(ContextMenuExample);

    const triggerArea = screen.getByTestId('trigger-area');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    triggerArea.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('traps focus in the menu and marks the trigger open', async () => {
    await render(ContextMenuExample);
    const triggerArea = await openContextMenu();

    expect(screen.getByTestId('menu')).toHaveAttribute('data-focus-trap');
    expect(triggerArea).toHaveAttribute('data-open');
  });

  it('closes when an item is selected', async () => {
    await render(ContextMenuExample);
    await openContextMenu();

    fireEvent.click(screen.getByTestId('item-cut'));

    await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());
  });

  it('closes on Escape', async () => {
    await render(ContextMenuExample);
    const triggerArea = await openContextMenu();

    fireEvent.keyDown(screen.getByTestId('menu'), { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
      expect(triggerArea).not.toHaveAttribute('data-open');
    });
  });

  it('closes on outside click', async () => {
    await render(ContextMenuExample);
    await openContextMenu();

    fireEvent.mouseUp(document.body);

    await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());
  });
});
