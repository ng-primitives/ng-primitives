import { Component, computed, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { NgpAutocompleteDropdown } from '../../autocomplete-dropdown/autocomplete-dropdown';
import { createFragmentMatcher } from '../../autocomplete-input/autocomplete-fragment';
import { NgpAutocompleteInput } from '../../autocomplete-input/autocomplete-input';
import { NgpAutocompleteOption } from '../../autocomplete-option/autocomplete-option';
import { NgpAutocompletePortal } from '../../autocomplete-portal/autocomplete-portal';
import { NgpAutocomplete } from '../autocomplete';

const imports = [
  NgpAutocomplete,
  NgpAutocompleteDropdown,
  NgpAutocompleteInput,
  NgpAutocompleteOption,
  NgpAutocompletePortal,
];

@Component({
  imports,
  template: `
    <div
      (ngpAutocompleteSelected)="onSelected($event)"
      (ngpAutocompleteActiveValueChange)="active.set($event)"
      ngpAutocomplete
      ngpAutocompleteAutoActivate
    >
      <input
        [value]="query()"
        [ngpAutocompleteInputSuggestion]="active()"
        (input)="query.set($any($event.target).value)"
        ngpAutocompleteInput
      />

      <div *ngpAutocompletePortal ngpAutocompleteDropdown>
        @for (country of filtered(); track country) {
          <div [ngpAutocompleteOptionValue]="country" ngpAutocompleteOption>{{ country }}</div>
        }
      </div>
    </div>
  `,
})
class HighlightComponent {
  readonly query = signal('');
  readonly active = signal<string | undefined>(undefined);
  readonly contains = signal(false);
  readonly selections: string[] = [];
  readonly countries = ['France', 'French Guiana', 'Germany', 'Ghana'];
  readonly filtered = computed(() => {
    const query = this.query().toLowerCase();
    return this.countries.filter(country =>
      this.contains()
        ? country.toLowerCase().includes(query)
        : country.toLowerCase().startsWith(query),
    );
  });

  onSelected(country: string) {
    this.selections.push(country);
    this.query.set(country);
  }
}

@Component({
  imports,
  template: `
    <div
      (ngpAutocompleteSelected)="field.replaceFragment('@' + $event + ' ')"
      (ngpAutocompleteActiveValueChange)="active.set($event)"
      ngpAutocomplete
      ngpAutocompleteAutoActivate
    >
      <textarea
        #field="ngpAutocompleteInput"
        [ngpAutocompleteInputFragmentMatcher]="mention"
        [ngpAutocompleteInputSuggestion]="active()"
        (ngpAutocompleteInputFragmentChange)="query.set($event?.query ?? '')"
        data-testid="message"
        ngpAutocompleteInput
      ></textarea>

      <div *ngpAutocompletePortal ngpAutocompleteDropdown>
        @for (person of people(); track person) {
          <div [ngpAutocompleteOptionValue]="person" ngpAutocompleteOption>{{ person }}</div>
        }
      </div>
    </div>
  `,
})
class MentionHighlightComponent {
  readonly mention = createFragmentMatcher('@');
  readonly query = signal('');
  readonly active = signal<string | undefined>(undefined);
  readonly everyone = ['Marty', 'Marvin', 'Doc'];
  readonly people = computed(() =>
    this.everyone.filter(person => person.toLowerCase().startsWith(this.query().toLowerCase())),
  );
}

function expectCompletion(
  input: HTMLInputElement | HTMLTextAreaElement,
  value: string,
  start: number,
) {
  return waitFor(() => {
    expect(input.value).toBe(value);
    expect(input.selectionStart).toBe(start);
    expect(input.selectionEnd).toBe(value.length);
  });
}

describe('NgpAutocomplete highlight mode', () => {
  afterEach(() => {
    screen.queryByRole('listbox')?.remove();
  });

  it('should complete the typed text with the suggestion and select the rest', async () => {
    await render(HighlightComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('fr');

    await expectCompletion(input, 'france', 2);
    expect(input).toHaveAttribute('aria-autocomplete', 'both');
  });

  it('should replace the completion with the next typed character', async () => {
    const { fixture } = await render(HighlightComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('fr');
    await expectCompletion(input, 'france', 2);

    await userEvent.keyboard('e');

    expect(fixture.componentInstance.query()).toBe('fre');
    await expectCompletion(input, 'french Guiana', 3);
  });

  it('should not complete again after a deletion', async () => {
    const { fixture } = await render(HighlightComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('fr');
    await expectCompletion(input, 'france', 2);

    await userEvent.keyboard('{Backspace}');
    await fixture.whenStable();

    expect(input.value).toBe('fr');
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(2);
  });

  it('should show the completion of the option reached with the arrow keys', async () => {
    await render(HighlightComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('fr');
    await expectCompletion(input, 'france', 2);

    await userEvent.keyboard('{arrowdown}');

    await expectCompletion(input, 'french Guiana', 2);
  });

  it('should show the whole label of the active option when nothing is typed', async () => {
    await render(HighlightComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('{arrowdown}');

    await expectCompletion(input, 'France', 0);
  });

  it('should keep the typed text when the suggestion does not start with it', async () => {
    const { fixture } = await render(HighlightComponent);
    fixture.componentInstance.contains.set(true);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('an');

    // France is active, it contains "an" but does not start with it
    await waitFor(() => expect(fixture.componentInstance.active()).toBe('France'));
    await fixture.whenStable();
    expect(input.value).toBe('an');
  });

  it('should activate the completed option with Enter and let the consumer write its label', async () => {
    const { fixture } = await render(HighlightComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('fr');
    await expectCompletion(input, 'france', 2);

    await userEvent.keyboard('{enter}');

    expect(fixture.componentInstance.selections).toEqual(['France']);
    await waitFor(() => expect(input.value).toBe('France'));
  });

  it('should keep the label written on selection when it matches the completion exactly', async () => {
    const { fixture } = await render(HighlightComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('Fr');
    await expectCompletion(input, 'France', 2);

    await userEvent.keyboard('{enter}');
    // the overlay closes asynchronously, and closing is when a completion would be undone
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await fixture.whenStable();

    expect(fixture.componentInstance.selections).toEqual(['France']);
    expect(input.value).toBe('France');
  });

  it('should keep a label the consumer writes straight into the input on selection', async () => {
    @Component({
      imports,
      template: `
        <div
          (ngpAutocompleteSelected)="field.value = $event"
          (ngpAutocompleteActiveValueChange)="active.set($event)"
          ngpAutocomplete
          ngpAutocompleteAutoActivate
        >
          <input #field [ngpAutocompleteInputSuggestion]="active()" ngpAutocompleteInput />
          <div *ngpAutocompletePortal ngpAutocompleteDropdown>
            <div ngpAutocompleteOption ngpAutocompleteOptionValue="France">France</div>
          </div>
        </div>
      `,
    })
    class DirectWriteComponent {
      readonly active = signal<string | undefined>(undefined);
    }

    const { fixture } = await render(DirectWriteComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('Fr');
    await expectCompletion(input, 'France', 2);

    const inputEvents: string[] = [];
    input.addEventListener('input', () => inputEvents.push(input.value));

    await userEvent.keyboard('{enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await fixture.whenStable();

    expect(input.value).toBe('France');
    // the completion was dropped before the write, so nothing takes the label for edited text
    expect(inputEvents).toEqual([]);
  });

  it('should restore the typed text on blur without activating', async () => {
    const { fixture } = await render(HighlightComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('fr');
    await expectCompletion(input, 'france', 2);

    input.blur();

    await waitFor(() => expect(input.value).toBe('fr'));
    expect(fixture.componentInstance.selections).toEqual([]);
    expect(fixture.componentInstance.query()).toBe('fr');
  });

  it('should restore the typed text and close on Escape', async () => {
    await render(HighlightComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('fr');
    await expectCompletion(input, 'france', 2);

    await userEvent.keyboard('{escape}');

    expect(input.value).toBe('fr');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('should keep the completion as typed text when the caret moves past it', async () => {
    const { fixture } = await render(HighlightComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('fr');
    await expectCompletion(input, 'france', 2);

    await userEvent.keyboard('{ArrowRight}');

    // the consumer hears about it through the input event
    await waitFor(() => expect(fixture.componentInstance.query()).toBe('france'));
    expect(input.value).toBe('france');
    expect(input.selectionStart).toBe(input.selectionEnd);
    expect(fixture.componentInstance.selections).toEqual([]);
  });

  it('should not write a completion during IME composition', async () => {
    const { fixture } = await render(HighlightComponent);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    input.focus();

    input.dispatchEvent(new CompositionEvent('compositionstart', { data: '' }));
    input.value = 'fr';
    input.setSelectionRange(2, 2);
    input.dispatchEvent(
      new InputEvent('input', {
        inputType: 'insertCompositionText',
        data: 'fr',
        isComposing: true,
      }),
    );

    await waitFor(() => expect(fixture.componentInstance.active()).toBe('France'));
    await fixture.whenStable();
    expect(input.value).toBe('fr');

    input.dispatchEvent(new CompositionEvent('compositionend', { data: 'fr' }));

    await expectCompletion(input, 'france', 2);
  });

  it('should complete a fragment in the middle of a textarea', async () => {
    await render(MentionHighlightComponent);
    const textarea = screen.getByTestId('message') as HTMLTextAreaElement;

    textarea.value = 'Hi  there';
    await userEvent.type(textarea, '@ma', { initialSelectionStart: 3, initialSelectionEnd: 3 });

    await waitFor(() => {
      expect(textarea.value).toBe('Hi @marty there');
      expect(textarea.selectionStart).toBe(6);
      expect(textarea.selectionEnd).toBe(9);
    });

    await userEvent.keyboard('{enter}');

    expect(textarea.value).toBe('Hi @Marty  there');
    expect(textarea.selectionStart).toBe(10);
  });
});
