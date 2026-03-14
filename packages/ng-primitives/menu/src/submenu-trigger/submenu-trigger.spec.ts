import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpMenuItem } from '../menu-item/menu-item';
import { NgpMenuTrigger } from '../menu-trigger/menu-trigger';
import { NgpMenu } from '../menu/menu';
import { NgpSubmenuTrigger } from './submenu-trigger';

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
        <button ngpMenuItem data-testid="submenu-item-2">Submenu Item 2</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestSubmenuComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button
          [ngpSubmenuTrigger]="submenu"
          [ngpSubmenuTriggerFlip]="false"
          ngpMenuItem
          data-testid="submenu-trigger"
        >
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
class TestSubmenuNoFlipComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button
          [ngpSubmenuTrigger]="submenu"
          [ngpSubmenuTriggerPlacement]="placement"
          [ngpSubmenuTriggerFlip]="false"
          ngpMenuItem
          data-testid="submenu-trigger"
        >
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
class TestSubmenuPlacementComponent {
  placement: string = 'right-start';
}

/**
 * Helper to open the root menu and submenu.
 */
async function openMenuAndSubmenu(fixture: {
  autoDetectChanges: (autoDetect: boolean) => void;
  debugElement: { nativeElement: HTMLElement };
}): Promise<void> {
  fixture.autoDetectChanges(true);

  const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="root-trigger"]')!;

  // Open root menu
  fireEvent.click(trigger);

  await waitFor(() => {
    expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
  });

  // Open submenu
  const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
  fireEvent.click(submenuTrigger);

  await waitFor(() => {
    expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
  });
}

describe('NgpSubmenuTrigger viewport awareness', () => {
  describe('data-placement attribute', () => {
    it('should set data-placement on the submenu when opened', async () => {
      const { fixture } = await render(TestSubmenuComponent);
      fixture.autoDetectChanges(true);

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
      });

      // Open submenu
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
      fireEvent.click(submenuTrigger);

      await waitFor(() => {
        const submenu = document.querySelector('[data-testid="submenu"]');
        expect(submenu).toBeInTheDocument();
        const placement = submenu?.getAttribute('data-placement');
        expect(placement).toMatch(/^(top|bottom|left|right)(-start|-end)?$/);
      });
    });
  });

  describe('flip behavior', () => {
    it('should use right-start placement by default when there is space', async () => {
      const { fixture } = await render(TestSubmenuComponent);
      await openMenuAndSubmenu(fixture);

      await waitFor(() => {
        const submenu = document.querySelector('[data-testid="submenu"]');
        expect(submenu).toBeInTheDocument();
        const placement = submenu?.getAttribute('data-placement');
        expect(placement).toContain('right');
      });
    });

    it('should not flip when flip is disabled', async () => {
      const { fixture } = await render(TestSubmenuNoFlipComponent);
      await openMenuAndSubmenu(fixture);

      await waitFor(() => {
        const submenu = document.querySelector('[data-testid="submenu"]');
        expect(submenu).toBeInTheDocument();
        // With flip disabled, placement should remain exactly right-start regardless of viewport
        const placement = submenu?.getAttribute('data-placement');
        expect(placement).toBe('right-start');
      });
    });
  });

  describe('custom placement', () => {
    it('should use left-start placement when specified', async () => {
      const { fixture } = await render(TestSubmenuPlacementComponent);
      fixture.componentInstance.placement = 'left-start';
      fixture.autoDetectChanges(true);

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      )!;

      // Open root menu
      fireEvent.click(trigger);

      await waitFor(() => {
        const st = document.querySelector('[data-testid="submenu-trigger"]');
        expect(st).toBeInTheDocument();
      });

      // Open submenu
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
      fireEvent.click(submenuTrigger);

      // With flip disabled on TestSubmenuPlacementComponent, the specified
      // left-start placement should be honoured by floating-ui.
      await waitFor(() => {
        const submenu = document.querySelector('[data-testid="submenu"]');
        expect(submenu).toBeInTheDocument();
        const placement = submenu?.getAttribute('data-placement');
        expect(placement).toContain('left');
      });
    });
  });
});
