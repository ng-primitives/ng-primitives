import { Component } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Options</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem>Edit</button>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="submenu-trigger">
          Share
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem>Email</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class MenuNameTestComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Options</button>

    <ng-template #menu>
      <div ngpMenu aria-label="File actions" data-testid="menu">
        <button ngpMenuItem>Edit</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class MenuStaticLabelTestComponent {}

describe('NgpMenu accessible name', () => {
  it('should be labelled by its trigger by default', async () => {
    await render(MenuNameTestComponent);
    const trigger = screen.getByTestId('trigger');
    fireEvent.click(trigger);

    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());
    const menu = screen.getByTestId('menu');

    expect(trigger.id).not.toBe('');
    await waitFor(() => expect(menu).toHaveAttribute('aria-labelledby', trigger.id));
    expect(menu).toHaveAccessibleName('Options');
  });

  it('should label a submenu by its submenu trigger', async () => {
    await render(MenuNameTestComponent);
    fireEvent.click(screen.getByTestId('trigger'));
    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());

    const submenuTrigger = screen.getByTestId('submenu-trigger');
    fireEvent.click(submenuTrigger);
    await waitFor(() => expect(screen.getByTestId('submenu')).toBeInTheDocument());

    expect(submenuTrigger.id).not.toBe('');
    await waitFor(() =>
      expect(screen.getByTestId('submenu')).toHaveAttribute('aria-labelledby', submenuTrigger.id),
    );
    expect(screen.getByTestId('submenu')).toHaveAccessibleName('Share');
  });

  it('should not override a static aria-label', async () => {
    await render(MenuStaticLabelTestComponent);
    fireEvent.click(screen.getByTestId('trigger'));
    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());

    await new Promise(resolve => setTimeout(resolve));
    expect(screen.getByTestId('menu')).not.toHaveAttribute('aria-labelledby');
    expect(screen.getByTestId('menu')).toHaveAccessibleName('File actions');
  });
});
