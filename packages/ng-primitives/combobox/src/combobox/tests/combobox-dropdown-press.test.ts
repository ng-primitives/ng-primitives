import { Component, input, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { NgpComboboxButton } from '../../combobox-button/combobox-button';
import { NgpComboboxDropdown } from '../../combobox-dropdown/combobox-dropdown';
import { NgpComboboxInput } from '../../combobox-input/combobox-input';
import { NgpComboboxOption } from '../../combobox-option/combobox-option';
import { NgpComboboxPortal } from '../../combobox-portal/combobox-portal';
import { NgpCombobox } from '../combobox';

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
      [(ngpComboboxValue)]="value"
      [ngpComboboxDropdownContainer]="inPlace() ? inside : 'body'"
      ngpCombobox
      ngpComboboxMultiple
    >
      <input ngpComboboxInput data-testid="input" />
      <button ngpComboboxButton data-testid="button">Toggle</button>
      <div #inside></div>

      <div *ngpComboboxPortal ngpComboboxDropdown data-testid="dropdown">
        <!-- buttons above the options, kept out of the arrow-key navigation -->
        <div style="display: flex; gap: 24px" data-testid="toolbar">
          <button (click)="resets.set(resets() + 1)" data-testid="reset">Reset selection</button>
          <button data-testid="only-selected">Show only selected</button>
        </div>
        <p data-testid="note">Pick a fruit</p>
        <input data-testid="field" aria-label="Note" />
        <input type="checkbox" data-testid="checkbox" aria-label="Only in stock" />
        @for (option of options; track option) {
          <div
            [ngpComboboxOptionValue]="option"
            [attr.data-testid]="'option-' + option"
            ngpComboboxOption
          >
            {{ option }}
          </div>
        }
      </div>
    </div>
    <button data-testid="outside">Outside</button>
  `,
})
class ComboboxHost {
  readonly inPlace = input(false);
  readonly value = signal<string[]>([]);
  readonly resets = signal(0);
  readonly options = ['Apple', 'Banana', 'Cherry'];
}

@Component({
  imports: [NgpCombobox, NgpComboboxDropdown, NgpComboboxOption, NgpComboboxPortal],
  template: `
    <div [(ngpComboboxValue)]="value" ngpCombobox data-testid="combobox">
      {{ value() ?? 'Pick one' }}

      <div *ngpComboboxPortal ngpComboboxDropdown data-testid="dropdown">
        <p data-testid="note">Pick a fruit</p>
        @for (option of options; track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>{{ option }}</div>
        }
      </div>
    </div>
  `,
})
class ComboboxWithoutInputHost {
  readonly value = signal<string | undefined>(undefined);
  readonly options = ['Apple', 'Banana', 'Cherry'];
}

const byId = (id: string) => screen.getByTestId(id);

/** A press aimed before the overlay is positioned lands outside it once it moves. */
async function waitForPosition(): Promise<void> {
  await waitFor(() => expect(screen.getByTestId('dropdown').style.top).not.toBe(''));
}

async function open(): Promise<HTMLElement> {
  await userEvent.click(byId('button'));
  await waitForPosition();
  const comboboxInput = byId('input');
  await waitFor(() => expect(comboboxInput).toHaveFocus());
  return comboboxInput;
}

async function expectOpenAfterASettle(): Promise<void> {
  // give a blur-driven close the chance to land before asserting it did not happen
  await new Promise(resolve => setTimeout(resolve, 50));
  expect(screen.queryByTestId('dropdown')).toBeInTheDocument();
}

describe('NgpCombobox press inside the dropdown', () => {
  it('stays open and keeps focus on the input when non-focusable content is pressed', async () => {
    await render(ComboboxHost);
    const comboboxInput = await open();

    await userEvent.click(byId('note'));

    await expectOpenAfterASettle();
    expect(comboboxInput).toHaveFocus();

    const before = comboboxInput.getAttribute('aria-activedescendant');
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      const after = comboboxInput.getAttribute('aria-activedescendant');
      expect(after).toBeTruthy();
      expect(after).not.toBe(before);
    });
  });

  it('stays open when the press lands between two buttons', async () => {
    await render(ComboboxHost);
    const comboboxInput = await open();
    const reset = byId('reset');

    await userEvent.click(byId('toolbar'), { position: { x: reset.offsetWidth + 12, y: 4 } });

    await expectOpenAfterASettle();
    expect(comboboxInput).toHaveFocus();
  });

  it('runs a button and stays open, with focus still on the input', async () => {
    const { fixture } = await render(ComboboxHost);
    const comboboxInput = await open();

    await userEvent.click(byId('reset'));

    await expectOpenAfterASettle();
    expect(fixture.componentInstance.resets()).toBe(1);
    expect(comboboxInput).toHaveFocus();
  });

  it('keeps focus on the input when an option is pressed', async () => {
    const { fixture } = await render(ComboboxHost);
    const comboboxInput = await open();

    await userEvent.click(byId('option-Banana'));

    await waitFor(() => expect(fixture.componentInstance.value()).toEqual(['Banana']));
    expect(comboboxInput).toHaveFocus();
  });

  it('toggles a checkbox and stays open, with focus still on the input', async () => {
    await render(ComboboxHost);
    const comboboxInput = await open();

    await userEvent.click(byId('checkbox'));

    await expectOpenAfterASettle();
    expect(byId('checkbox')).toBeChecked();
    expect(comboboxInput).toHaveFocus();
  });

  it('lets a text field inside the dropdown take focus', async () => {
    await render(ComboboxHost);
    await open();

    await userEvent.click(byId('field'));

    await expectOpenAfterASettle();
    expect(byId('field')).toHaveFocus();
  });

  it('stays open when the dropdown is rendered inside the combobox', async () => {
    await render(ComboboxHost, { inputs: { inPlace: true } });
    const comboboxInput = await open();

    await userEvent.click(byId('note'));

    await expectOpenAfterASettle();
    expect(comboboxInput).toHaveFocus();
  });

  it('stays open and keeps focus on the combobox without an input', async () => {
    await render(ComboboxWithoutInputHost);
    const combobox = byId('combobox');
    combobox.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitForPosition();

    await userEvent.click(byId('note'));

    await expectOpenAfterASettle();
    expect(combobox).toHaveFocus();
  });

  it('still closes on an outside click', async () => {
    await render(ComboboxHost);
    await open();

    await userEvent.click(byId('outside'));

    await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
  });
});
