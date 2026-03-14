import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpMenuItemIndicator } from '../menu-item-indicator/menu-item-indicator';
import { NgpMenuItemRadioGroup } from '../menu-item-radio-group/menu-item-radio-group';
import { NgpMenuItem } from '../menu-item/menu-item';
import { NgpMenuTrigger } from '../menu-trigger/menu-trigger';
import { NgpMenu } from '../menu/menu';
import { NgpMenuItemRadio } from './menu-item-radio';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <div
          [ngpMenuItemRadioGroupValue]="theme"
          (ngpMenuItemRadioGroupValueChange)="theme = $event"
          ngpMenuItemRadioGroup
        >
          <button ngpMenuItemRadio ngpMenuItemRadioValue="light" data-testid="radio-light">
            <span ngpMenuItemIndicator data-testid="indicator-light">●</span>
            Light
          </button>
          <button ngpMenuItemRadio ngpMenuItemRadioValue="dark" data-testid="radio-dark">
            <span ngpMenuItemIndicator data-testid="indicator-dark">●</span>
            Dark
          </button>
          <button ngpMenuItemRadio ngpMenuItemRadioValue="system" data-testid="radio-system">
            System
          </button>
        </div>
        <button ngpMenuItem data-testid="regular-item">Regular Item</button>
      </div>
    </ng-template>
  `,
  imports: [
    NgpMenuTrigger,
    NgpMenu,
    NgpMenuItem,
    NgpMenuItemRadioGroup,
    NgpMenuItemRadio,
    NgpMenuItemIndicator,
  ],
})
class TestMenuRadioComponent {
  theme = 'light';
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <div ngpMenuItemRadioGroup ngpMenuItemRadioGroupValue="b">
          <button
            [ngpMenuItemRadioDisabled]="true"
            ngpMenuItemRadio
            ngpMenuItemRadioValue="a"
            data-testid="disabled-radio"
          >
            Disabled
          </button>
          <button ngpMenuItemRadio ngpMenuItemRadioValue="b" data-testid="selected-radio">
            Selected
          </button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItemRadioGroup, NgpMenuItemRadio],
})
class TestMenuRadioDisabledComponent {}

async function openMenu(fixture: any) {
  const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]');
  fireEvent.click(trigger);
  await waitFor(() => {
    expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
  });
  fixture.detectChanges();
  return trigger;
}

describe('NgpMenuItemRadio', () => {
  it('should have role="menuitemradio"', async () => {
    const { fixture } = await render(TestMenuRadioComponent);
    await openMenu(fixture);

    const radio = document.querySelector('[data-testid="radio-light"]');
    expect(radio).toHaveAttribute('role', 'menuitemradio');
  });

  it('should have aria-checked="true" for the selected item', async () => {
    const { fixture } = await render(TestMenuRadioComponent);
    await openMenu(fixture);

    const lightRadio = document.querySelector('[data-testid="radio-light"]');
    const darkRadio = document.querySelector('[data-testid="radio-dark"]');

    expect(lightRadio).toHaveAttribute('aria-checked', 'true');
    expect(lightRadio).toHaveAttribute('data-checked');
    expect(darkRadio).toHaveAttribute('aria-checked', 'false');
    expect(darkRadio).not.toHaveAttribute('data-checked');
  });

  it('should select radio item on click', async () => {
    const { fixture } = await render(TestMenuRadioComponent);
    await openMenu(fixture);

    const darkRadio = document.querySelector('[data-testid="radio-dark"]');
    fireEvent.click(darkRadio!);

    await waitFor(() => {
      expect(darkRadio).toHaveAttribute('aria-checked', 'true');
      expect(darkRadio).toHaveAttribute('data-checked');
      expect(fixture.componentInstance.theme).toBe('dark');

      // Previous selection should be unchecked
      const lightRadio = document.querySelector('[data-testid="radio-light"]');
      expect(lightRadio).toHaveAttribute('aria-checked', 'false');
      expect(lightRadio).not.toHaveAttribute('data-checked');
    });
  });

  it('should NOT close the menu on click', async () => {
    const { fixture } = await render(TestMenuRadioComponent);
    const trigger = await openMenu(fixture);

    const darkRadio = document.querySelector('[data-testid="radio-dark"]');
    fireEvent.click(darkRadio!);

    await waitFor(() => {
      // Menu should still be open
      expect(trigger).toHaveAttribute('data-open');
      expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
    });
  });

  it('should close the menu when regular item is clicked', async () => {
    const { fixture } = await render(TestMenuRadioComponent);
    const trigger = await openMenu(fixture);

    const regularItem = document.querySelector('[data-testid="regular-item"]');
    fireEvent.click(regularItem!);

    await waitFor(() => {
      expect(trigger).not.toHaveAttribute('data-open');
    });
  });

  it('should not select when disabled', async () => {
    const { fixture } = await render(TestMenuRadioDisabledComponent);
    await openMenu(fixture);

    const disabledRadio = document.querySelector('[data-testid="disabled-radio"]');
    const selectedRadio = document.querySelector('[data-testid="selected-radio"]');

    // The disabled radio is not selected (group value is "b", this radio's value is "a")
    expect(disabledRadio).toHaveAttribute('aria-checked', 'false');
    expect(selectedRadio).toHaveAttribute('aria-checked', 'true');

    // Clicking the disabled radio should not select it
    fireEvent.click(disabledRadio!);

    await waitFor(() => {
      expect(disabledRadio).toHaveAttribute('aria-checked', 'false');
      expect(selectedRadio).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('should show indicator with data-checked for selected item', async () => {
    const { fixture } = await render(TestMenuRadioComponent);
    await openMenu(fixture);

    const lightIndicator = document.querySelector('[data-testid="indicator-light"]');
    const darkIndicator = document.querySelector('[data-testid="indicator-dark"]');

    expect(lightIndicator).toHaveAttribute('data-checked');
    expect(darkIndicator).not.toHaveAttribute('data-checked');

    // Click dark radio
    const darkRadio = document.querySelector('[data-testid="radio-dark"]');
    fireEvent.click(darkRadio!);

    await waitFor(() => {
      expect(lightIndicator).not.toHaveAttribute('data-checked');
      expect(darkIndicator).toHaveAttribute('data-checked');
    });
  });
});

describe('NgpMenuItemRadioGroup', () => {
  it('should have role="group"', async () => {
    const { fixture } = await render(TestMenuRadioComponent);
    await openMenu(fixture);

    const radioLight = document.querySelector('[data-testid="radio-light"]');
    const group = radioLight?.parentElement;
    expect(group).toHaveAttribute('role', 'group');
  });

  it('should not re-emit when selecting already selected value', async () => {
    const { fixture } = await render(TestMenuRadioComponent);
    fixture.componentInstance.theme = 'light';
    fixture.detectChanges();
    await openMenu(fixture);

    const originalTheme = fixture.componentInstance.theme;

    const lightRadio = document.querySelector('[data-testid="radio-light"]');
    fireEvent.click(lightRadio!);

    await waitFor(() => {
      // Theme should not have changed
      expect(fixture.componentInstance.theme).toBe(originalTheme);
    });
  });
});
