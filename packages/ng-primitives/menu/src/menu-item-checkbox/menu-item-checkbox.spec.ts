import { Component, TemplateRef, viewChild } from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
import { NgpMenuItemIndicator } from '../menu-item-indicator/menu-item-indicator';
import { NgpMenuItem } from '../menu-item/menu-item';
import { NgpMenuTrigger } from '../menu-trigger/menu-trigger';
import { NgpMenu } from '../menu/menu';
import { NgpSubmenuTrigger } from '../submenu-trigger/submenu-trigger';
import { NgpMenuItemCheckbox } from './menu-item-checkbox';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button
          [ngpMenuItemCheckboxChecked]="checked"
          (ngpMenuItemCheckboxCheckedChange)="checked = $event"
          ngpMenuItemCheckbox
          data-testid="checkbox-item"
        >
          <span ngpMenuItemIndicator data-testid="indicator">✓</span>
          Show Toolbar
        </button>
        <button ngpMenuItem data-testid="regular-item">Regular Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpMenuItemCheckbox, NgpMenuItemIndicator],
})
class TestMenuCheckboxComponent {
  checked = false;
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button
          [ngpMenuItemCheckboxDisabled]="true"
          ngpMenuItemCheckbox
          data-testid="disabled-checkbox"
        >
          Disabled
        </button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItemCheckbox],
})
class TestMenuCheckboxDisabledComponent {}

function openMenu(fixture: any) {
  const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');
  fireEvent.click(trigger);
  tick();
  fixture.detectChanges();
  flush();
  return trigger;
}

describe('NgpMenuItemCheckbox', () => {
  it('should have role="menuitemcheckbox"', fakeAsync(async () => {
    const { fixture } = await render(TestMenuCheckboxComponent);
    openMenu(fixture);

    const checkbox = document.querySelector('[data-testid="checkbox-item"]');
    expect(checkbox).toHaveAttribute('role', 'menuitemcheckbox');
  }));

  it('should have aria-checked="false" when unchecked', fakeAsync(async () => {
    const { fixture } = await render(TestMenuCheckboxComponent);
    openMenu(fixture);

    const checkbox = document.querySelector('[data-testid="checkbox-item"]');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  }));

  it('should toggle checked state on click', fakeAsync(async () => {
    const { fixture } = await render(TestMenuCheckboxComponent);
    openMenu(fixture);

    const checkbox = document.querySelector('[data-testid="checkbox-item"]');

    // Click to check
    fireEvent.click(checkbox!);
    tick();
    fixture.detectChanges();
    flush();

    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(checkbox).toHaveAttribute('data-checked');
    expect(fixture.componentInstance.checked).toBe(true);
  }));

  it('should toggle back to unchecked on second click', fakeAsync(async () => {
    const { fixture } = await render(TestMenuCheckboxComponent);
    fixture.componentInstance.checked = true;
    fixture.detectChanges();
    openMenu(fixture);

    const checkbox = document.querySelector('[data-testid="checkbox-item"]');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');

    // Click to uncheck
    fireEvent.click(checkbox!);
    tick();
    fixture.detectChanges();
    flush();

    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(fixture.componentInstance.checked).toBe(false);
  }));

  it('should NOT close the menu on click', fakeAsync(async () => {
    const { fixture } = await render(TestMenuCheckboxComponent);
    const trigger = openMenu(fixture);

    const checkbox = document.querySelector('[data-testid="checkbox-item"]');
    fireEvent.click(checkbox!);
    tick();
    fixture.detectChanges();
    flush();

    // Menu should still be open
    expect(trigger).toHaveAttribute('data-open');
    expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
  }));

  it('should close the menu when regular item is clicked', fakeAsync(async () => {
    const { fixture } = await render(TestMenuCheckboxComponent);
    const trigger = openMenu(fixture);

    const regularItem = document.querySelector('[data-testid="regular-item"]');
    fireEvent.click(regularItem!);
    tick();
    fixture.detectChanges();
    flush();

    // Menu should be closed
    expect(trigger).not.toHaveAttribute('data-open');
  }));

  it('should not toggle when disabled', fakeAsync(async () => {
    const { fixture } = await render(TestMenuCheckboxDisabledComponent);
    openMenu(fixture);

    const checkbox = document.querySelector('[data-testid="disabled-checkbox"]');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(checkbox!);
    tick();
    fixture.detectChanges();
    flush();

    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  }));

  it('should show indicator with data-checked when checked', fakeAsync(async () => {
    const { fixture } = await render(TestMenuCheckboxComponent);
    openMenu(fixture);

    const indicator = document.querySelector('[data-testid="indicator"]');
    expect(indicator).not.toHaveAttribute('data-checked');

    const checkbox = document.querySelector('[data-testid="checkbox-item"]');
    fireEvent.click(checkbox!);
    tick();
    fixture.detectChanges();
    flush();

    expect(indicator).toHaveAttribute('data-checked');
  }));
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
        <button
          [ngpMenuItemCheckboxChecked]="checked"
          (ngpMenuItemCheckboxCheckedChange)="checked = $event"
          ngpMenuItemCheckbox
          data-testid="submenu-checkbox"
        >
          Toggle Option
        </button>
        <button ngpMenuItem data-testid="submenu-regular-item">Regular Submenu Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger, NgpMenuItemCheckbox],
})
class TestSubmenuCheckboxComponent {
  menu = viewChild<TemplateRef<unknown>>('menu');
  submenu = viewChild<TemplateRef<unknown>>('submenu');
  checked = false;
}

function openSubmenu(fixture: any) {
  const rootTrigger = fixture.debugElement.nativeElement.querySelector(
    '[data-testid="root-trigger"]',
  );
  fireEvent.click(rootTrigger);
  tick();
  fixture.detectChanges();
  flush();

  const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
  fireEvent.click(submenuTrigger!);
  tick();
  fixture.detectChanges();
  flush();

  return rootTrigger;
}

describe('NgpMenuItemCheckbox in submenu', () => {
  it('should NOT close the menu when checkbox in submenu is clicked', fakeAsync(async () => {
    const { fixture } = await render(TestSubmenuCheckboxComponent);
    const rootTrigger = openSubmenu(fixture);

    // Verify submenu is open
    const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
    expect(submenuTrigger).toHaveAttribute('data-open');

    // Simulate a real click: mouseup fires first (triggers overlay outside click detection),
    // then click fires (triggers menu item selection logic)
    const checkbox = document.querySelector('[data-testid="submenu-checkbox"]');
    fireEvent.mouseUp(checkbox!);
    fireEvent.click(checkbox!);
    tick();
    fixture.detectChanges();
    flush();

    // Both the root menu and submenu should still be open
    expect(rootTrigger).toHaveAttribute('data-open');
    expect(submenuTrigger).toHaveAttribute('data-open');
    expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
  }));

  it('should toggle checkbox state without closing submenu', fakeAsync(async () => {
    const { fixture } = await render(TestSubmenuCheckboxComponent);
    openSubmenu(fixture);

    const checkbox = document.querySelector('[data-testid="submenu-checkbox"]');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    // Simulate a real click with mouseup + click
    fireEvent.mouseUp(checkbox!);
    fireEvent.click(checkbox!);
    tick();
    fixture.detectChanges();
    flush();

    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(fixture.componentInstance.checked).toBe(true);

    // Menu should still be open
    expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
  }));

  it('should close all menus when regular item in submenu is clicked', fakeAsync(async () => {
    const { fixture } = await render(TestSubmenuCheckboxComponent);
    const rootTrigger = openSubmenu(fixture);

    // Simulate a real click with mouseup + click
    const regularItem = document.querySelector('[data-testid="submenu-regular-item"]');
    fireEvent.mouseUp(regularItem!);
    fireEvent.click(regularItem!);
    tick();
    fixture.detectChanges();
    flush();

    // All menus should be closed
    expect(rootTrigger).not.toHaveAttribute('data-open');
    expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
  }));

  it('should NOT close the menu when checkbox in submenu is activated via Enter key', fakeAsync(async () => {
    const { fixture } = await render(TestSubmenuCheckboxComponent);
    const rootTrigger = openSubmenu(fixture);

    const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
    const checkbox = document.querySelector('[data-testid="submenu-checkbox"]') as HTMLElement;
    checkbox.focus();

    // Enter key fires a click event with detail === 0 (keyboard origin)
    fireEvent.click(checkbox, { detail: 0 });
    tick();
    fixture.detectChanges();
    flush();

    // Checkbox should be toggled
    expect(checkbox).toHaveAttribute('aria-checked', 'true');

    // Both menus should still be open
    expect(rootTrigger).toHaveAttribute('data-open');
    expect(submenuTrigger).toHaveAttribute('data-open');
    expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
  }));

  it('should close all menus when regular item in submenu is activated via Enter key', fakeAsync(async () => {
    const { fixture } = await render(TestSubmenuCheckboxComponent);
    const rootTrigger = openSubmenu(fixture);

    const regularItem = document.querySelector(
      '[data-testid="submenu-regular-item"]',
    ) as HTMLElement;
    regularItem.focus();

    // Enter key fires a click event with detail === 0 (keyboard origin)
    fireEvent.click(regularItem, { detail: 0 });
    tick();
    fixture.detectChanges();
    flush();

    // All menus should be closed
    expect(rootTrigger).not.toHaveAttribute('data-open');
    expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
  }));

  it('should close all menus when Escape is pressed on checkbox in submenu', fakeAsync(async () => {
    const { fixture } = await render(TestSubmenuCheckboxComponent);
    const rootTrigger = openSubmenu(fixture);

    const checkbox = document.querySelector('[data-testid="submenu-checkbox"]') as HTMLElement;
    checkbox.focus();

    // Press Escape - should close all menus regardless of closeOnSelect
    const submenu = document.querySelector('[data-testid="submenu"]');
    fireEvent.keyDown(submenu!, { key: 'Escape' });
    tick();
    fixture.detectChanges();
    flush();

    // All menus should be closed
    expect(rootTrigger).not.toHaveAttribute('data-open');
    expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
  }));

  it('should close only the submenu on Left Arrow from checkbox item', fakeAsync(async () => {
    const { fixture } = await render(TestSubmenuCheckboxComponent);
    const rootTrigger = openSubmenu(fixture);

    const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]');
    const checkbox = document.querySelector('[data-testid="submenu-checkbox"]') as HTMLElement;
    checkbox.focus();

    // Left Arrow should close only the submenu, not the root menu
    fireEvent.keyDown(checkbox, { key: 'ArrowLeft' });
    tick();
    fixture.detectChanges();
    flush();

    // Submenu should be closed
    expect(submenuTrigger).not.toHaveAttribute('data-open');

    // Root menu should still be open
    expect(rootTrigger).toHaveAttribute('data-open');
  }));
});
