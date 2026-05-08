import { Component, TemplateRef, viewChild } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { NgpMenuItem } from '../menu-item/menu-item';
import { NgpMenuTrigger } from '../menu-trigger/menu-trigger';
import { NgpSubmenuTrigger } from '../submenu-trigger/submenu-trigger';
import { NgpMenu } from './menu';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button ngpMenuItem data-testid="item-1">Item 1</button>
        <button ngpMenuItem data-testid="item-2">Item 2</button>
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
class TestMenuWithSubmenuComponent {
  menu = viewChild<TemplateRef<unknown>>('menu');
  submenu = viewChild<TemplateRef<unknown>>('submenu');
}

@Component({
  template: `
    <button [ngpMenuTriggerPlacement]="placement" [ngpMenuTrigger]="menu" data-testid="trigger">
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
class TestMenuPlacementComponent {
  placement: 'bottom' | 'top' | 'left' | 'right' | 'bottom-start' | 'right-start' = 'bottom-start';
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button
          [ngpSubmenuTriggerDisabled]="disabled"
          [ngpSubmenuTrigger]="submenu"
          ngpMenuItem
          data-testid="submenu-trigger"
        >
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item">Submenu Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestDisabledSubmenuComponent {
  disabled = false;
}

@Component({
  template: `
    <button
      [ngpMenuTriggerDisabled]="triggerDisabled"
      [ngpMenuTrigger]="menu"
      data-testid="trigger"
    >
      Open Menu
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="item-1">Item 1</button>
        <button [ngpMenuItemDisabled]="true" ngpMenuItem data-testid="item-disabled">
          Disabled Item
        </button>
        <button ngpMenuItem data-testid="item-3">Item 3</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class TestMenuWithDisabledItemsComponent {
  triggerDisabled = false;
}

@Component({
  template: `
    <div data-testid="outside-element" tabindex="0">Outside</div>
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="item-1">Item 1</button>
        <button ngpMenuItem data-testid="item-2">Item 2</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class TestMenuFocusTrapComponent {}

describe('NgpMenu', () => {
  describe('Focus Trap (WAI-ARIA compliance)', () => {
    // Per WAI-ARIA guidelines, menus should always trap focus (Tab cannot leave menu).
    // The focus trap is always enabled, regardless of how the menu was opened.

    it('should have data-focus-trap attribute when opened via mouse click', async () => {
      const { fixture } = await render(TestMenuFocusTrapComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      // Open menu via mouse click (detail > 0 indicates mouse)
      fireEvent.click(trigger, { detail: 1 });
      fixture.detectChanges();

      await waitFor(() => {
        expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
        expect(document.querySelector('[data-testid="menu"]')).toHaveAttribute('data-focus-trap');
      });
    });

    it('should have data-focus-trap attribute when opened via keyboard', async () => {
      const { fixture } = await render(TestMenuFocusTrapComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      // Open menu via keyboard (detail === 0 indicates keyboard)
      fireEvent.click(trigger, { detail: 0 });
      fixture.detectChanges();

      await waitFor(() => {
        expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
        expect(document.querySelector('[data-testid="menu"]')).toHaveAttribute('data-focus-trap');
      });
    });

    it('should have tabindex="-1" on menu for focus management', async () => {
      const { fixture } = await render(TestMenuFocusTrapComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      fireEvent.click(trigger);
      fixture.detectChanges();

      await waitFor(() =>
        expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument(),
      );
      const menu = document.querySelector('[data-testid="menu"]');
      // tabindex="-1" allows the focus trap to programmatically focus the container
      expect(menu).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Basic Rendering', () => {
    it('should render menu with role="menu"', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      fireEvent.click(trigger);
      fixture.detectChanges();

      await waitFor(() =>
        expect(document.querySelector('[data-testid="root-menu"]')).toBeInTheDocument(),
      );
      const menu = document.querySelector('[data-testid="root-menu"]');
      expect(menu).toHaveAttribute('role', 'menu');
    });

    it('should have data-overlay attribute on menu', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      fireEvent.click(trigger);
      fixture.detectChanges();

      await waitFor(() =>
        expect(document.querySelector('[data-testid="root-menu"]')).toBeInTheDocument(),
      );
      const menu = document.querySelector('[data-testid="root-menu"]');
      expect(menu).toHaveAttribute('data-overlay');
    });
  });

  describe('keyboard navigation', () => {
    it('should NOT close menu on ArrowUp for bottom-placed menu', async () => {
      const { fixture } = await render(TestMenuPlacementComponent);
      fixture.componentInstance.placement = 'bottom-start';
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      // Open menu via click
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Get menu and press ArrowUp
      await waitFor(() => {
        expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });
      const menu = document.querySelector('[data-testid="menu"]');

      fireEvent.keyDown(menu!, { key: 'ArrowUp' });
      fixture.detectChanges();

      // Menu should still be open (ArrowUp is for roving focus, not closing)
      expect(trigger).toHaveAttribute('data-open');
    });

    it('should NOT close menu on ArrowDown for top-placed menu', async () => {
      const { fixture } = await render(TestMenuPlacementComponent);
      fixture.componentInstance.placement = 'top';
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      // Open menu via click
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Get menu and press ArrowDown
      await waitFor(() => {
        expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });
      const menu = document.querySelector('[data-testid="menu"]');

      fireEvent.keyDown(menu!, { key: 'ArrowDown' });
      fixture.detectChanges();

      // Menu should still be open (ArrowDown is for roving focus, not closing)
      expect(trigger).toHaveAttribute('data-open');
    });

    it('should close menu on Escape', async () => {
      const { fixture } = await render(TestMenuPlacementComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      // Open menu via click
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Get menu and press Escape
      await waitFor(() => {
        expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });
      const menu = document.querySelector('[data-testid="menu"]');

      fireEvent.keyDown(menu!, { key: 'Escape' });
      fixture.detectChanges();

      // Menu should be closed
      await waitFor(() => expect(trigger).not.toHaveAttribute('data-open'));
    });
  });

  describe('closeAllMenus', () => {
    it('should close all nested menus when submenu item is clicked', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via click
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Open submenu via click on the submenu trigger
      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');

      fireEvent.click(submenuTrigger!);
      fixture.detectChanges();

      // Verify submenu is open
      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
        expect(submenuTrigger).toHaveAttribute('data-open');
      });

      // Click on a submenu item (should trigger closeAllMenus)
      const submenuItem = document.querySelector('[data-testid="submenu-item-1"]');
      expect(submenuItem).toBeInTheDocument();

      fireEvent.click(submenuItem!);
      fixture.detectChanges();

      // Root trigger should no longer have data-open attribute
      await waitFor(() => {
        expect(trigger).not.toHaveAttribute('data-open');
        // Menu content should no longer be in the DOM
        expect(document.querySelector('[data-testid="root-menu"]')).not.toBeInTheDocument();
        expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
      });
    });

    it('should close both menu and submenu when clicking outside with submenu open', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via click
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Open submenu via click on the submenu trigger
      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');

      fireEvent.click(submenuTrigger!);
      fixture.detectChanges();

      // Verify submenu is open
      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
        expect(submenuTrigger).toHaveAttribute('data-open');
      });

      // Click outside the entire menu tree (on document body)
      fireEvent.mouseUp(document.body);
      fixture.detectChanges();

      // Both root menu and submenu should be closed
      await waitFor(() => {
        expect(trigger).not.toHaveAttribute('data-open');
        expect(document.querySelector('[data-testid="root-menu"]')).not.toBeInTheDocument();
        expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
      });
    });

    it('should close all menus when Escape is pressed in submenu', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via click
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Open submenu via click
      await waitFor(() =>
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
      );
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      fireEvent.click(submenuTrigger!);
      fixture.detectChanges();

      // Verify submenu is open
      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
        expect(submenuTrigger).toHaveAttribute('data-open');
      });
      const submenu = document.querySelector('[data-testid="submenu"]');

      fireEvent.keyDown(submenu!, { key: 'Escape' });
      fixture.detectChanges();

      // All menus should be closed
      await waitFor(() => expect(trigger).not.toHaveAttribute('data-open'));
    });

    it('should restore focus to root trigger when Escape is pressed in submenu (keyboard opened)', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via keyboard (detail === 0)
      fireEvent.click(trigger, { detail: 0 });
      fixture.detectChanges();

      // Navigate to submenu trigger and open via keyboard
      await waitFor(() =>
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
      );
      const submenuTrigger = document.querySelector(
        '[data-testid="submenu-trigger"]',
      ) as HTMLElement;
      submenuTrigger.focus();
      fireEvent.keyDown(submenuTrigger, { key: 'ArrowRight' });
      fixture.detectChanges();

      // Verify submenu is open
      await waitFor(() => {
        expect(submenuTrigger).toHaveAttribute('data-open');
        expect(document.querySelector('[data-testid="submenu-item-1"]')).toBeInTheDocument();
      });

      // Focus a submenu item
      const submenuItem = document.querySelector('[data-testid="submenu-item-1"]') as HTMLElement;
      submenuItem.focus();

      // Press Escape
      fireEvent.keyDown(submenuItem, { key: 'Escape' });
      fixture.detectChanges();

      // All menus should be closed
      await waitFor(() => expect(trigger).not.toHaveAttribute('data-open'));

      // Focus should be restored to the root trigger
      expect(document.activeElement).toBe(trigger);
    });

    it('should restore focus to root trigger when Enter is pressed on submenu item (keyboard opened)', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via keyboard (detail === 0)
      fireEvent.click(trigger, { detail: 0 });
      fixture.detectChanges();

      // Navigate to submenu trigger and open via keyboard
      await waitFor(() =>
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
      );
      const submenuTrigger = document.querySelector(
        '[data-testid="submenu-trigger"]',
      ) as HTMLElement;
      submenuTrigger.focus();
      fireEvent.keyDown(submenuTrigger, { key: 'ArrowRight' });
      fixture.detectChanges();

      // Verify submenu is open
      await waitFor(() => {
        expect(submenuTrigger).toHaveAttribute('data-open');
        expect(document.querySelector('[data-testid="submenu-item-1"]')).toBeInTheDocument();
      });

      // Click submenu item with keyboard (detail === 0)
      const submenuItem = document.querySelector('[data-testid="submenu-item-1"]') as HTMLElement;
      submenuItem.focus();
      fireEvent.click(submenuItem, { detail: 0 });
      fixture.detectChanges();

      // All menus should be closed
      await waitFor(() => expect(trigger).not.toHaveAttribute('data-open'));

      // Focus should be restored to the root trigger
      expect(document.activeElement).toBe(trigger);
    });
  });
});

describe('NgpMenuTrigger', () => {
  describe('ARIA attributes', () => {
    it('should have aria-haspopup="true"', async () => {
      const { fixture } = await render(TestMenuWithDisabledItemsComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    });

    it('should have aria-expanded="false" when menu is closed', async () => {
      const { fixture } = await render(TestMenuWithDisabledItemsComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-expanded="true" when menu is open', async () => {
      const { fixture } = await render(TestMenuWithDisabledItemsComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      fireEvent.click(trigger);
      fixture.detectChanges();

      await waitFor(() => {
        expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('toggle behavior', () => {
    it('should open menu on first click', async () => {
      const { fixture } = await render(TestMenuWithDisabledItemsComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      expect(trigger).not.toHaveAttribute('data-open');

      fireEvent.click(trigger);
      fixture.detectChanges();

      await waitFor(() => {
        expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });
    });

    it('should close menu on second click', async () => {
      const { fixture } = await render(TestMenuWithDisabledItemsComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      // Open menu
      fireEvent.click(trigger);
      fixture.detectChanges();

      await waitFor(() => {
        expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });

      // Close menu
      fireEvent.click(trigger);
      fixture.detectChanges();

      await waitFor(() => {
        expect(trigger).not.toHaveAttribute('data-open');
        expect(document.querySelector('[data-testid="menu"]')).not.toBeInTheDocument();
      });
    });
  });

  describe('disabled state', () => {
    it('should not open menu when trigger is disabled', async () => {
      const { fixture } = await render(TestMenuWithDisabledItemsComponent);
      fixture.componentInstance.triggerDisabled = true;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      fireEvent.click(trigger);
      fixture.detectChanges();

      expect(trigger).not.toHaveAttribute('data-open');
      expect(document.querySelector('[data-testid="menu"]')).not.toBeInTheDocument();
    });
  });

  describe('hover behavior with pointer tracking', () => {
    it('should reset pointer tracking state when menu closes via item click', async () => {
      @Component({
        template: `
          <button
            [ngpMenuTrigger]="menu"
            [ngpMenuTriggerOpenTriggers]="['hover']"
            data-testid="trigger"
          >
            Hover Menu
          </button>

          <ng-template #menu>
            <div ngpMenu data-testid="menu">
              <button ngpMenuItem data-testid="item-1">Item 1</button>
            </div>
          </ng-template>
        `,
        imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
      })
      class TestHoverMenuComponent {}

      const { fixture } = await render(TestHoverMenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      // Step 1: Open menu via hover
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      fixture.detectChanges();

      // Step 2: Move pointer into menu content
      await waitFor(() => {
        expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });
      const menu = document.querySelector('[data-testid="menu"]');
      fireEvent.pointerEnter(menu!);
      fixture.detectChanges();

      // Step 3: Click menu item (closes menu)
      const menuItem = document.querySelector('[data-testid="item-1"]');
      fireEvent.click(menuItem!);
      fixture.detectChanges();
      await waitFor(() => expect(trigger).not.toHaveAttribute('data-open'));

      // Step 4: Hover over trigger again
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      fixture.detectChanges();

      // Step 5: Move pointer away from trigger
      await waitFor(() => {
        expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });
      fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });
      fixture.detectChanges();

      // Step 6: Menu should close
      await waitFor(() => {
        expect(trigger).not.toHaveAttribute('data-open');
        expect(document.querySelector('[data-testid="menu"]')).not.toBeInTheDocument();
      });
    });
  });
});

describe('NgpMenuItem disabled state', () => {
  it('should have data-disabled attribute when disabled', async () => {
    const { fixture } = await render(TestMenuWithDisabledItemsComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

    fireEvent.click(trigger);
    fixture.detectChanges();

    await waitFor(() => {
      expect(document.querySelector('[data-testid="item-disabled"]')).toBeInTheDocument();
      expect(document.querySelector('[data-testid="item-disabled"]')).toHaveAttribute(
        'data-disabled',
      );
    });
  });
});

describe('NgpSubmenuTrigger', () => {
  describe('ARIA attributes', () => {
    it('should have aria-haspopup attribute', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      fixture.detectChanges();

      await waitFor(() =>
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
      );
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      expect(submenuTrigger).toHaveAttribute('aria-haspopup', 'true');
    });

    it('should have aria-expanded="false" when closed', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      fixture.detectChanges();

      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toHaveAttribute(
          'aria-expanded',
          'false',
        );
      });
    });

    it('should have aria-expanded="true" when open', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Click submenu trigger to open submenu
      await waitFor(() =>
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
      );
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      fireEvent.click(submenuTrigger!);
      fixture.detectChanges();

      await waitFor(() => {
        expect(submenuTrigger).toHaveAttribute('aria-expanded', 'true');
        expect(submenuTrigger).toHaveAttribute('data-open');
      });
    });
  });

  describe('Left Arrow navigation', () => {
    it('should close submenu and focus the submenu trigger on Left Arrow', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via click
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Focus submenu trigger and open submenu via keyboard
      await waitFor(() =>
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
      );
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      (submenuTrigger as HTMLElement).focus();
      fireEvent.keyDown(submenuTrigger!, { key: 'ArrowRight' });
      fixture.detectChanges();

      // Verify submenu is open
      await waitFor(() => {
        expect(submenuTrigger).toHaveAttribute('data-open');
        expect(document.querySelector('[data-testid="submenu-item-1"]')).toBeInTheDocument();
      });

      // Focus a submenu item
      const submenuItem = document.querySelector('[data-testid="submenu-item-1"]');
      (submenuItem as HTMLElement).focus();

      // Press Left Arrow - should close submenu and focus submenu trigger
      fireEvent.keyDown(submenuItem!, { key: 'ArrowLeft' });
      fixture.detectChanges();

      // Submenu should be closed
      await waitFor(() => expect(submenuTrigger).not.toHaveAttribute('data-open'));

      // Focus should be on submenu trigger (not root trigger)
      expect(document.activeElement).toBe(submenuTrigger);
    });
  });

  describe('disabled state', () => {
    it('should not open submenu when disabled via click', async () => {
      const { fixture } = await render(TestDisabledSubmenuComponent);
      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Try to click disabled submenu trigger
      await waitFor(() =>
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
      );
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      fireEvent.click(submenuTrigger!);
      fixture.detectChanges();

      // Submenu should NOT be open
      expect(submenuTrigger).not.toHaveAttribute('data-open');
    });
  });

  describe('click behavior', () => {
    it('should toggle submenu on click', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Click submenu trigger to open
      await waitFor(() =>
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
      );
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      fireEvent.click(submenuTrigger!);
      fixture.detectChanges();

      await waitFor(() => expect(submenuTrigger).toHaveAttribute('data-open'));

      // Click again to close
      fireEvent.click(submenuTrigger!);
      fixture.detectChanges();

      await waitFor(() => expect(submenuTrigger).not.toHaveAttribute('data-open'));
    });
  });
});

describe('NgpMenuItem', () => {
  describe('closeAllMenus on selection', () => {
    it('should call closeAllMenus when item is clicked', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Click a menu item
      await waitFor(() => {
        expect(document.querySelector('[data-testid="item-1"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });
      const menuItem = document.querySelector('[data-testid="item-1"]');
      fireEvent.click(menuItem!);
      fixture.detectChanges();

      // Menu should be closed
      await waitFor(() => expect(trigger).not.toHaveAttribute('data-open'));
    });

    it('should NOT call closeAllMenus when item is a submenu trigger', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Click submenu trigger (should open submenu, not close all menus)
      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      fireEvent.click(submenuTrigger!);
      fixture.detectChanges();

      // Root menu should still be open, submenu should be open
      await waitFor(() => {
        expect(trigger).toHaveAttribute('data-open');
        expect(submenuTrigger).toHaveAttribute('data-open');
      });
    });
  });

  describe('Left Arrow navigation in submenu', () => {
    it('should hide parent submenu trigger on Left Arrow', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via click
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Open submenu via keyboard
      await waitFor(() =>
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
      );
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      (submenuTrigger as HTMLElement).focus();
      fireEvent.keyDown(submenuTrigger!, { key: 'ArrowRight' });
      fixture.detectChanges();

      await waitFor(() => {
        expect(submenuTrigger).toHaveAttribute('data-open');
        expect(document.querySelector('[data-testid="submenu-item-1"]')).toBeInTheDocument();
      });

      // Press Left Arrow on submenu item
      const submenuItem = document.querySelector('[data-testid="submenu-item-1"]');
      (submenuItem as HTMLElement).focus();
      fireEvent.keyDown(submenuItem!, { key: 'ArrowLeft' });
      fixture.detectChanges();

      // Submenu should be closed, but root menu should still be open
      await waitFor(() => expect(submenuTrigger).not.toHaveAttribute('data-open'));
      expect(trigger).toHaveAttribute('data-open');
    });

    it('should focus parent submenu trigger after hiding', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via click
      fireEvent.click(trigger);
      fixture.detectChanges();

      // Open submenu via keyboard
      await waitFor(() =>
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
      );
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      (submenuTrigger as HTMLElement).focus();
      fireEvent.keyDown(submenuTrigger!, { key: 'ArrowRight' });
      fixture.detectChanges();

      await waitFor(() => {
        expect(submenuTrigger).toHaveAttribute('data-open');
        expect(document.querySelector('[data-testid="submenu-item-1"]')).toBeInTheDocument();
      });

      // Press Left Arrow on submenu item
      const submenuItem = document.querySelector('[data-testid="submenu-item-1"]');
      (submenuItem as HTMLElement).focus();
      fireEvent.keyDown(submenuItem!, { key: 'ArrowLeft' });
      fixture.detectChanges();

      // Focus should be on the submenu trigger
      expect(document.activeElement).toBe(submenuTrigger);
    });
  });

  describe('role attribute', () => {
    it('should have role="menuitem"', async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      fireEvent.click(trigger);
      fixture.detectChanges();

      await waitFor(() =>
        expect(document.querySelector('[data-testid="item-1"]')).toBeInTheDocument(),
      );
      const menuItem = document.querySelector('[data-testid="item-1"]');
      expect(menuItem).toHaveAttribute('role', 'menuitem');
    });
  });
});

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
        <button [ngpMenuItemCloseOnSelect]="false" ngpMenuItem data-testid="submenu-no-close-item">
          Stay Open Item
        </button>
        <button ngpMenuItem data-testid="submenu-regular-item">Regular Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestSubmenuCloseOnSelectComponent {
  menu = viewChild<TemplateRef<unknown>>('menu');
  submenu = viewChild<TemplateRef<unknown>>('submenu');
}

describe('NgpMenuItem closeOnSelect in submenu', () => {
  async function openSubmenu(fixture: any) {
    const rootTrigger = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="root-trigger"]',
    );
    fireEvent.click(rootTrigger);
    fixture.detectChanges();

    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument(),
    );

    const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
    fireEvent.click(submenuTrigger!);
    fixture.detectChanges();

    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument(),
    );

    return rootTrigger;
  }

  it('should NOT close menus when clicking item with closeOnSelect=false (mouse)', async () => {
    const { fixture } = await render(TestSubmenuCloseOnSelectComponent);
    const rootTrigger = await openSubmenu(fixture);

    const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
    const item = document.querySelector('[data-testid="submenu-no-close-item"]');

    // Simulate real browser click: mouseup then click
    fireEvent.mouseUp(item!);
    fireEvent.click(item!);
    fixture.detectChanges();

    // Both menus should remain open
    expect(rootTrigger).toHaveAttribute('data-open');
    expect(submenuTrigger).toHaveAttribute('data-open');
    expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
  });

  it('should NOT close menus when activating item with closeOnSelect=false via keyboard', async () => {
    const { fixture } = await render(TestSubmenuCloseOnSelectComponent);
    const rootTrigger = await openSubmenu(fixture);

    const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
    const item = document.querySelector('[data-testid="submenu-no-close-item"]') as HTMLElement;
    item.focus();

    // Enter key fires click with detail === 0
    fireEvent.click(item, { detail: 0 });
    fixture.detectChanges();

    // Both menus should remain open
    expect(rootTrigger).toHaveAttribute('data-open');
    expect(submenuTrigger).toHaveAttribute('data-open');
    expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
  });

  it('should close all menus when clicking regular item in same submenu', async () => {
    const { fixture } = await render(TestSubmenuCloseOnSelectComponent);
    const rootTrigger = await openSubmenu(fixture);

    const regularItem = document.querySelector('[data-testid="submenu-regular-item"]');

    fireEvent.mouseUp(regularItem!);
    fireEvent.click(regularItem!);
    fixture.detectChanges();

    // All menus should be closed (async)
    await waitFor(() => {
      expect(rootTrigger).not.toHaveAttribute('data-open');
      expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
    });
  });

  it('should still close all menus on Escape even with closeOnSelect=false items', async () => {
    const { fixture } = await render(TestSubmenuCloseOnSelectComponent);
    const rootTrigger = await openSubmenu(fixture);

    const submenu = document.querySelector('[data-testid="submenu"]');
    fireEvent.keyDown(submenu!, { key: 'Escape' });
    fixture.detectChanges();

    // All menus should be closed (async)
    await waitFor(() => {
      expect(rootTrigger).not.toHaveAttribute('data-open');
      expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
    });
  });
});
