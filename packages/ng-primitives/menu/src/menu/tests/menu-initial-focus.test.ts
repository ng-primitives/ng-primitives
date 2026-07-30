import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <div ngpMenuItem data-testid="item-1">Item 1</div>
        <div ngpMenuItem data-testid="item-2">Item 2</div>
        <div ngpMenuItem data-testid="item-3">Item 3</div>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class TestMenuWithDivItemsComponent {}

@Component({
  template: `
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
class TestMenuWithButtonItemsComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <div [ngpMenuItemDisabled]="true" ngpMenuItem data-testid="item-disabled">Disabled</div>
        <div ngpMenuItem data-testid="item-2">Item 2</div>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class TestMenuWithDisabledFirstItemComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">Nothing to see here</div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu],
})
class TestMenuWithoutItemsComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <div [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="submenu-trigger">
          Open Submenu
        </div>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <div ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</div>
        <div ngpMenuItem data-testid="submenu-item-2">Submenu Item 2</div>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestSubmenuWithDivItemsComponent {}

describe('NgpMenu initial focus', () => {
  it('should focus the first item when the items are not natively focusable', async () => {
    const { fixture } = await render(TestMenuWithDivItemsComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

    fireEvent.click(trigger);
    fixture.detectChanges();

    await waitFor(() =>
      expect(document.querySelector('[data-testid="item-1"]')).toBe(document.activeElement),
    );
  });

  it('should focus the first item when the items are natively focusable', async () => {
    const { fixture } = await render(TestMenuWithButtonItemsComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

    fireEvent.click(trigger);
    fixture.detectChanges();

    await waitFor(() =>
      expect(document.querySelector('[data-testid="item-1"]')).toBe(document.activeElement),
    );
  });

  it('should support roving focus navigation once the first item is focused', async () => {
    const { fixture } = await render(TestMenuWithDivItemsComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

    fireEvent.click(trigger);
    fixture.detectChanges();

    await waitFor(() =>
      expect(document.querySelector('[data-testid="item-1"]')).toBe(document.activeElement),
    );

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    fixture.detectChanges();

    expect(document.querySelector('[data-testid="item-2"]')).toBe(document.activeElement);
  });

  it('should skip a disabled first item', async () => {
    const { fixture } = await render(TestMenuWithDisabledFirstItemComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

    fireEvent.click(trigger);
    fixture.detectChanges();

    await waitFor(() =>
      expect(document.querySelector('[data-testid="item-2"]')).toBe(document.activeElement),
    );
  });

  it('should focus the menu container when there are no items to focus', async () => {
    const { fixture } = await render(TestMenuWithoutItemsComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');

    fireEvent.click(trigger);
    fixture.detectChanges();

    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu"]')).toBe(document.activeElement),
    );
  });

  it('should focus the first submenu item when a submenu opens', async () => {
    const { fixture } = await render(TestSubmenuWithDivItemsComponent);
    const trigger = fixture.debugElement.nativeElement.querySelector(
      '[data-testid="root-trigger"]',
    );

    fireEvent.click(trigger);
    fixture.detectChanges();

    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-trigger"]')).toBe(
        document.activeElement,
      ),
    );

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    fixture.detectChanges();

    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-item-1"]')).toBe(document.activeElement),
    );
  });
});
