import { Component, TemplateRef, viewChild } from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
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
        <button ngpMenuItem [ngpSubmenuTrigger]="submenu" data-testid="submenu-trigger">
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
    <button
      [ngpMenuTriggerPlacement]="placement"
      [ngpMenuTrigger]="menu"
      data-testid="trigger"
    >
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
          ngpMenuItem
          [ngpSubmenuTrigger]="submenu"
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
    <div data-testid="outside-element">Outside</div>
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
class TestMenuWithOutsideElementComponent {}

describe('NgpMenu', () => {
  describe('Basic Rendering', () => {
    it('should render menu with role="menu"', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      const menu = document.querySelector('[data-testid="root-menu"]');
      expect(menu).toHaveAttribute('role', 'menu');
    }));

    it('should have data-overlay attribute on menu', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      const menu = document.querySelector('[data-testid="root-menu"]');
      expect(menu).toHaveAttribute('data-overlay');
    }));
  });

  describe('keyboard navigation', () => {
    it('should NOT close menu on ArrowUp for bottom-placed menu', fakeAsync(async () => {
      const { fixture } = await render(TestMenuPlacementComponent);
      fixture.componentInstance.placement = 'bottom-start';
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      // Open menu via click
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Get menu and press ArrowUp
      const menu = document.querySelector('[data-testid="menu"]');
      expect(menu).toBeInTheDocument();

      fireEvent.keyDown(menu!, { key: 'ArrowUp' });
      tick();
      fixture.detectChanges();
      flush();

      // Menu should still be open (ArrowUp is for roving focus, not closing)
      expect(trigger).toHaveAttribute('data-open');
    }));

    it('should NOT close menu on ArrowDown for top-placed menu', fakeAsync(async () => {
      const { fixture } = await render(TestMenuPlacementComponent);
      fixture.componentInstance.placement = 'top';
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      // Open menu via click
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Get menu and press ArrowDown
      const menu = document.querySelector('[data-testid="menu"]');
      expect(menu).toBeInTheDocument();

      fireEvent.keyDown(menu!, { key: 'ArrowDown' });
      tick();
      fixture.detectChanges();
      flush();

      // Menu should still be open (ArrowDown is for roving focus, not closing)
      expect(trigger).toHaveAttribute('data-open');
    }));

    it('should close menu on Escape', fakeAsync(async () => {
      const { fixture } = await render(TestMenuPlacementComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      // Open menu via click
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Get menu and press Escape
      const menu = document.querySelector('[data-testid="menu"]');
      expect(menu).toBeInTheDocument();

      fireEvent.keyDown(menu!, { key: 'Escape' });
      tick();
      fixture.detectChanges();
      flush();

      // Menu should be closed
      expect(trigger).not.toHaveAttribute('data-open');
    }));
  });

  describe('closeAllMenus', () => {
    it('should close all nested menus when submenu item is clicked', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via click
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Open submenu via click on the submenu trigger
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      expect(submenuTrigger).toBeInTheDocument();

      fireEvent.click(submenuTrigger!);
      tick();
      fixture.detectChanges();
      flush();

      // Verify submenu is open
      expect(submenuTrigger).toHaveAttribute('data-open');
      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();

      // Click on a submenu item (should trigger closeAllMenus)
      const submenuItem = document.querySelector('[data-testid="submenu-item-1"]');
      expect(submenuItem).toBeInTheDocument();

      fireEvent.click(submenuItem!);
      tick();
      fixture.detectChanges();
      flush();

      // Root trigger should no longer have data-open attribute
      expect(trigger).not.toHaveAttribute('data-open');
      // Menu content should no longer be in the DOM
      expect(document.querySelector('[data-testid="root-menu"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
    }));

    it('should close all menus when Escape is pressed in submenu', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via click
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      // Open submenu via click
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      fireEvent.click(submenuTrigger!);
      tick();
      fixture.detectChanges();
      flush();

      // Verify submenu is open
      expect(submenuTrigger).toHaveAttribute('data-open');

      // Press Escape in submenu
      const submenu = document.querySelector('[data-testid="submenu"]');
      expect(submenu).toBeInTheDocument();

      fireEvent.keyDown(submenu!, { key: 'Escape' });
      tick();
      fixture.detectChanges();
      flush();

      // All menus should be closed
      expect(trigger).not.toHaveAttribute('data-open');
    }));
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

    it('should have aria-expanded="true" when menu is open', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithDisabledItemsComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    }));
  });

  describe('toggle behavior', () => {
    it('should open menu on first click', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithDisabledItemsComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      expect(trigger).not.toHaveAttribute('data-open');

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');
      expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
    }));

    it('should close menu on second click', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithDisabledItemsComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      // Open menu
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Close menu
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).not.toHaveAttribute('data-open');
      expect(document.querySelector('[data-testid="menu"]')).not.toBeInTheDocument();
    }));
  });

  describe('disabled state', () => {
    it('should not open menu when trigger is disabled', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithDisabledItemsComponent);
      fixture.componentInstance.triggerDisabled = true;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).not.toHaveAttribute('data-open');
      expect(document.querySelector('[data-testid="menu"]')).not.toBeInTheDocument();
    }));
  });
});

describe('NgpMenuItem disabled state', () => {
  it('should have data-disabled attribute when disabled', fakeAsync(async () => {
    const { fixture } = await render(TestMenuWithDisabledItemsComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

    fireEvent.click(trigger);
    tick();
    fixture.detectChanges();
    flush();

    const disabledItem = document.querySelector('[data-testid="item-disabled"]');
    expect(disabledItem).toHaveAttribute('data-disabled');
  }));
});

describe('NgpSubmenuTrigger', () => {
  describe('ARIA attributes', () => {
    it('should have aria-haspopup attribute', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      expect(submenuTrigger).toHaveAttribute('aria-haspopup', 'true');
    }));

    it('should have aria-expanded="false" when closed', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      expect(submenuTrigger).toHaveAttribute('aria-expanded', 'false');
    }));

    it('should have aria-expanded="true" when open', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      // Click submenu trigger to open submenu
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      fireEvent.click(submenuTrigger!);
      tick();
      fixture.detectChanges();
      flush();

      expect(submenuTrigger).toHaveAttribute('aria-expanded', 'true');
      expect(submenuTrigger).toHaveAttribute('data-open');
    }));
  });

  describe('Left Arrow navigation', () => {
    it('should close submenu and focus the submenu trigger on Left Arrow', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via click
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      // Focus submenu trigger and open submenu via keyboard
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      (submenuTrigger as HTMLElement).focus();
      fireEvent.keyDown(submenuTrigger!, { key: 'ArrowRight' });
      tick();
      fixture.detectChanges();
      flush();

      // Verify submenu is open
      expect(submenuTrigger).toHaveAttribute('data-open');

      // Focus a submenu item
      const submenuItem = document.querySelector('[data-testid="submenu-item-1"]');
      (submenuItem as HTMLElement).focus();

      // Press Left Arrow - should close submenu and focus submenu trigger
      fireEvent.keyDown(submenuItem!, { key: 'ArrowLeft' });
      tick();
      fixture.detectChanges();
      flush();

      // Submenu should be closed
      expect(submenuTrigger).not.toHaveAttribute('data-open');

      // Focus should be on submenu trigger (not root trigger)
      expect(document.activeElement).toBe(submenuTrigger);
    }));
  });

  describe('disabled state', () => {
    it('should not open submenu when disabled via click', fakeAsync(async () => {
      const { fixture } = await render(TestDisabledSubmenuComponent);
      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      // Try to click disabled submenu trigger
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      fireEvent.click(submenuTrigger!);
      tick();
      fixture.detectChanges();
      flush();

      // Submenu should NOT be open
      expect(submenuTrigger).not.toHaveAttribute('data-open');
    }));
  });

  describe('click behavior', () => {
    it('should toggle submenu on click', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      // Click submenu trigger to open
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      fireEvent.click(submenuTrigger!);
      tick();
      fixture.detectChanges();
      flush();

      expect(submenuTrigger).toHaveAttribute('data-open');

      // Click again to close
      fireEvent.click(submenuTrigger!);
      tick();
      fixture.detectChanges();
      flush();

      expect(submenuTrigger).not.toHaveAttribute('data-open');
    }));
  });
});

describe('NgpMenuItem', () => {
  describe('closeAllMenus on selection', () => {
    it('should call closeAllMenus when item is clicked', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Click a menu item
      const menuItem = document.querySelector('[data-testid="item-1"]');
      fireEvent.click(menuItem!);
      tick();
      fixture.detectChanges();
      flush();

      // Menu should be closed
      expect(trigger).not.toHaveAttribute('data-open');
    }));

    it('should NOT call closeAllMenus when item is a submenu trigger', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      expect(trigger).toHaveAttribute('data-open');

      // Click submenu trigger (should open submenu, not close all menus)
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      fireEvent.click(submenuTrigger!);
      tick();
      fixture.detectChanges();
      flush();

      // Root menu should still be open
      expect(trigger).toHaveAttribute('data-open');
      // Submenu should be open
      expect(submenuTrigger).toHaveAttribute('data-open');
    }));
  });

  describe('Left Arrow navigation in submenu', () => {
    it('should hide parent submenu trigger on Left Arrow', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via click
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      // Open submenu via keyboard
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      (submenuTrigger as HTMLElement).focus();
      fireEvent.keyDown(submenuTrigger!, { key: 'ArrowRight' });
      tick();
      fixture.detectChanges();
      flush();

      expect(submenuTrigger).toHaveAttribute('data-open');

      // Press Left Arrow on submenu item
      const submenuItem = document.querySelector('[data-testid="submenu-item-1"]');
      (submenuItem as HTMLElement).focus();
      fireEvent.keyDown(submenuItem!, { key: 'ArrowLeft' });
      tick();
      fixture.detectChanges();
      flush();

      // Submenu should be closed, but root menu should still be open
      expect(submenuTrigger).not.toHaveAttribute('data-open');
      expect(trigger).toHaveAttribute('data-open');
    }));

    it('should focus parent submenu trigger after hiding', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu via click
      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      // Open submenu via keyboard
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
      (submenuTrigger as HTMLElement).focus();
      fireEvent.keyDown(submenuTrigger!, { key: 'ArrowRight' });
      tick();
      fixture.detectChanges();
      flush();

      // Press Left Arrow on submenu item
      const submenuItem = document.querySelector('[data-testid="submenu-item-1"]');
      (submenuItem as HTMLElement).focus();
      fireEvent.keyDown(submenuItem!, { key: 'ArrowLeft' });
      tick();
      fixture.detectChanges();
      flush();

      // Focus should be on the submenu trigger
      expect(document.activeElement).toBe(submenuTrigger);
    }));
  });

  describe('role attribute', () => {
    it('should have role="menuitem"', fakeAsync(async () => {
      const { fixture } = await render(TestMenuWithSubmenuComponent);
      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      fireEvent.click(trigger);
      tick();
      fixture.detectChanges();
      flush();

      const menuItem = document.querySelector('[data-testid="item-1"]');
      expect(menuItem).toHaveAttribute('role', 'menuitem');
    }));
  });
});
