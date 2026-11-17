import { Component, Directive, input } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import {
  NgpContextMenu,
  NgpContextMenuItemCheckbox,
  NgpContextMenuItemRadio,
  NgpContextMenuItemRadioGroup,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';
import {
  ngpMenuItemCheckbox,
  NgpMenu,
  NgpMenuItemCheckbox,
  NgpMenuItemRadio,
  NgpMenuItemRadioGroup,
  NgpMenuTrigger,
  provideMenuItemCheckboxState,
} from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Sort by</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <div ngpMenuItemRadioGroup ngpMenuItemRadioGroupDefaultValue="name">
          <button
            [ngpMenuItemRadioCloseOnSelect]="radioCloseOnSelect()"
            ngpMenuItemRadio
            ngpMenuItemRadioValue="name"
            data-testid="name"
          >
            Name
          </button>
          <button
            [ngpMenuItemRadioCloseOnSelect]="radioCloseOnSelect()"
            ngpMenuItemRadio
            ngpMenuItemRadioValue="date"
            data-testid="date"
          >
            Date
          </button>
        </div>
        <button
          [ngpMenuItemCheckboxCloseOnSelect]="checkboxCloseOnSelect()"
          ngpMenuItemCheckbox
          data-testid="pinned"
        >
          Pinned first
        </button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItemRadioGroup, NgpMenuItemRadio, NgpMenuItemCheckbox],
})
class MenuComponent {
  readonly radioCloseOnSelect = input(false);
  readonly checkboxCloseOnSelect = input(false);
}

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="area">Right-click me</div>

    <ng-template #menu>
      <div ngpContextMenu data-testid="menu">
        <div ngpContextMenuItemRadioGroup>
          <button
            ngpContextMenuItemRadio
            ngpContextMenuItemRadioValue="grid"
            ngpContextMenuItemRadioCloseOnSelect
            data-testid="grid"
          >
            Grid
          </button>
          <button ngpContextMenuItemRadio ngpContextMenuItemRadioValue="list" data-testid="list">
            List
          </button>
        </div>
        <button
          ngpContextMenuItemCheckbox
          ngpContextMenuItemCheckboxCloseOnSelect
          data-testid="hidden-files"
        >
          Show hidden files
        </button>
      </div>
    </ng-template>
  `,
  imports: [
    NgpContextMenuTrigger,
    NgpContextMenu,
    NgpContextMenuItemRadioGroup,
    NgpContextMenuItemRadio,
    NgpContextMenuItemCheckbox,
  ],
})
class ContextMenuComponent {}

/** A checkbox item built on the state alone, as a consumer would. */
@Directive({
  selector: '[appCheckboxItem]',
  providers: [provideMenuItemCheckboxState()],
})
class CheckboxItem {
  constructor() {
    ngpMenuItemCheckbox({});
  }
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">View</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button appCheckboxItem data-testid="wrap">Wrap lines</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, CheckboxItem],
})
class StateCheckboxComponent {}

const byId = (id: string) => screen.getByTestId(id);
const present = (id: string) => !!screen.queryByTestId(id);
const settle = () => new Promise(resolve => setTimeout(resolve, 50));

async function openMenu(): Promise<void> {
  await userEvent.click(byId('trigger'));
  await waitFor(() => expect(present('menu')).toBe(true));
}

async function openMenuWithKeyboard(): Promise<void> {
  byId('trigger').focus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(document.activeElement).toBe(byId('name')));
}

async function openContextMenu(): Promise<void> {
  await userEvent.click(byId('area'), { button: 'right' });
  await waitFor(() => expect(present('menu')).toBe(true));
}

describe('Menu item closeOnSelect', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpMenu], [ngpContextMenu]').forEach(el => el.remove());
  });

  describe('radio item, by default', () => {
    it('keeps the menu open on a click', async () => {
      await render(MenuComponent);
      await openMenu();

      await userEvent.click(byId('date'));

      await settle();
      expect(present('menu')).toBe(true);
      expect(byId('date')).toHaveAttribute('aria-checked', 'true');
    });

    it('keeps the menu open on Enter', async () => {
      await render(MenuComponent);
      await openMenuWithKeyboard();
      await userEvent.keyboard('{ArrowDown}');

      await userEvent.keyboard('{Enter}');

      await settle();
      expect(present('menu')).toBe(true);
      expect(byId('date')).toHaveAttribute('aria-checked', 'true');
    });

    it('keeps the menu open on Space', async () => {
      await render(MenuComponent);
      await openMenuWithKeyboard();
      await userEvent.keyboard('{ArrowDown}');

      await userEvent.keyboard(' ');

      await settle();
      expect(present('menu')).toBe(true);
      expect(byId('date')).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('radio item with ngpMenuItemRadioCloseOnSelect', () => {
    it('closes the menu on a click', async () => {
      await render(MenuComponent, { inputs: { radioCloseOnSelect: true } });
      await openMenu();

      await userEvent.click(byId('date'));

      await waitFor(() => expect(present('menu')).toBe(false));
    });

    it('closes the menu on Enter', async () => {
      await render(MenuComponent, { inputs: { radioCloseOnSelect: true } });
      await openMenuWithKeyboard();
      await userEvent.keyboard('{ArrowDown}');

      await userEvent.keyboard('{Enter}');

      await waitFor(() => expect(present('menu')).toBe(false));
    });

    it('closes the menu on Space', async () => {
      await render(MenuComponent, { inputs: { radioCloseOnSelect: true } });
      await openMenuWithKeyboard();
      await userEvent.keyboard('{ArrowDown}');

      await userEvent.keyboard(' ');

      await waitFor(() => expect(present('menu')).toBe(false));
    });
  });

  describe('checkbox item', () => {
    it('keeps the menu open on a click by default', async () => {
      await render(MenuComponent);
      await openMenu();

      await userEvent.click(byId('pinned'));

      await settle();
      expect(present('menu')).toBe(true);
      expect(byId('pinned')).toHaveAttribute('aria-checked', 'true');
    });

    it('keeps the menu open on Enter by default', async () => {
      await render(MenuComponent);
      await openMenuWithKeyboard();
      await userEvent.keyboard('{ArrowDown}{ArrowDown}');

      await userEvent.keyboard('{Enter}');

      await settle();
      expect(present('menu')).toBe(true);
    });

    it('keeps the menu open for a checkbox state composed without closeOnSelect', async () => {
      await render(StateCheckboxComponent);
      await openMenu();

      await userEvent.click(byId('wrap'));

      await settle();
      expect(present('menu')).toBe(true);
    });

    it('closes the menu on a click with ngpMenuItemCheckboxCloseOnSelect', async () => {
      await render(MenuComponent, { inputs: { checkboxCloseOnSelect: true } });
      await openMenu();

      await userEvent.click(byId('pinned'));

      await waitFor(() => expect(present('menu')).toBe(false));
    });
  });

  describe('context menu items', () => {
    it('keeps the menu open on a radio click by default', async () => {
      await render(ContextMenuComponent);
      await openContextMenu();

      await userEvent.click(byId('list'));

      await settle();
      expect(present('menu')).toBe(true);
    });

    it('closes the menu on a radio click with ngpContextMenuItemRadioCloseOnSelect', async () => {
      await render(ContextMenuComponent);
      await openContextMenu();

      await userEvent.click(byId('grid'));

      await waitFor(() => expect(present('menu')).toBe(false));
    });

    it('closes for a checkbox with ngpContextMenuItemCheckboxCloseOnSelect', async () => {
      await render(ContextMenuComponent);
      await openContextMenu();

      await userEvent.click(byId('hidden-files'));

      await waitFor(() => expect(present('menu')).toBe(false));
    });
  });
});
