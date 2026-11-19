import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectInput,
  NgpSelectList,
  NgpSelectOption,
  NgpSelectPortal,
} from '../../index';

const imports = [
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectInput,
  NgpSelectList,
  NgpSelectOption,
  NgpSelectPortal,
];

@Component({
  template: `
    <div [(ngpSelectValue)]="value" ngpSelect data-testid="select">
      {{ value() ?? 'Pick one' }}

      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <!-- buttons above the options, kept out of the arrow-key navigation -->
        <div style="display: flex; gap: 24px" data-testid="toolbar">
          <button (click)="resets.set(resets() + 1)" data-testid="reset">Reset selection</button>
          <button data-testid="only-selected">Show only selected</button>
        </div>
        <p data-testid="note">Pick a fruit</p>
        <input data-testid="field" aria-label="Note" />
        <input type="checkbox" data-testid="checkbox" aria-label="Only in stock" />
        @for (option of options; track option) {
          <div [ngpSelectOptionValue]="option" ngpSelectOption>{{ option }}</div>
        }
      </div>
    </div>
    <button data-testid="outside">Outside</button>
  `,
  imports,
})
class SelectHost {
  readonly value = signal<string | undefined>(undefined);
  readonly resets = signal(0);
  readonly options = ['Apple', 'Banana', 'Cherry'];
}

@Component({
  template: `
    <div [(ngpSelectValue)]="value" ngpSelect ngpSelectMultiple data-testid="select">
      {{ value().join(', ') || 'Pick some' }}

      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <input ngpSelectInput data-testid="search" />
        <!-- buttons above the options, kept out of the arrow-key navigation -->
        <div style="display: flex; gap: 24px" data-testid="toolbar">
          <button (click)="resets.set(resets() + 1)" data-testid="reset">Reset selection</button>
          <button data-testid="only-selected">Show only selected</button>
        </div>
        <p data-testid="note">Pick a fruit</p>
        <div ngpSelectList>
          @for (option of options; track option) {
            <div
              [ngpSelectOptionValue]="option"
              [attr.data-testid]="'option-' + option"
              ngpSelectOption
            >
              {{ option }}
            </div>
          }
        </div>
      </div>
    </div>
    <button data-testid="outside">Outside</button>
  `,
  imports,
})
class SelectWithInputHost {
  readonly value = signal<string[]>([]);
  readonly resets = signal(0);
  readonly options = ['Apple', 'Banana', 'Cherry'];
}

@Component({
  template: `
    <div
      [(ngpSelectValue)]="value"
      [ngpSelectDropdownContainer]="inside"
      ngpSelect
      data-testid="select"
    >
      {{ value() ?? 'Pick one' }}
      <div #inside></div>

      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <p data-testid="note">Pick a fruit</p>
        @for (option of options; track option) {
          <div
            [ngpSelectOptionValue]="option"
            [attr.data-testid]="'option-' + option"
            ngpSelectOption
          >
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
  imports,
})
class SelectInPlaceHost {
  readonly value = signal<string | undefined>(undefined);
  readonly options = ['Apple', 'Banana', 'Cherry'];
}

const byId = (id: string) => screen.getByTestId(id);

async function open(): Promise<void> {
  await userEvent.click(byId('select'));
  await waitForPosition();
}

/** A press aimed before the overlay is positioned lands outside it once it moves. */
async function waitForPosition(): Promise<void> {
  await waitFor(() => expect(screen.getByTestId('dropdown').style.top).not.toBe(''));
}

async function expectOpenAfterASettle(): Promise<void> {
  // give a blur-driven close the chance to land before asserting it did not happen
  await new Promise(resolve => setTimeout(resolve, 50));
  expect(screen.queryByTestId('dropdown')).toBeInTheDocument();
}

async function expectArrowDownToMoveTheActiveOption(control: HTMLElement): Promise<void> {
  const before = control.getAttribute('aria-activedescendant');
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => {
    const after = control.getAttribute('aria-activedescendant');
    expect(after).toBeTruthy();
    expect(after).not.toBe(before);
  });
}

/** Press the toolbar between its two buttons, where a slightly missed click lands. */
async function pressBetweenToolbarButtons(): Promise<void> {
  const reset = byId('reset');
  await userEvent.click(byId('toolbar'), { position: { x: reset.offsetWidth + 12, y: 4 } });
}

describe('NgpSelect press inside the dropdown', () => {
  describe('without an input', () => {
    it('stays open and keeps focus on the select when non-focusable content is pressed', async () => {
      await render(SelectHost);
      await open();
      const select = byId('select');

      await userEvent.click(byId('note'));

      await expectOpenAfterASettle();
      expect(select).toHaveFocus();
      await expectArrowDownToMoveTheActiveOption(select);
    });

    it('stays open when the press lands between two buttons', async () => {
      await render(SelectHost);
      await open();

      await pressBetweenToolbarButtons();

      await expectOpenAfterASettle();
      expect(byId('select')).toHaveFocus();
    });

    it('runs a button and stays open, with focus still on the select', async () => {
      const { fixture } = await render(SelectHost);
      await open();

      await userEvent.click(byId('reset'));

      await expectOpenAfterASettle();
      expect(fixture.componentInstance.resets()).toBe(1);
      expect(byId('select')).toHaveFocus();
    });

    it('toggles a checkbox and stays open, with focus still on the select', async () => {
      await render(SelectHost);
      await open();

      await userEvent.click(byId('checkbox'));

      await expectOpenAfterASettle();
      expect(byId('checkbox')).toBeChecked();
      expect(byId('select')).toHaveFocus();
    });

    it('lets a text field inside the dropdown take focus', async () => {
      await render(SelectHost);
      await open();

      await userEvent.click(byId('field'));

      await expectOpenAfterASettle();
      expect(byId('field')).toHaveFocus();
    });

    it('still closes on an outside click', async () => {
      await render(SelectHost);
      await open();

      await userEvent.click(byId('outside'));

      await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
    });
  });

  describe('with an input', () => {
    async function openOnSearch(): Promise<HTMLElement> {
      await open();
      const search = byId('search');
      await waitFor(() => expect(search).toHaveFocus());
      return search;
    }

    it('stays open and keeps focus on the input when non-focusable content is pressed', async () => {
      await render(SelectWithInputHost);
      const search = await openOnSearch();

      await userEvent.click(byId('note'));

      await expectOpenAfterASettle();
      expect(search).toHaveFocus();
      await expectArrowDownToMoveTheActiveOption(search);
    });

    it('stays open when the press lands between two buttons', async () => {
      await render(SelectWithInputHost);
      const search = await openOnSearch();

      await pressBetweenToolbarButtons();

      await expectOpenAfterASettle();
      expect(search).toHaveFocus();
    });

    it('runs a button and stays open, with focus still on the input', async () => {
      const { fixture } = await render(SelectWithInputHost);
      const search = await openOnSearch();

      await userEvent.click(byId('reset'));

      await expectOpenAfterASettle();
      expect(fixture.componentInstance.resets()).toBe(1);
      expect(search).toHaveFocus();
    });

    it('keeps focus on the input when an option is pressed', async () => {
      const { fixture } = await render(SelectWithInputHost);
      const search = await openOnSearch();

      await userEvent.click(byId('option-Banana'));

      await waitFor(() => expect(fixture.componentInstance.value()).toEqual(['Banana']));
      expect(search).toHaveFocus();
    });

    it('still closes on an outside click', async () => {
      await render(SelectWithInputHost);
      await openOnSearch();

      await userEvent.click(byId('outside'));

      await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
    });
  });

  describe('rendered inside the select', () => {
    it('stays open when non-focusable content is pressed', async () => {
      await render(SelectInPlaceHost);
      await open();

      await userEvent.click(byId('note'));

      await expectOpenAfterASettle();
      expect(byId('select')).toHaveFocus();
    });

    it('selects a pressed option and closes', async () => {
      const { fixture } = await render(SelectInPlaceHost);
      await open();

      await userEvent.click(byId('option-Banana'));

      await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
      expect(fixture.componentInstance.value()).toBe('Banana');
    });
  });
});
