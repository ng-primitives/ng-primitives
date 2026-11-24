import { NgTemplateOutlet } from '@angular/common';
import { Component, signal } from '@angular/core';
import { render, screen, waitFor, within } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NgpComboboxButton } from '../combobox-button/combobox-button';
import { NgpComboboxDropdown } from '../combobox-dropdown/combobox-dropdown';
import { NgpComboboxInput } from '../combobox-input/combobox-input';
import { NgpComboboxOption } from '../combobox-option/combobox-option';
import { NgpComboboxPortal } from '../combobox-portal/combobox-portal';
import { NgpCombobox } from '../combobox/combobox';
import { NgpComboboxList } from './combobox-list';

@Component({
  imports: [
    NgpCombobox,
    NgpComboboxButton,
    NgpComboboxDropdown,
    NgpComboboxInput,
    NgpComboboxList,
    NgpComboboxOption,
    NgpComboboxPortal,
    NgTemplateOutlet,
  ],
  template: `
    <div [(ngpComboboxValue)]="value" [ngpComboboxMultiple]="multiple()" ngpCombobox>
      <input ngpComboboxInput aria-label="Fruit" />
      <button data-testid="button" ngpComboboxButton>▼</button>

      <div *ngpComboboxPortal ngpComboboxDropdown data-testid="dropdown">
        <div role="group" aria-label="Selected">
          @for (fruit of value(); track fruit) {
            <button type="button">{{ fruit }} ×</button>
          }
        </div>

        <ng-template #options>
          @for (fruit of fruits; track fruit) {
            <div [ngpComboboxOptionValue]="fruit" ngpComboboxOption>{{ fruit }}</div>
          }
        </ng-template>

        @if (withList()) {
          <div ngpComboboxList data-testid="list">
            <ng-container [ngTemplateOutlet]="options" />
          </div>
        } @else {
          <ng-container [ngTemplateOutlet]="options" />
        }

        <button type="button">Apply</button>
      </div>
    </div>
  `,
})
class ComboboxListComponent {
  readonly fruits = ['Apple', 'Banana', 'Cherry'];
  readonly value = signal(['Banana']);
  readonly multiple = signal(true);
  readonly withList = signal(true);
}

@Component({
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxInput,
    NgpComboboxList,
    NgpComboboxOption,
    NgpComboboxPortal,
  ],
  template: `
    <div
      [(ngpComboboxValue)]="value"
      ngpCombobox
      ngpComboboxMultiple
      ngpComboboxDropdownContainer="#in-place"
    >
      <input ngpComboboxInput aria-label="Fruit" />

      <!-- The dropdown renders inside the combobox, so its key presses bubble to the combobox. -->
      <div id="in-place"></div>

      <div *ngpComboboxPortal ngpComboboxDropdown data-testid="dropdown">
        <div ngpComboboxList aria-label="Fruits">
          @for (fruit of fruits; track fruit) {
            <div [ngpComboboxOptionValue]="fruit" ngpComboboxOption>{{ fruit }}</div>
          }
        </div>

        <button (click)="applied.set(true)" type="button">Apply</button>
      </div>
    </div>
  `,
})
class InPlaceComboboxListComponent {
  readonly fruits = ['Apple', 'Banana', 'Cherry'];
  readonly value = signal<string[]>([]);
  readonly applied = signal(false);
}

@Component({
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxInput,
    NgpComboboxList,
    NgpComboboxOption,
    NgpComboboxPortal,
  ],
  template: `
    <div ngpCombobox>
      <input ngpComboboxInput aria-label="Fruit" />

      <div *ngpComboboxPortal ngpComboboxDropdown data-testid="dropdown">
        <div ngpComboboxList aria-label="Fruits">
          @for (fruit of fruits(); track fruit) {
            <div [ngpComboboxOptionValue]="fruit" ngpComboboxOption>{{ fruit }}</div>
          }
        </div>

        @if (fruits().length === 0) {
          <p>No results</p>
        }
      </div>
    </div>
  `,
})
class EmptyComboboxListComponent {
  readonly fruits = signal<string[]>([]);
}

@Component({
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxInput,
    NgpComboboxList,
    NgpComboboxOption,
    NgpComboboxPortal,
  ],
  template: `
    <div ngpCombobox>
      <input ngpComboboxInput aria-label="Fruit" />

      <div *ngpComboboxPortal ngpComboboxDropdown data-testid="dropdown">
        @if (withFirstList()) {
          <div ngpComboboxList data-testid="first-list"></div>
        }

        @if (withSecondList()) {
          <div ngpComboboxList data-testid="second-list">
            <div ngpComboboxOption ngpComboboxOptionValue="Apple">Apple</div>
          </div>
        }
      </div>
    </div>
  `,
})
class TwoComboboxListsComponent {
  readonly withFirstList = signal(true);
  readonly withSecondList = signal(true);
}

async function openDropdown(): Promise<HTMLElement> {
  const input = screen.getByRole('combobox');
  input.focus();
  await userEvent.keyboard('{ArrowDown}');
  await screen.findByTestId('dropdown');
  return input;
}

describe('NgpComboboxList', () => {
  it('should make the list the listbox and leave the dropdown without a role', async () => {
    await render(ComboboxListComponent);
    await openDropdown();

    await waitFor(() => {
      expect(screen.getByTestId('dropdown')).not.toHaveAttribute('role');
    });
    expect(screen.getByTestId('list')).toHaveAttribute('role', 'listbox');
  });

  it('should put aria-multiselectable on the list rather than the dropdown', async () => {
    const { fixture } = await render(ComboboxListComponent);
    await openDropdown();

    const list = screen.getByTestId('list');

    await waitFor(() => {
      expect(list).toHaveAttribute('aria-multiselectable', 'true');
    });
    expect(screen.getByTestId('dropdown')).not.toHaveAttribute('aria-multiselectable');

    fixture.componentInstance.multiple.set(false);

    await waitFor(() => {
      expect(list).toHaveAttribute('aria-multiselectable', 'false');
    });
  });

  it('should keep the other dropdown content outside the listbox', async () => {
    await render(ComboboxListComponent);
    await openDropdown();

    const listbox = await screen.findByRole('listbox');

    expect(within(listbox).getAllByRole('option')).toHaveLength(3);
    expect(listbox).not.toContainElement(screen.getByRole('group', { name: 'Selected' }));
    expect(listbox).not.toContainElement(screen.getByRole('button', { name: 'Apply' }));
  });

  it('should point the input and the button aria-controls at the list', async () => {
    await render(ComboboxListComponent);
    const input = await openDropdown();

    const list = screen.getByTestId('list');

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-controls', list.id);
    });
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(screen.getByTestId('button')).toHaveAttribute('aria-controls', list.id);
  });

  it('should navigate and select options inside the list with the keyboard', async () => {
    const { fixture } = await render(ComboboxListComponent);
    const input = await openDropdown();

    const list = screen.getByTestId('list');
    const [, banana, cherry] = within(list).getAllByRole('option');

    // the first selected option is activated on open
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-activedescendant', banana.id);
    });

    await userEvent.keyboard('{ArrowDown}');

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-activedescendant', cherry.id);
    });

    // the active option must sit inside the element aria-controls names
    const controlled = document.getElementById(input.getAttribute('aria-controls')!);
    expect(controlled).toBe(list);
    expect(controlled).toContainElement(cherry);

    await userEvent.keyboard('{Enter}');

    expect(fixture.componentInstance.value()).toEqual(['Banana', 'Cherry']);
    expect(cherry).toHaveAttribute('aria-selected', 'true');
  });

  it('should leave the dropdown as the listbox when there is no list', async () => {
    const { fixture } = await render(ComboboxListComponent, {
      componentProperties: { withList: signal(false) },
    });
    const input = await openDropdown();

    const dropdown = screen.getByTestId('dropdown');
    const [, banana] = within(dropdown).getAllByRole('option');

    expect(dropdown).toHaveAttribute('role', 'listbox');
    expect(dropdown).toHaveAttribute('aria-multiselectable', 'true');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('aria-controls', dropdown.id);
    expect(screen.getByTestId('button')).toHaveAttribute('aria-controls', dropdown.id);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-activedescendant', banana.id);
    });

    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(fixture.componentInstance.value()).toEqual(['Banana', 'Cherry']);
  });

  it('should make the dropdown the listbox again when the list is removed', async () => {
    const { fixture } = await render(ComboboxListComponent);
    const input = await openDropdown();

    const dropdown = screen.getByTestId('dropdown');

    await waitFor(() => {
      expect(dropdown).not.toHaveAttribute('role');
    });

    fixture.componentInstance.withList.set(false);

    await waitFor(() => {
      expect(dropdown).toHaveAttribute('role', 'listbox');
    });
    expect(dropdown).toHaveAttribute('aria-multiselectable', 'true');
    expect(input).toHaveAttribute('aria-controls', dropdown.id);
  });

  it('should keep the list registered when an earlier list is removed', async () => {
    const { fixture } = await render(TwoComboboxListsComponent);
    const input = await openDropdown();

    const secondList = screen.getByTestId('second-list');

    // the list created last is the registered one
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-controls', secondList.id);
    });

    fixture.componentInstance.withFirstList.set(false);

    await waitFor(() => {
      expect(screen.queryByTestId('first-list')).not.toBeInTheDocument();
    });
    expect(input).toHaveAttribute('aria-controls', secondList.id);
    expect(screen.getByTestId('dropdown')).not.toHaveAttribute('role');
  });

  it('should fall back to the remaining list when the list created last is removed', async () => {
    const { fixture } = await render(TwoComboboxListsComponent);
    const input = await openDropdown();

    const firstList = screen.getByTestId('first-list');

    fixture.componentInstance.withSecondList.set(false);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-controls', firstList.id);
    });
    expect(screen.getByTestId('dropdown')).not.toHaveAttribute('role');
  });

  it('should keep the dropdown without a role while the mounted list is empty', async () => {
    await render(EmptyComboboxListComponent);
    await openDropdown();

    const listbox = await screen.findByRole('listbox', { name: 'Fruits' });

    expect(screen.getByTestId('dropdown')).not.toHaveAttribute('role');
    expect(within(listbox).queryAllByRole('option')).toHaveLength(0);
    expect(listbox).not.toContainElement(screen.getByText('No results'));
  });

  describe('content beside the list, in a dropdown rendered inside the combobox', () => {
    it('should leave Enter to a button in the dropdown', async () => {
      const { fixture } = await render(InPlaceComboboxListComponent);
      const input = await openDropdown();

      const [apple] = screen.getAllByRole('option');
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant', apple.id);
      });

      screen.getByRole('button', { name: 'Apply' }).focus();
      await userEvent.keyboard('{Enter}');

      expect(fixture.componentInstance.applied()).toBe(true);
      expect(fixture.componentInstance.value()).toEqual([]);
    });

    it('should not move the active option on an arrow key pressed on a button in the dropdown', async () => {
      await render(InPlaceComboboxListComponent);
      const input = await openDropdown();

      const [apple] = screen.getAllByRole('option');
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant', apple.id);
      });

      const apply = screen.getByRole('button', { name: 'Apply' });
      apply.focus();
      const arrowDown = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      });
      apply.dispatchEvent(arrowDown);

      expect(arrowDown.defaultPrevented).toBe(false);
      expect(input).toHaveAttribute('aria-activedescendant', apple.id);
    });
  });
});
