import { Component } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { NgpAutocompleteButton } from '../../autocomplete-button/autocomplete-button';
import { NgpAutocompleteDropdown } from '../../autocomplete-dropdown/autocomplete-dropdown';
import { NgpAutocompleteInput } from '../../autocomplete-input/autocomplete-input';
import { NgpAutocompleteOption } from '../../autocomplete-option/autocomplete-option';
import { NgpAutocompletePortal } from '../../autocomplete-portal/autocomplete-portal';
import { NgpAutocomplete } from '../autocomplete';

@Component({
  imports: [
    NgpAutocomplete,
    NgpAutocompleteButton,
    NgpAutocompleteDropdown,
    NgpAutocompleteInput,
    NgpAutocompleteOption,
    NgpAutocompletePortal,
  ],
  template: `
    <div ngpAutocomplete>
      <input ngpAutocompleteInput data-testid="input" />
      <button ngpAutocompleteButton data-testid="button">Toggle</button>

      <div *ngpAutocompletePortal ngpAutocompleteDropdown data-testid="dropdown">
        <p data-testid="note">Pick a fruit</p>
        <input data-testid="field" aria-label="Note" />
        @for (option of options; track option) {
          <div [ngpAutocompleteOptionValue]="option" ngpAutocompleteOption>{{ option }}</div>
        }
      </div>
    </div>
  `,
})
class AutocompleteHost {
  readonly options = ['Apple', 'Banana', 'Cherry'];
}

const byId = (id: string) => screen.getByTestId(id);

/** A press aimed before the overlay is positioned lands outside it once it moves. */
async function open(): Promise<HTMLElement> {
  await userEvent.click(byId('button'));
  await waitFor(() => expect(byId('dropdown').style.top).not.toBe(''));
  const input = byId('input');
  await waitFor(() => expect(input).toHaveFocus());
  return input;
}

async function expectOpenAfterASettle(): Promise<void> {
  // give a blur-driven close the chance to land before asserting it did not happen
  await new Promise(resolve => setTimeout(resolve, 50));
  expect(screen.queryByTestId('dropdown')).toBeInTheDocument();
}

describe('NgpAutocomplete press inside the dropdown', () => {
  afterEach(async () => {
    // the real pointer stays where a test left it, across files: park it away from fixtures
    const corner = document.body.appendChild(document.createElement('div'));
    corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;';
    await userEvent.hover(corner);
    corner.remove();
  });

  it('stays open and keeps focus on the input when non-focusable content is pressed', async () => {
    await render(AutocompleteHost);
    const input = await open();

    await userEvent.click(byId('note'));

    await expectOpenAfterASettle();
    expect(input).toHaveFocus();
  });

  it('lets a text field inside the dropdown take focus', async () => {
    await render(AutocompleteHost);
    await open();

    await userEvent.click(byId('field'));

    await expectOpenAfterASettle();
    expect(byId('field')).toHaveFocus();
  });

  it('closes from the button, with focus still on the input', async () => {
    await render(AutocompleteHost);
    const input = await open();

    await userEvent.click(byId('button'));

    await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
    expect(input).toHaveFocus();
  });
});
