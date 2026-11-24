import { NgTemplateOutlet } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpNumberField, NgpNumberFieldInput } from 'ng-primitives/number-field';
import { describe, expect, it } from 'vitest';
import { userEvent as browserUserEvent } from 'vitest/browser';
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
    <div
      [(ngpComboboxValue)]="value"
      ngpCombobox
      ngpComboboxMultiple
      ngpComboboxDropdownContainer="#in-place-scrolling"
    >
      <input ngpComboboxInput aria-label="Fruit" />

      <div id="in-place-scrolling"></div>

      <div *ngpComboboxPortal ngpComboboxDropdown data-testid="dropdown">
        <!-- The padding is a surface of the list that belongs to no option. -->
        <div
          style="max-height: 40px; overflow-y: auto; padding-top: 16px"
          ngpComboboxList
          aria-label="Fruits"
        >
          @for (fruit of fruits; track fruit) {
            <div [ngpComboboxOptionValue]="fruit" ngpComboboxOption>{{ fruit }}</div>
          }
        </div>

        <button type="button">Apply</button>
      </div>
    </div>
  `,
})
class InPlaceScrollingComboboxListComponent {
  readonly fruits = ['Apple', 'Banana', 'Cherry', 'Grape', 'Lemon', 'Mango', 'Orange', 'Peach'];
  readonly value = signal<string[]>([]);
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
    <!-- The combobox is itself content of an option of another widget. -->
    <div role="listbox" aria-label="Filters">
      <div role="option" aria-selected="false">
        <div
          [(ngpComboboxValue)]="value"
          ngpCombobox
          ngpComboboxMultiple
          ngpComboboxDropdownContainer="#in-place"
        >
          <input ngpComboboxInput aria-label="Fruit" />

          <div id="in-place"></div>

          <div *ngpComboboxPortal ngpComboboxDropdown data-testid="dropdown">
            <div ngpComboboxList aria-label="Fruits">
              <div ngpComboboxOption ngpComboboxOptionValue="Apple">Apple</div>
              <div ngpComboboxOption ngpComboboxOptionValue="Banana">Banana</div>
            </div>

            <div role="listbox" aria-label="Presets">
              <div role="option" aria-selected="false" tabindex="0">Recent</div>
            </div>

            <button (click)="applied.set(true)" type="button">Apply</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
class ForeignOptionsComboboxListComponent {
  readonly value = signal<string[]>([]);
  readonly applied = signal(false);
}

@Component({
  imports: [NgpCombobox, NgpComboboxDropdown, NgpComboboxOption, NgpComboboxPortal],
  template: `
    <div
      [(ngpComboboxValue)]="value"
      ngpCombobox
      ngpComboboxDropdownContainer="#in-place"
      data-testid="combobox"
    >
      <div id="in-place"></div>

      <div *ngpComboboxPortal ngpComboboxDropdown data-testid="dropdown">
        <input aria-label="Filter" />

        @for (fruit of fruits; track fruit) {
          <div [ngpComboboxOptionValue]="fruit" ngpComboboxOption>{{ fruit }}</div>
        }
      </div>
    </div>
  `,
})
class InPlaceFilterWithoutListComponent {
  readonly fruits = ['Apple', 'Banana', 'Cherry'];
  readonly value = signal<string | undefined>(undefined);
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
    <div [(ngpComboboxValue)]="value" ngpCombobox ngpComboboxMultiple>
      <input ngpComboboxInput aria-label="Fruit" />

      <div *ngpComboboxPortal ngpComboboxDropdown data-testid="dropdown">
        <input aria-label="Filter" />

        <div ngpComboboxList aria-label="Fruits">
          <div role="group" aria-labelledby="fruits-label">
            <div id="fruits-label" role="presentation">All fruits</div>
            @for (fruit of fruits; track fruit) {
              <div [ngpComboboxOptionValue]="fruit" ngpComboboxOption>{{ fruit }}</div>
            }
          </div>
        </div>

        <p>{{ value().length }} selected</p>
        <button (click)="applied.set(true)" type="button">Apply</button>
      </div>
    </div>
  `,
})
class PressedDropdownComponent {
  readonly fruits = ['Apple', 'Banana', 'Cherry'];
  readonly value = signal<string[]>([]);
  readonly applied = signal(false);
}

// A web component: its field sits in a shadow root, so events from the field reach listeners
// outside with the host as their target.
class ShadowField extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = '<input aria-label="Shadow filter" />';
  }
}

if (!customElements.get('ngp-test-shadow-field')) {
  customElements.define('ngp-test-shadow-field', ShadowField);
}

@Component({
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxList,
    NgpComboboxOption,
    NgpComboboxPortal,
    NgpNumberField,
    NgpNumberFieldInput,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div
      [(ngpComboboxValue)]="value"
      ngpCombobox
      ngpComboboxDropdownContainer="#in-place"
      data-testid="combobox"
    >
      <div id="in-place"></div>

      <div *ngpComboboxPortal ngpComboboxDropdown data-testid="dropdown">
        <input aria-label="Filter" />
        <input aria-label="Amount" type="number" />
        <!-- A text input that is a spin button by role. -->
        <div ngpNumberField ngpNumberFieldDefaultValue="5">
          <input ngpNumberFieldInput aria-label="Quantity" />
        </div>
        <!-- A filter in a form prevents Enter only to keep the form from submitting. -->
        <input (keydown.enter)="$event.preventDefault()" aria-label="Form filter" />
        <!-- The role attribute is a list of tokens: the first one is the role. -->
        <input aria-label="Padded role filter" role=" textbox " />
        <input aria-label="Fallback role filter" role="searchbox extra" />
        <input aria-label="Volume" type="range" min="0" max="100" value="0" />
        <textarea aria-label="Note"></textarea>
        <select aria-label="Sort">
          <option>Name</option>
          <option>Date</option>
        </select>
        <div aria-label="Comment" contenteditable="true"><b>bold</b></div>
        <ngp-test-shadow-field data-testid="shadow-field" />

        <div ngpComboboxList aria-label="Fruits">
          @for (fruit of fruits; track fruit) {
            <div [ngpComboboxOptionValue]="fruit" ngpComboboxOption>{{ fruit }}</div>
          }
        </div>
      </div>
    </div>
  `,
})
class InPlaceControlsWithListComponent {
  readonly fruits = ['Apple', 'Banana', 'Cherry'];
  readonly value = signal<string | undefined>(undefined);
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

  // Real pointer presses: the browser, not a simulation, decides what a press focuses.
  describe('a mouse press in a dropdown with a list', () => {
    async function openPressedDropdown() {
      const view = await render(PressedDropdownComponent);
      const input = await openDropdown();
      const [apple, banana] = screen.getAllByRole('option');
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant', apple.id);
      });
      return { component: view.fixture.componentInstance, input, banana };
    }

    it('should keep focus on the input and the keys working after a press on a group label inside the list', async () => {
      const { component, input, banana } = await openPressedDropdown();

      await browserUserEvent.click(screen.getByText('All fruits'));

      expect(input).toHaveFocus();

      await browserUserEvent.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', banana.id);
      await browserUserEvent.keyboard('{Enter}');

      expect(component.value()).toEqual(['Banana']);
    });

    it('should keep focus on the input and the keys working after a press on text beside the list', async () => {
      const { component, input, banana } = await openPressedDropdown();

      await browserUserEvent.click(screen.getByText('0 selected'));

      expect(input).toHaveFocus();
      expect(input).toHaveAttribute('aria-expanded', 'true');

      await browserUserEvent.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', banana.id);
      await browserUserEvent.keyboard('{Enter}');

      expect(component.value()).toEqual(['Banana']);
    });

    it('should click a button beside the list and keep focus on the input', async () => {
      const { component, input } = await openPressedDropdown();

      await browserUserEvent.click(screen.getByRole('button', { name: 'Apply' }));

      expect(component.applied()).toBe(true);
      expect(input).toHaveFocus();
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('should let a pressed text field in the dropdown take focus and stay open', async () => {
      const { input } = await openPressedDropdown();
      const filter = screen.getByRole('textbox', { name: 'Filter' });

      await browserUserEvent.click(filter);

      expect(filter).toHaveFocus();
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('a mouse press in a dropdown without a list', () => {
    it('should keep its default and close the dropdown when it blurs the input to nothing', async () => {
      await render(ComboboxListComponent, {
        componentProperties: { withList: signal(false) },
      });
      const input = await openDropdown();

      const notPrevented = fireEvent.mouseDown(screen.getByRole('button', { name: 'Apply' }));
      input.blur();

      expect(notPrevented).toBe(true);
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
      });
    });
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

    it('should close the dropdown on Escape pressed on a button in the dropdown', async () => {
      await render(InPlaceComboboxListComponent);
      const input = await openDropdown();

      screen.getByRole('button', { name: 'Apply' }).focus();
      expect(input).toHaveAttribute('aria-expanded', 'true');
      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should move focus from the input to a button in the dropdown on Tab and stay open', async () => {
      await render(InPlaceComboboxListComponent);
      const input = await openDropdown();

      await userEvent.tab();

      expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus();
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('should skip a list that scrolls on Tab from the input', async () => {
      await render(InPlaceScrollingComboboxListComponent);
      await openDropdown();
      const list = screen.getByRole('listbox');
      expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);

      // A real key press: the browser, not a simulation, decides that a scroll container is a tab stop.
      await browserUserEvent.keyboard('{Tab}');

      expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus();
    });

    it('should keep focus on the input and the keys working after a press on the list beside its options', async () => {
      const { fixture } = await render(InPlaceScrollingComboboxListComponent);
      const input = await openDropdown();
      const list = screen.getByRole('listbox');
      const [apple, banana] = screen.getAllByRole('option');
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant', apple.id);
      });

      // A real pointer press: the browser, not a simulation, decides what a press focuses.
      await browserUserEvent.click(list, { position: { x: 8, y: 8 } });

      expect(input).toHaveFocus();

      await browserUserEvent.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', banana.id);
      await browserUserEvent.keyboard('{Enter}');

      expect(fixture.componentInstance.value()).toEqual(['Banana']);
    });

    it('should leave Enter to a button in the dropdown when the combobox sits inside an option of another widget', async () => {
      const { fixture } = await render(ForeignOptionsComboboxListComponent);
      const input = await openDropdown();

      const apple = screen.getByRole('option', { name: 'Apple' });
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant', apple.id);
      });

      screen.getByRole('button', { name: 'Apply' }).focus();
      await userEvent.keyboard('{Enter}');

      expect(fixture.componentInstance.applied()).toBe(true);
      expect(fixture.componentInstance.value()).toEqual([]);
    });

    it('should leave the keys of an option of another widget in the dropdown alone', async () => {
      await render(ForeignOptionsComboboxListComponent);
      const input = await openDropdown();

      const apple = screen.getByRole('option', { name: 'Apple' });
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant', apple.id);
      });

      const recent = screen.getByRole('option', { name: 'Recent' });
      recent.focus();
      const arrowDown = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      });
      recent.dispatchEvent(arrowDown);

      expect(arrowDown.defaultPrevented).toBe(false);
      expect(input).toHaveAttribute('aria-activedescendant', apple.id);
    });
  });

  describe('controls in a dropdown rendered inside a combobox without an input', () => {
    async function openControlsDropdown() {
      const view = await render(InPlaceControlsWithListComponent);

      screen.getByTestId('combobox').focus();
      await userEvent.keyboard('{ArrowDown}');
      const dropdown = await screen.findByTestId('dropdown');

      // The select's own options are options as well.
      const [apple, banana] = within(screen.getByRole('listbox')).getAllByRole('option');
      await waitFor(() => {
        expect(apple).toHaveAttribute('data-active');
      });

      const filter = screen.getByRole<HTMLInputElement>('textbox', { name: 'Filter' });
      return {
        fixture: view.fixture,
        component: view.fixture.componentInstance,
        dropdown,
        filter,
        apple,
        banana,
      };
    }

    it('should navigate and select options inside the list from a text field', async () => {
      const { component, filter, banana } = await openControlsDropdown();

      filter.focus();
      await userEvent.keyboard('{ArrowDown}');

      await waitFor(() => {
        expect(banana).toHaveAttribute('data-active');
      });

      await userEvent.keyboard('{Enter}');

      expect(component.value()).toBe('Banana');
    });

    it('should move the active option back on ArrowUp from a text field', async () => {
      const { filter, apple, banana } = await openControlsDropdown();

      filter.focus();
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => {
        expect(banana).toHaveAttribute('data-active');
      });

      await userEvent.keyboard('{ArrowUp}');

      await waitFor(() => {
        expect(apple).toHaveAttribute('data-active');
      });
    });

    it('should close the dropdown on Escape from a text field', async () => {
      const { dropdown, filter } = await openControlsDropdown();

      filter.focus();
      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        expect(dropdown).not.toBeInTheDocument();
      });
    });

    it.each([
      ['Alt+ArrowDown', { key: 'ArrowDown', altKey: true }],
      ['Shift+ArrowDown', { key: 'ArrowDown', shiftKey: true }],
      ['Shift+Enter', { key: 'Enter', shiftKey: true }],
      ['Control+Enter', { key: 'Enter', ctrlKey: true }],
      ['Meta+Enter', { key: 'Enter', metaKey: true }],
      // Safari reports the Enter that commits an IME composition as Enter, not as Process.
      ['Enter that commits a composition', { key: 'Enter', isComposing: true }],
      ['Enter with the key code of a composition', { key: 'Enter', keyCode: 229 }],
    ])('should leave %s to a text field', async (_, init) => {
      const { component, filter, apple } = await openControlsDropdown();

      filter.focus();
      const keydown = new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true });
      filter.dispatchEvent(keydown);

      expect(keydown.defaultPrevented).toBe(false);
      expect(apple).toHaveAttribute('data-active');
      expect(component.value()).toBeUndefined();
    });

    it('should select the active option on Enter from a text field that prevents it', async () => {
      const { component } = await openControlsDropdown();

      screen.getByRole('textbox', { name: 'Form filter' }).focus();
      await userEvent.keyboard('{Enter}');

      expect(component.value()).toBe('Apple');
    });

    it.each([
      [' textbox ', 'Padded role filter'],
      ['searchbox extra', 'Fallback role filter'],
    ])(
      'should move the active option on ArrowDown from a text field with the role "%s"',
      async (role, name) => {
        const { fixture, apple, banana } = await openControlsDropdown();

        const filter = screen.getByLabelText(name);
        expect(filter.getAttribute('role')).toBe(role);
        filter.focus();
        await userEvent.keyboard('{ArrowDown}');
        await fixture.whenStable();

        expect(banana).toHaveAttribute('data-active');
        expect(apple).not.toHaveAttribute('data-active');
      },
    );

    it('should step a spin button on ArrowDown and not move the active option', async () => {
      const { fixture, apple, banana } = await openControlsDropdown();

      const quantity = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Quantity' });
      quantity.focus();
      await userEvent.keyboard('{ArrowDown}');
      await fixture.whenStable();

      expect(quantity).toHaveValue('4');
      expect(apple).toHaveAttribute('data-active');
      expect(banana).not.toHaveAttribute('data-active');
    });

    it('should leave Enter to a spin button and not select the active option', async () => {
      const { fixture, component, apple } = await openControlsDropdown();

      screen.getByRole('spinbutton', { name: 'Quantity' }).focus();
      await userEvent.keyboard('{Enter}');
      await fixture.whenStable();

      expect(component.value()).toBeUndefined();
      expect(apple).toHaveAttribute('data-active');
    });

    // Real key presses below: the browser, not a simulation, decides what a key does in a field.
    it('should type a space into a text field and stay open', async () => {
      const { dropdown, filter } = await openControlsDropdown();

      await browserUserEvent.click(filter);
      await browserUserEvent.keyboard('red apple');

      expect(filter).toHaveValue('red apple');
      expect(dropdown).toBeInTheDocument();
    });

    it('should leave Home and End to the caret of a text field', async () => {
      const { filter, apple } = await openControlsDropdown();

      await browserUserEvent.click(filter);
      await browserUserEvent.keyboard('abc{Home}x{End}y');

      expect(filter).toHaveValue('xabcy');
      expect(apple).toHaveAttribute('data-active');
    });

    it.each([
      ['a number field', 'Amount', 'ArrowDown'],
      ['a range slider', 'Volume', 'ArrowDown'],
      ['a textarea', 'Note', 'ArrowDown'],
      ['a textarea', 'Note', 'Enter'],
      ['a select', 'Sort', 'ArrowDown'],
      ['editable content', 'Comment', 'Enter'],
    ])('should leave the keys of %s alone (%s, %s)', async (_, label, key) => {
      const { component, apple } = await openControlsDropdown();

      const control = screen.getByLabelText(label);
      control.focus();
      const keydown = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      control.dispatchEvent(keydown);

      expect(keydown.defaultPrevented).toBe(false);
      expect(apple).toHaveAttribute('data-active');
      expect(component.value()).toBeUndefined();
    });

    it('should leave the keys of a field inside a web component alone', async () => {
      const { component, apple } = await openControlsDropdown();

      const field = screen.getByTestId('shadow-field').shadowRoot!.querySelector('input')!;
      field.focus();
      const keydown = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      field.dispatchEvent(keydown);

      expect(keydown.defaultPrevented).toBe(false);
      expect(apple).toHaveAttribute('data-active');
      expect(component.value()).toBeUndefined();
    });

    // Real pointer presses below: the browser, not a simulation, decides what a press focuses.
    it('should let a pressed field inside a web component take focus', async () => {
      await openControlsDropdown();
      const host = screen.getByTestId('shadow-field');

      await browserUserEvent.click(host);

      expect(host.shadowRoot!.activeElement).toBe(host.shadowRoot!.querySelector('input'));
    });

    it('should let a pressed select take focus', async () => {
      await openControlsDropdown();
      const select = screen.getByRole('combobox', { name: 'Sort' });

      await browserUserEvent.click(select);

      expect(select).toHaveFocus();
    });

    it('should let editable content take focus when a child of it is pressed', async () => {
      await openControlsDropdown();

      await browserUserEvent.click(screen.getByText('bold'));

      expect(screen.getByLabelText('Comment')).toHaveFocus();
    });

    it('should move a range slider on a press', async () => {
      await openControlsDropdown();
      const slider = screen.getByRole<HTMLInputElement>('slider', { name: 'Volume' });

      await browserUserEvent.click(slider);

      expect(slider.valueAsNumber).toBeGreaterThan(0);
    });
  });

  describe('a dropdown rendered inside the combobox without a list', () => {
    it('should navigate and select options from a field in the dropdown', async () => {
      const { fixture } = await render(InPlaceFilterWithoutListComponent);

      screen.getByTestId('combobox').focus();
      await userEvent.keyboard('{ArrowDown}');
      await screen.findByTestId('dropdown');

      const [apple, banana] = screen.getAllByRole('option');
      await waitFor(() => {
        expect(apple).toHaveAttribute('data-active');
      });

      screen.getByRole('textbox', { name: 'Filter' }).focus();
      await userEvent.keyboard('{ArrowDown}');

      await waitFor(() => {
        expect(banana).toHaveAttribute('data-active');
      });

      await userEvent.keyboard('{Enter}');

      expect(fixture.componentInstance.value()).toBe('Banana');
    });
  });
});
