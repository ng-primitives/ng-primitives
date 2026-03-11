import { Component } from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
import { NgpMenuItem } from '../menu-item/menu-item';
import { NgpMenuTrigger } from '../menu-trigger/menu-trigger';
import { NgpMenu } from '../menu/menu';
import { NgpMenuItemCheckbox } from './menu-item-checkbox';
import { NgpMenuItemIndicator } from '../menu-item-indicator/menu-item-indicator';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button
          ngpMenuItemCheckbox
          [ngpMenuItemCheckboxChecked]="checked"
          (ngpMenuItemCheckboxCheckedChange)="checked = $event"
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
          ngpMenuItemCheckbox
          [ngpMenuItemCheckboxDisabled]="true"
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
