import { Component, Directive, input, signal, viewChild } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { NgpComboboxButton } from '../../combobox-button/combobox-button';
import { NgpComboboxDropdown } from '../../combobox-dropdown/combobox-dropdown';
import { NgpComboboxInput } from '../../combobox-input/combobox-input';
import { NgpComboboxOption } from '../../combobox-option/combobox-option';
import { NgpComboboxPortal } from '../../combobox-portal/combobox-portal';
import { NgpCombobox } from '../combobox';
import { injectComboboxState } from '../combobox-state';

interface Item {
  id: number;
  label: string;
}

const compareById = (a: Item | undefined, b: Item | undefined) => a?.id === b?.id;

@Directive({
  selector: '[appCombobox]',
  hostDirectives: [
    {
      directive: NgpCombobox,
      inputs: [
        'ngpComboboxValue: value',
        'ngpComboboxMultiple: multiple',
        'ngpComboboxDisabled: disabled',
        'ngpComboboxCompareWith: compareWith',
        'ngpComboboxDropdownPlacement: placement',
      ],
      outputs: ['ngpComboboxValueChange: valueChange', 'ngpComboboxOpenChange: openChange'],
    },
  ],
})
class ComposedCombobox {
  readonly state = injectComboboxState();
}

@Directive({
  selector: '[appComboboxDropdown]',
  hostDirectives: [{ directive: NgpComboboxDropdown, inputs: ['id'] }],
})
class ComposedDropdown {}

@Directive({
  selector: '[appComboboxOption]',
  hostDirectives: [
    {
      directive: NgpComboboxOption,
      inputs: ['ngpComboboxOptionValue: value', 'ngpComboboxOptionDisabled: disabled'],
      outputs: ['ngpComboboxOptionActivated: activated'],
    },
  ],
})
class ComposedOption {}

@Component({
  imports: [
    ComposedCombobox,
    ComposedDropdown,
    ComposedOption,
    NgpComboboxButton,
    NgpComboboxPortal,
  ],
  template: `
    <div
      [value]="value()"
      [multiple]="multiple()"
      [compareWith]="compareWith"
      [placement]="placement()"
      (valueChange)="value.set($event)"
      (openChange)="openChanges.push($event)"
      appCombobox
      data-testid="root"
      style="width: 240px"
    >
      <button ngpComboboxButton data-testid="button">Toggle</button>
      <div *ngpComboboxPortal appComboboxDropdown style="position: absolute">
        @for (item of items; track item.id) {
          <div
            [value]="item"
            [disabled]="item.id === disabledId()"
            (activated)="activated.push(item.id)"
            appComboboxOption
          >
            {{ item.label }}
          </div>
        }
      </div>
    </div>
  `,
})
class ComposedHost {
  readonly combobox = viewChild.required(ComposedCombobox);
  readonly value = signal<Item | Item[] | undefined>(undefined);
  readonly multiple = signal(false);
  readonly placement = signal<'bottom-start' | 'top-start'>('bottom-start');
  readonly disabledId = signal<number | null>(null);
  readonly compareWith = compareById;
  readonly openChanges: boolean[] = [];
  readonly activated: number[] = [];
  readonly items: Item[] = [
    { id: 1, label: 'One' },
    { id: 2, label: 'Two' },
    { id: 3, label: 'Three' },
  ];
}

function option(label: string): HTMLElement {
  return screen.getByText(label).closest('[role="option"]') as HTMLElement;
}

function removeLingeringDropdown() {
  screen.queryByRole('listbox')?.remove();
}

describe('NgpCombobox composed through hostDirectives', () => {
  afterEach(removeLingeringDropdown);

  it('forwards aliased inputs and outputs for selection and open state', async () => {
    const { fixture } = await render(ComposedHost);
    const host = fixture.componentInstance;

    await userEvent.click(screen.getByTestId('button'));
    await waitFor(() => expect(screen.getByTestId('root')).toHaveAttribute('data-open'));
    expect(host.openChanges).toEqual([true]);

    await userEvent.click(screen.getByText('Two'));
    expect(host.value()).toEqual({ id: 2, label: 'Two' });
    expect(host.activated).toEqual([2]);

    await waitFor(() => expect(screen.getByTestId('root')).not.toHaveAttribute('data-open'));
    expect(host.openChanges).toEqual([true, false]);
  });
});

describe('NgpCombobox compareWith', () => {
  afterEach(removeLingeringDropdown);

  it('marks an option selected when the value is an equal but distinct object', async () => {
    const { fixture } = await render(ComposedHost);
    fixture.componentInstance.value.set({ id: 2, label: 'Two' });
    fixture.detectChanges();

    await userEvent.click(screen.getByTestId('button'));

    expect(option('Two')).toHaveAttribute('aria-selected', 'true');
    expect(option('Two')).toHaveAttribute('data-selected');
    expect(option('Two')).toHaveAttribute('data-active');
    expect(option('One')).not.toHaveAttribute('data-selected');
  });

  it('deselects by comparator in multiple mode', async () => {
    const { fixture } = await render(ComposedHost);
    const host = fixture.componentInstance;
    host.multiple.set(true);
    host.value.set([
      { id: 1, label: 'One' },
      { id: 3, label: 'Three' },
    ]);
    fixture.detectChanges();

    await userEvent.click(screen.getByTestId('button'));
    await userEvent.click(screen.getByText('One'));

    expect(host.value()).toEqual([{ id: 3, label: 'Three' }]);
    expect(option('One')).not.toHaveAttribute('data-selected');
  });
});

describe('NgpComboboxOption disabled', () => {
  afterEach(removeLingeringDropdown);

  it('does not select or emit activated when a disabled option is clicked', async () => {
    const { fixture } = await render(ComposedHost);
    const host = fixture.componentInstance;
    host.disabledId.set(2);
    fixture.detectChanges();

    await userEvent.click(screen.getByTestId('button'));
    expect(option('Two')).toHaveAttribute('data-disabled');

    await userEvent.click(screen.getByText('Two'));

    expect(host.value()).toBeUndefined();
    expect(host.activated).toEqual([]);
    expect(screen.getByTestId('root')).toHaveAttribute('data-open');
  });

  it('skips disabled options during keyboard navigation', async () => {
    const { fixture } = await render(ComposedHost);
    fixture.componentInstance.disabledId.set(2);
    fixture.detectChanges();

    const root = screen.getByTestId('root');
    root.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(option('One')).toHaveAttribute('data-active'));

    await userEvent.keyboard('{ArrowDown}');
    expect(option('Two')).not.toHaveAttribute('data-active');
    expect(option('Three')).toHaveAttribute('data-active');
  });
});

describe('NgpCombobox programmatic state API', () => {
  afterEach(removeLingeringDropdown);

  it('opens, closes and toggles the dropdown, emitting openChange each time', async () => {
    const { fixture } = await render(ComposedHost);
    const host = fixture.componentInstance;
    const state = host.combobox().state();

    await state.openDropdown();
    fixture.detectChanges();
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    state.closeDropdown();
    fixture.detectChanges();
    await waitFor(() => expect(screen.getByTestId('root')).not.toHaveAttribute('data-open'));

    await state.toggleDropdown();
    fixture.detectChanges();
    expect(screen.getByTestId('root')).toHaveAttribute('data-open');

    expect(host.openChanges).toEqual([true, false, true]);
  });

  it('exposes the active option through activeDescendantManager index, id and reset', async () => {
    const { fixture } = await render(ComposedHost);
    const state = fixture.componentInstance.combobox().state();

    await state.openDropdown();
    fixture.detectChanges();

    state.activeDescendantManager.activateByIndex(2, { origin: 'keyboard' });
    fixture.detectChanges();
    expect(state.activeDescendantManager.index()).toBe(2);
    expect(state.activeDescendantManager.id()).toBe(option('Three').id);
    expect(option('Three')).toHaveAttribute('data-active');

    state.activeDescendantManager.reset();
    fixture.detectChanges();
    expect(state.activeDescendantManager.index()).toBe(-1);
    expect(option('Three')).not.toHaveAttribute('data-active');
  });

  it('selects the programmatically activated option on Enter', async () => {
    const { fixture } = await render(ComposedHost);
    const host = fixture.componentInstance;
    const state = host.combobox().state();

    screen.getByTestId('root').focus();
    await state.openDropdown();
    state.activeDescendantManager.activateByIndex(2, { origin: 'keyboard' });
    fixture.detectChanges();

    await userEvent.keyboard('{Enter}');

    expect(host.value()).toEqual({ id: 3, label: 'Three' });
  });

  it('ignores pointerenter shortly after a keyboard-origin activation', async () => {
    const { fixture } = await render(ComposedHost);
    const state = fixture.componentInstance.combobox().state();

    await state.openDropdown();
    state.activeDescendantManager.activateByIndex(2, { origin: 'keyboard' });
    fixture.detectChanges();

    fireEvent.pointerEnter(option('One'));
    fixture.detectChanges();

    expect(option('Three')).toHaveAttribute('data-active');
    expect(option('One')).not.toHaveAttribute('data-active');
  });
});

describe('NgpComboboxOption pointer interaction', () => {
  afterEach(removeLingeringDropdown);

  it('activates on pointerenter and clears the active option on pointerleave', async () => {
    const { fixture } = await render(ComposedHost);
    await userEvent.click(screen.getByTestId('button'));

    fireEvent.pointerEnter(option('Two'));
    fixture.detectChanges();
    expect(option('Two')).toHaveAttribute('data-active');

    fireEvent.pointerLeave(option('Two'));
    fixture.detectChanges();
    expect(option('Two')).not.toHaveAttribute('data-active');
    expect(fixture.componentInstance.combobox().state().activeDescendantManager.index()).toBe(-1);
  });
});

describe('NgpComboboxDropdown positioning', () => {
  afterEach(removeLingeringDropdown);

  it('exposes width, available height and transform origin as CSS variables', async () => {
    await render(ComposedHost);
    await userEvent.click(screen.getByTestId('button'));

    const dropdown = screen.getByRole('listbox');
    await waitFor(() => {
      expect(dropdown.style.getPropertyValue('--ngp-combobox-width')).toBe('240px');
      expect(
        parseFloat(dropdown.style.getPropertyValue('--ngp-combobox-available-height')),
      ).toBeGreaterThan(0);
      expect(dropdown.style.getPropertyValue('--ngp-combobox-transform-origin')).not.toBe('');
    });
  });

  it('places the dropdown above the combobox for a top placement', async () => {
    const { fixture } = await render(ComposedHost);
    const root = screen.getByTestId('root');
    root.style.marginTop = '300px';
    fixture.componentInstance.placement.set('top-start');
    fixture.detectChanges();

    await userEvent.click(screen.getByTestId('button'));

    const dropdown = screen.getByRole('listbox');
    await waitFor(() => {
      const dropdownRect = dropdown.getBoundingClientRect();
      expect(dropdownRect.bottom).toBeLessThanOrEqual(root.getBoundingClientRect().top + 1);
      expect(Math.round(dropdownRect.left)).toBe(Math.round(root.getBoundingClientRect().left));
    });
  });
});

@Component({
  imports: [
    NgpCombobox,
    NgpComboboxButton,
    NgpComboboxDropdown,
    NgpComboboxInput,
    NgpComboboxOption,
    NgpComboboxPortal,
  ],
  template: `
    <div
      [ngpComboboxValue]="value()"
      (ngpComboboxValueChange)="value.set($event)"
      ngpCombobox
      data-testid="root"
    >
      <input [readonly]="readonly()" ngpComboboxInput data-testid="input" value="Apple" />
      <button ngpComboboxButton data-testid="button">Toggle</button>
      <div *ngpComboboxPortal ngpComboboxDropdown>
        <input data-testid="dropdown-search" />
        @for (option of options; track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>{{ option }}</div>
        }
      </div>
    </div>
    <button data-testid="outside">Outside</button>
  `,
})
class InputHost {
  readonly value = signal<string | undefined>(undefined);
  readonly readonly = input(false);
  readonly options = ['Apple', 'Banana', 'Cherry'];
}

describe('NgpComboboxInput and NgpComboboxButton', () => {
  afterEach(removeLingeringDropdown);

  it('keeps the root and the button out of the tab order when an input is present', async () => {
    await render(InputHost);
    const button = screen.getByTestId('button');

    expect(screen.getByTestId('root')).toHaveAttribute('tabindex', '-1');
    expect(button).toHaveAttribute('tabindex', '-1');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('focuses the input after the button toggles the dropdown', async () => {
    await render(InputHost);
    const button = screen.getByTestId('button');

    await userEvent.click(button);

    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'true'));
    expect(button).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
    expect(document.activeElement).toBe(screen.getByTestId('input'));
  });

  it('selects the whole input text on programmatic focus but not on pointer focus', async () => {
    await render(InputHost);
    const input = screen.getByTestId('input') as HTMLInputElement;

    input.focus();
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 5]);

    input.blur();
    input.setSelectionRange(2, 2);
    fireEvent.pointerDown(input);
    input.focus();
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 2]);
  });

  it('opens the dropdown on Backspace when the input has text', async () => {
    await render(InputHost);
    const input = screen.getByTestId('input');

    input.focus();
    await userEvent.keyboard('{End}{Backspace}');

    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
  });

  it('supports arrow navigation and Enter selection on a readonly input', async () => {
    const { fixture } = await render(InputHost, { inputs: { readonly: true } });
    const input = screen.getByTestId('input');

    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.keyboard('{ArrowDown}');

    expect(input).toHaveAttribute('aria-activedescendant', option('Banana').id);

    await userEvent.keyboard('{Enter}');
    expect(fixture.componentInstance.value()).toBe('Banana');
  });

  it('stays open when focus moves from the input into the dropdown', async () => {
    await render(InputHost);
    const input = screen.getByTestId('input');

    await userEvent.click(screen.getByTestId('button'));
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.click(screen.getByTestId('dropdown-search'));
    // give an async close a chance to land before asserting it did not happen
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(document.activeElement).toBe(screen.getByTestId('dropdown-search'));
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes when focus leaves the input for an element outside the combobox', async () => {
    await render(InputHost);
    const input = screen.getByTestId('input');

    await userEvent.click(screen.getByTestId('button'));
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));

    await userEvent.tab();

    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'));
    expect(document.activeElement).toBe(screen.getByTestId('outside'));
  });
});
