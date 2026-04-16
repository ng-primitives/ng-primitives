import { Component } from '@angular/core';
import { fakeAsync, flush } from '@angular/core/testing';
import { fireEvent, render, screen } from '@testing-library/angular';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuItemCheckbox,
  NgpContextMenuItemIndicator,
  NgpContextMenuItemRadio,
  NgpContextMenuItemRadioGroup,
  NgpContextMenuSubmenuTrigger,
  NgpContextMenuTrigger,
} from '../index';

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">Right-click me</div>
    <ng-template #menu>
      <div ngpContextMenu data-testid="context-menu">
        <button
          [ngpContextMenuItemCheckboxChecked]="checked"
          (ngpContextMenuItemCheckboxCheckedChange)="checked = $event"
          ngpContextMenuItemCheckbox
          data-testid="checkbox-item"
        >
          <span ngpContextMenuItemIndicator data-testid="checkbox-indicator"></span>
          Bold
        </button>
        <button ngpContextMenuItem data-testid="regular-item">Regular</button>
      </div>
    </ng-template>
  `,
  imports: [
    NgpContextMenuTrigger,
    NgpContextMenu,
    NgpContextMenuItem,
    NgpContextMenuItemCheckbox,
    NgpContextMenuItemIndicator,
  ],
})
class ContextMenuCheckboxComponent {
  checked = false;
}

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">Right-click me</div>
    <ng-template #menu>
      <div ngpContextMenu data-testid="context-menu">
        <div
          [ngpContextMenuItemRadioGroup]
          [ngpContextMenuItemRadioGroupValue]="theme"
          (ngpContextMenuItemRadioGroupValueChange)="theme = $event"
          data-testid="radio-group"
        >
          <button
            ngpContextMenuItemRadio
            ngpContextMenuItemRadioValue="light"
            data-testid="radio-light"
          >
            <span ngpContextMenuItemIndicator data-testid="indicator-light"></span>
            Light
          </button>
          <button
            ngpContextMenuItemRadio
            ngpContextMenuItemRadioValue="dark"
            data-testid="radio-dark"
          >
            <span ngpContextMenuItemIndicator data-testid="indicator-dark"></span>
            Dark
          </button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [
    NgpContextMenuTrigger,
    NgpContextMenu,
    NgpContextMenuItemRadio,
    NgpContextMenuItemRadioGroup,
    NgpContextMenuItemIndicator,
  ],
})
class ContextMenuRadioComponent {
  theme = 'light';
}

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">Right-click me</div>
    <ng-template #menu>
      <div ngpContextMenu data-testid="context-menu">
        <button ngpContextMenuItem data-testid="item-1">Item 1</button>
        <button ngpContextMenuItem ngpContextMenuItemDisabled data-testid="item-disabled">
          Disabled
        </button>
        <button ngpContextMenuItem data-testid="item-3">Item 3</button>
      </div>
    </ng-template>
  `,
  imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
})
class ContextMenuDisabledItemsComponent {}

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">Right-click me</div>
    <ng-template #menu>
      <div ngpContextMenu data-testid="context-menu">
        <button ngpContextMenuItem data-testid="item-cut">Cut</button>
        <button [ngpContextMenuSubmenuTrigger]="submenu" ngpContextMenuItem data-testid="more-item">
          More
        </button>
      </div>
    </ng-template>
    <ng-template #submenu>
      <div ngpContextMenu data-testid="submenu">
        <button ngpContextMenuItem data-testid="submenu-item-a">Option A</button>
        <button ngpContextMenuItem data-testid="submenu-item-b">Option B</button>
      </div>
    </ng-template>
  `,
  imports: [
    NgpContextMenuTrigger,
    NgpContextMenu,
    NgpContextMenuItem,
    NgpContextMenuSubmenuTrigger,
  ],
})
class ContextMenuWithSubmenuComponent {}

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">Right-click me</div>
    <ng-template #menu>
      <div ngpContextMenu data-testid="context-menu">
        <button
          [ngpContextMenuItemCheckboxChecked]="checked"
          (ngpContextMenuItemCheckboxCheckedChange)="checked = $event"
          ngpContextMenuItemCheckbox
          ngpContextMenuItemCheckboxDisabled
          data-testid="checkbox-disabled"
        >
          <span ngpContextMenuItemIndicator data-testid="checkbox-disabled-indicator"></span>
          Disabled Checkbox
        </button>
      </div>
    </ng-template>
  `,
  imports: [
    NgpContextMenuTrigger,
    NgpContextMenu,
    NgpContextMenuItemCheckbox,
    NgpContextMenuItemIndicator,
  ],
})
class ContextMenuDisabledCheckboxComponent {
  checked = false;
}

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">Right-click me</div>
    <ng-template #menu>
      <div ngpContextMenu data-testid="context-menu">
        <div
          [ngpContextMenuItemRadioGroup]
          [ngpContextMenuItemRadioGroupValue]="theme"
          (ngpContextMenuItemRadioGroupValueChange)="theme = $event"
          data-testid="radio-group"
        >
          <button
            ngpContextMenuItemRadio
            ngpContextMenuItemRadioValue="light"
            data-testid="radio-light"
          >
            Light
          </button>
          <button
            ngpContextMenuItemRadio
            ngpContextMenuItemRadioValue="dark"
            ngpContextMenuItemRadioDisabled
            data-testid="radio-disabled"
          >
            Dark
          </button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [
    NgpContextMenuTrigger,
    NgpContextMenu,
    NgpContextMenuItemRadio,
    NgpContextMenuItemRadioGroup,
  ],
})
class ContextMenuDisabledRadioComponent {
  theme = 'light';
}

/** Helper: open context menu on the trigger area and flush */
function openContextMenu() {
  const triggerArea = screen.getByTestId('trigger-area');
  fireEvent.contextMenu(triggerArea);
  flush();
}

describe('NgpContextMenuTrigger', () => {
  it('should open a menu on right-click', fakeAsync(async () => {
    await render(
      `<div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">
        Right-click me
      </div>
      <ng-template #menu>
        <div ngpContextMenu data-testid="context-menu">
          <button ngpContextMenuItem>Cut</button>
          <button ngpContextMenuItem>Copy</button>
          <button ngpContextMenuItem>Paste</button>
        </div>
      </ng-template>`,
      {
        imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
      },
    );

    const triggerArea = screen.getByTestId('trigger-area');
    fireEvent.contextMenu(triggerArea);
    flush();

    expect(screen.getByTestId('context-menu')).toBeInTheDocument();
  }));

  it('should prevent native context menu', fakeAsync(async () => {
    await render(
      `<div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">
        Right-click me
      </div>
      <ng-template #menu>
        <div ngpContextMenu data-testid="context-menu">
          <button ngpContextMenuItem>Cut</button>
        </div>
      </ng-template>`,
      {
        imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
      },
    );

    const triggerArea = screen.getByTestId('trigger-area');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    triggerArea.dispatchEvent(event);
    flush();

    expect(event.defaultPrevented).toBe(true);
  }));

  it('should close menu on Escape', fakeAsync(async () => {
    await render(
      `<div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">
        Right-click me
      </div>
      <ng-template #menu>
        <div ngpContextMenu data-testid="context-menu">
          <button ngpContextMenuItem>Cut</button>
        </div>
      </ng-template>`,
      {
        imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
      },
    );

    const triggerArea = screen.getByTestId('trigger-area');
    fireEvent.contextMenu(triggerArea);
    flush();

    expect(screen.getByTestId('context-menu')).toBeInTheDocument();

    const menuEl = screen.getByTestId('context-menu');
    fireEvent.keyDown(menuEl, { key: 'Escape' });
    flush();

    expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
  }));

  it('should close menu on click outside', fakeAsync(async () => {
    await render(
      `<div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">
        Right-click me
      </div>
      <div data-testid="outside">Outside</div>
      <ng-template #menu>
        <div ngpContextMenu data-testid="context-menu">
          <button ngpContextMenuItem>Cut</button>
        </div>
      </ng-template>`,
      {
        imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
      },
    );

    const triggerArea = screen.getByTestId('trigger-area');
    fireEvent.contextMenu(triggerArea);
    flush();

    expect(screen.getByTestId('context-menu')).toBeInTheDocument();

    // Overlay registry uses mouseup for outside click detection
    fireEvent.mouseUp(document.body);
    flush();

    expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
  }));

  it('should not close menu on right-click mouseup', fakeAsync(async () => {
    await render(
      `<div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">
        Right-click me
      </div>
      <div data-testid="outside">Outside</div>
      <ng-template #menu>
        <div ngpContextMenu data-testid="context-menu">
          <button ngpContextMenuItem>Cut</button>
        </div>
      </ng-template>`,
      {
        imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
      },
    );

    const triggerArea = screen.getByTestId('trigger-area');
    fireEvent.contextMenu(triggerArea);
    flush();

    expect(screen.getByTestId('context-menu')).toBeInTheDocument();

    // Right-click mouseup (button 2) should NOT close the menu
    fireEvent.mouseUp(document.body, { button: 2 });
    flush();

    expect(screen.getByTestId('context-menu')).toBeInTheDocument();
  }));

  it('should not open when disabled', fakeAsync(async () => {
    await render(
      `<div [ngpContextMenuTrigger]="menu" ngpContextMenuTriggerDisabled data-testid="trigger-area">
        Right-click me
      </div>
      <ng-template #menu>
        <div ngpContextMenu data-testid="context-menu">
          <button ngpContextMenuItem>Cut</button>
        </div>
      </ng-template>`,
      {
        imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
      },
    );

    const triggerArea = screen.getByTestId('trigger-area');
    fireEvent.contextMenu(triggerArea);
    flush();

    expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
  }));

  it('should close menu when a menu item is clicked', fakeAsync(async () => {
    await render(
      `<div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">
        Right-click me
      </div>
      <ng-template #menu>
        <div ngpContextMenu data-testid="context-menu">
          <button ngpContextMenuItem data-testid="cut-item">Cut</button>
          <button ngpContextMenuItem>Copy</button>
        </div>
      </ng-template>`,
      {
        imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
      },
    );

    const triggerArea = screen.getByTestId('trigger-area');
    fireEvent.contextMenu(triggerArea);
    flush();

    expect(screen.getByTestId('context-menu')).toBeInTheDocument();

    const cutItem = screen.getByTestId('cut-item');
    fireEvent.click(cutItem);
    flush();

    expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
  }));

  it('should close menu when left-clicking on trigger area', fakeAsync(async () => {
    await render(
      `<div [ngpContextMenuTrigger]="menu" data-testid="trigger-area">
        Right-click me
      </div>
      <ng-template #menu>
        <div ngpContextMenu data-testid="context-menu">
          <button ngpContextMenuItem>Cut</button>
        </div>
      </ng-template>`,
      {
        imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
      },
    );

    const triggerArea = screen.getByTestId('trigger-area');
    fireEvent.contextMenu(triggerArea);
    flush();

    expect(screen.getByTestId('context-menu')).toBeInTheDocument();

    // Left-clicking on the trigger area should dismiss the context menu
    fireEvent.mouseUp(triggerArea);
    flush();

    expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
  }));

  it('should support submenu', fakeAsync(async () => {
    await render(ContextMenuWithSubmenuComponent);

    openContextMenu();

    expect(screen.getByTestId('context-menu')).toBeInTheDocument();

    // Click the submenu trigger to open submenu
    const moreItem = screen.getByTestId('more-item');
    fireEvent.click(moreItem);
    flush();

    expect(screen.getByTestId('submenu')).toBeInTheDocument();
  }));

  describe('ARIA attributes', () => {
    it('should render context menu with role="menu"', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      const menu = document.querySelector('[data-testid="context-menu"]');
      expect(menu).toHaveAttribute('role', 'menu');
    }));

    it('should render menu items with role="menuitem"', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      const item1 = document.querySelector('[data-testid="item-1"]');
      expect(item1).toHaveAttribute('role', 'menuitem');
    }));

    it('should set role="menuitemcheckbox" and aria-checked on checkbox items', fakeAsync(async () => {
      await render(ContextMenuCheckboxComponent);
      openContextMenu();

      const checkbox = document.querySelector('[data-testid="checkbox-item"]');
      expect(checkbox).toHaveAttribute('role', 'menuitemcheckbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    }));

    it('should set role="menuitemradio" and aria-checked on radio items', fakeAsync(async () => {
      await render(ContextMenuRadioComponent);
      openContextMenu();

      const radioLight = document.querySelector('[data-testid="radio-light"]');
      const radioDark = document.querySelector('[data-testid="radio-dark"]');
      expect(radioLight).toHaveAttribute('role', 'menuitemradio');
      expect(radioLight).toHaveAttribute('aria-checked', 'true');
      expect(radioDark).toHaveAttribute('role', 'menuitemradio');
      expect(radioDark).toHaveAttribute('aria-checked', 'false');
    }));

    it('should render radio group with role="group"', fakeAsync(async () => {
      await render(ContextMenuRadioComponent);
      openContextMenu();

      const radioGroup = document.querySelector('[data-testid="radio-group"]');
      expect(radioGroup).toHaveAttribute('role', 'group');
    }));

    it('should have data-focus-trap on context menu', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      const menu = document.querySelector('[data-testid="context-menu"]');
      expect(menu).toHaveAttribute('data-focus-trap');
    }));

    it('should set data-open on trigger when menu is open', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);

      const triggerArea = screen.getByTestId('trigger-area');
      expect(triggerArea).not.toHaveAttribute('data-open');

      openContextMenu();
      expect(triggerArea).toHaveAttribute('data-open');

      const menuEl = document.querySelector('[data-testid="context-menu"]') as HTMLElement;
      fireEvent.keyDown(menuEl, { key: 'Escape' });
      flush();

      expect(triggerArea).not.toHaveAttribute('data-open');
    }));

    it('should set aria-haspopup on submenu trigger', fakeAsync(async () => {
      await render(ContextMenuWithSubmenuComponent);
      openContextMenu();

      const moreItem = document.querySelector('[data-testid="more-item"]');
      expect(moreItem).toHaveAttribute('aria-haspopup', 'true');
    }));

    it('should set aria-expanded on submenu trigger', fakeAsync(async () => {
      await render(ContextMenuWithSubmenuComponent);
      openContextMenu();

      const moreItem = document.querySelector('[data-testid="more-item"]') as HTMLElement;
      expect(moreItem).toHaveAttribute('aria-expanded', 'false');

      fireEvent.keyDown(moreItem, { key: 'ArrowDown' });
      flush();
      fireEvent.keyDown(moreItem, { key: 'ArrowRight' });
      flush();

      expect(moreItem).toHaveAttribute('aria-expanded', 'true');
    }));
  });

  describe('Keyboard navigation', () => {
    it('should focus first menu item when context menu opens', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      const item1 = document.querySelector('[data-testid="item-1"]') as HTMLElement;
      expect(document.activeElement).toBe(item1);
    }));

    it('should move focus down with ArrowDown', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      // Focus should already be on first item from focus trap
      const item1 = document.querySelector('[data-testid="item-1"]') as HTMLElement;
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowDown' });
      flush();

      const item3 = document.querySelector('[data-testid="item-3"]') as HTMLElement;
      expect(document.activeElement).toBe(item3);
    }));

    it('should move focus up with ArrowUp', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      const item1 = document.querySelector('[data-testid="item-1"]') as HTMLElement;
      expect(document.activeElement).toBe(item1);

      // Navigate down first to reach item-3 (skipping disabled)
      fireEvent.keyDown(item1, { key: 'ArrowDown' });
      flush();

      const item3 = document.querySelector('[data-testid="item-3"]') as HTMLElement;
      expect(document.activeElement).toBe(item3);

      // Now navigate up
      fireEvent.keyDown(item3, { key: 'ArrowUp' });
      flush();

      expect(document.activeElement).toBe(item1);
    }));

    it('should wrap focus at the end', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      const item1 = document.querySelector('[data-testid="item-1"]') as HTMLElement;
      expect(document.activeElement).toBe(item1);

      // Navigate down to item-3 (skipping disabled)
      fireEvent.keyDown(item1, { key: 'ArrowDown' });
      flush();

      const item3 = document.querySelector('[data-testid="item-3"]') as HTMLElement;
      expect(document.activeElement).toBe(item3);

      // ArrowDown from last item should wrap to first
      fireEvent.keyDown(item3, { key: 'ArrowDown' });
      flush();

      expect(document.activeElement).toBe(item1);
    }));

    it('should skip disabled items during keyboard navigation', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      const item1 = document.querySelector('[data-testid="item-1"]') as HTMLElement;
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowDown' });
      flush();

      const item3 = document.querySelector('[data-testid="item-3"]') as HTMLElement;
      expect(document.activeElement).toBe(item3);
    }));

    it('should activate item and close menu on Enter key', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      const item1 = document.querySelector('[data-testid="item-1"]') as HTMLElement;
      expect(document.activeElement).toBe(item1);

      // fireEvent.click with detail: 0 simulates keyboard activation (Enter)
      fireEvent.click(item1, { detail: 0 });
      flush();

      expect(document.querySelector('[data-testid="context-menu"]')).not.toBeInTheDocument();
    }));

    it('should move focus to first item on Home key', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      const item1 = document.querySelector('[data-testid="item-1"]') as HTMLElement;
      // Navigate to last item
      fireEvent.keyDown(item1, { key: 'ArrowDown' });
      flush();

      const item3 = document.querySelector('[data-testid="item-3"]') as HTMLElement;
      expect(document.activeElement).toBe(item3);

      fireEvent.keyDown(item3, { key: 'Home' });
      flush();

      expect(document.activeElement).toBe(item1);
    }));

    it('should move focus to last item on End key', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      const item1 = document.querySelector('[data-testid="item-1"]') as HTMLElement;
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'End' });
      flush();

      const item3 = document.querySelector('[data-testid="item-3"]') as HTMLElement;
      expect(document.activeElement).toBe(item3);
    }));

    it('should open submenu with ArrowRight', fakeAsync(async () => {
      await render(ContextMenuWithSubmenuComponent);
      openContextMenu();

      // Focus should be on first item (item-cut)
      const cutItem = document.querySelector('[data-testid="item-cut"]') as HTMLElement;
      expect(document.activeElement).toBe(cutItem);

      // Navigate to submenu trigger
      fireEvent.keyDown(cutItem, { key: 'ArrowDown' });
      flush();

      const moreItem = document.querySelector('[data-testid="more-item"]') as HTMLElement;
      expect(document.activeElement).toBe(moreItem);

      fireEvent.keyDown(moreItem, { key: 'ArrowRight' });
      flush();

      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
    }));

    it('should close submenu with ArrowLeft', fakeAsync(async () => {
      await render(ContextMenuWithSubmenuComponent);
      openContextMenu();

      // Navigate to submenu trigger and open it
      const cutItem = document.querySelector('[data-testid="item-cut"]') as HTMLElement;
      fireEvent.keyDown(cutItem, { key: 'ArrowDown' });
      flush();

      const moreItem = document.querySelector('[data-testid="more-item"]') as HTMLElement;
      fireEvent.keyDown(moreItem, { key: 'ArrowRight' });
      flush();

      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();

      const submenuItem = document.querySelector('[data-testid="submenu-item-a"]') as HTMLElement;
      expect(document.activeElement).toBe(submenuItem);
      fireEvent.keyDown(submenuItem, { key: 'ArrowLeft' });
      flush();

      expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
      expect(document.activeElement).toBe(moreItem);
    }));
  });

  describe('Checkbox items', () => {
    it('should toggle checkbox item on click', fakeAsync(async () => {
      const { fixture } = await render(ContextMenuCheckboxComponent);
      openContextMenu();

      const checkbox = document.querySelector('[data-testid="checkbox-item"]') as HTMLElement;
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(checkbox);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.checked).toBe(true);
      // Menu may still be open — re-query after state change
      const checkboxAfter = document.querySelector('[data-testid="checkbox-item"]');
      expect(checkboxAfter).toHaveAttribute('aria-checked', 'true');
      expect(checkboxAfter).toHaveAttribute('data-checked');
    }));

    it('should not close menu when checkbox item is clicked', fakeAsync(async () => {
      await render(ContextMenuCheckboxComponent);
      openContextMenu();

      const checkbox = document.querySelector('[data-testid="checkbox-item"]') as HTMLElement;
      fireEvent.click(checkbox);
      flush();

      expect(document.querySelector('[data-testid="context-menu"]')).toBeInTheDocument();
    }));

    it('should show indicator with data-checked when checkbox is checked', fakeAsync(async () => {
      const { fixture } = await render(ContextMenuCheckboxComponent);
      openContextMenu();

      const indicator = document.querySelector('[data-testid="checkbox-indicator"]');
      expect(indicator).not.toHaveAttribute('data-checked');

      const checkbox = document.querySelector('[data-testid="checkbox-item"]') as HTMLElement;
      fireEvent.click(checkbox);
      flush();
      fixture.detectChanges();

      const indicatorAfter = document.querySelector('[data-testid="checkbox-indicator"]');
      expect(indicatorAfter).toHaveAttribute('data-checked');
    }));
  });

  describe('Radio items', () => {
    it('should select radio item on click and update group value', fakeAsync(async () => {
      const { fixture } = await render(ContextMenuRadioComponent);
      openContextMenu();

      const radioDark = document.querySelector('[data-testid="radio-dark"]') as HTMLElement;
      fireEvent.click(radioDark);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.theme).toBe('dark');

      const radioLight = document.querySelector('[data-testid="radio-light"]');
      const radioDarkAfter = document.querySelector('[data-testid="radio-dark"]');
      expect(radioDarkAfter).toHaveAttribute('aria-checked', 'true');
      expect(radioDarkAfter).toHaveAttribute('data-checked');
      expect(radioLight).toHaveAttribute('aria-checked', 'false');
    }));

    it('should not close menu when radio item is clicked', fakeAsync(async () => {
      await render(ContextMenuRadioComponent);
      openContextMenu();

      const radioDark = document.querySelector('[data-testid="radio-dark"]') as HTMLElement;
      fireEvent.click(radioDark);
      flush();

      expect(document.querySelector('[data-testid="context-menu"]')).toBeInTheDocument();
    }));

    it('should show indicator with data-checked for selected radio', fakeAsync(async () => {
      const { fixture } = await render(ContextMenuRadioComponent);
      openContextMenu();

      const indicatorLight = document.querySelector('[data-testid="indicator-light"]');
      const indicatorDark = document.querySelector('[data-testid="indicator-dark"]');
      expect(indicatorLight).toHaveAttribute('data-checked');
      expect(indicatorDark).not.toHaveAttribute('data-checked');

      const radioDark = document.querySelector('[data-testid="radio-dark"]') as HTMLElement;
      fireEvent.click(radioDark);
      flush();
      fixture.detectChanges();

      const indicatorLightAfter = document.querySelector('[data-testid="indicator-light"]');
      const indicatorDarkAfter = document.querySelector('[data-testid="indicator-dark"]');
      expect(indicatorLightAfter).not.toHaveAttribute('data-checked');
      expect(indicatorDarkAfter).toHaveAttribute('data-checked');
    }));
  });

  describe('Disabled items', () => {
    it('should have data-disabled on disabled menu item', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);
      openContextMenu();

      const disabledItem = document.querySelector('[data-testid="item-disabled"]');
      expect(disabledItem).toHaveAttribute('data-disabled');
    }));

    it('should not toggle disabled checkbox item', fakeAsync(async () => {
      const { fixture } = await render(ContextMenuDisabledCheckboxComponent);
      openContextMenu();

      const checkbox = document.querySelector('[data-testid="checkbox-disabled"]') as HTMLElement;
      fireEvent.click(checkbox);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.checked).toBe(false);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    }));

    it('should not select disabled radio item', fakeAsync(async () => {
      const { fixture } = await render(ContextMenuDisabledRadioComponent);
      openContextMenu();

      const radioDisabled = document.querySelector('[data-testid="radio-disabled"]') as HTMLElement;
      fireEvent.click(radioDisabled);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.theme).toBe('light');
      expect(radioDisabled).toHaveAttribute('aria-checked', 'false');
    }));
  });

  describe('Context-menu-specific behavior', () => {
    it('should reposition menu on second right-click while already open', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);

      const triggerArea = screen.getByTestId('trigger-area');
      fireEvent.contextMenu(triggerArea);
      flush();

      expect(document.querySelector('[data-testid="context-menu"]')).toBeInTheDocument();

      // Right-click again while menu is open
      fireEvent.contextMenu(triggerArea);
      flush();

      expect(document.querySelector('[data-testid="context-menu"]')).toBeInTheDocument();
    }));

    it('should not restore focus to trigger area on close', fakeAsync(async () => {
      await render(ContextMenuDisabledItemsComponent);

      const triggerArea = screen.getByTestId('trigger-area');
      fireEvent.contextMenu(triggerArea);
      flush();

      const menuEl = document.querySelector('[data-testid="context-menu"]') as HTMLElement;
      fireEvent.keyDown(menuEl, { key: 'Escape' });
      flush();

      expect(document.activeElement).not.toBe(triggerArea);
    }));
  });
});
