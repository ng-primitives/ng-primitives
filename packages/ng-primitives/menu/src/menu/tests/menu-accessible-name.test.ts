import { Component, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';

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

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" [id]="triggerId()" data-testid="trigger">Options</button>

    <ng-template #menu>
      <div [attr.aria-label]="label()" ngpMenu data-testid="menu">
        <button
          [ngpSubmenuTrigger]="submenu"
          [id]="submenuTriggerId()"
          ngpMenuItem
          data-testid="submenu-trigger"
        >
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
class MenuTriggerIdTestComponent {
  readonly triggerId = signal('first-trigger');
  readonly submenuTriggerId = signal('first-submenu-trigger');
  readonly label = signal<string | null>(null);
}

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

  describe('when the trigger id changes', () => {
    afterEach(async () => {
      if (screen.queryByTestId('menu')) {
        fireEvent.click(screen.getByTestId('trigger'));
      }
      await waitFor(() => {
        expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
        expect(screen.queryByTestId('submenu')).not.toBeInTheDocument();
      });
    });

    it('should stay labelled by its trigger', async () => {
      const { fixture } = await render(MenuTriggerIdTestComponent);
      const trigger = screen.getByTestId('trigger');
      fireEvent.click(trigger);
      await waitFor(() =>
        expect(screen.getByTestId('menu')).toHaveAttribute('aria-labelledby', 'first-trigger'),
      );

      fixture.componentInstance.triggerId.set('second-trigger');
      fixture.detectChanges();

      await waitFor(() =>
        expect(screen.getByTestId('menu')).toHaveAttribute('aria-labelledby', 'second-trigger'),
      );
      expect(trigger).toHaveAttribute('id', 'second-trigger');
      expect(screen.getByTestId('menu')).toHaveAccessibleName('Options');
    });

    it('should take its name from an aria-label while it has one', async () => {
      const { fixture } = await render(MenuTriggerIdTestComponent);
      fireEvent.click(screen.getByTestId('trigger'));
      await waitFor(() =>
        expect(screen.getByTestId('menu')).toHaveAttribute('aria-labelledby', 'first-trigger'),
      );
      const menu = screen.getByTestId('menu');

      fixture.componentInstance.label.set('File actions');
      fixture.detectChanges();

      await waitFor(() => expect(menu).not.toHaveAttribute('aria-labelledby'));
      expect(menu).toHaveAccessibleName('File actions');

      fixture.componentInstance.label.set(null);
      fixture.detectChanges();

      await waitFor(() => expect(menu).toHaveAttribute('aria-labelledby', 'first-trigger'));
      expect(menu).toHaveAccessibleName('Options');
    });

    it('should keep a submenu labelled by its submenu trigger', async () => {
      const { fixture } = await render(MenuTriggerIdTestComponent);
      fireEvent.click(screen.getByTestId('trigger'));
      await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());

      const submenuTrigger = screen.getByTestId('submenu-trigger');
      fireEvent.click(submenuTrigger);
      await waitFor(() =>
        expect(screen.getByTestId('submenu')).toHaveAttribute(
          'aria-labelledby',
          'first-submenu-trigger',
        ),
      );

      fixture.componentInstance.submenuTriggerId.set('second-submenu-trigger');
      fixture.detectChanges();

      await waitFor(() => expect(submenuTrigger).toHaveAttribute('id', 'second-submenu-trigger'));
      expect(screen.getByTestId('menu')).toBeInTheDocument();

      await waitFor(() =>
        expect(screen.getByTestId('submenu')).toHaveAttribute(
          'aria-labelledby',
          'second-submenu-trigger',
        ),
      );
      expect(screen.getByTestId('submenu')).toHaveAccessibleName('Share');
    });
  });
});
