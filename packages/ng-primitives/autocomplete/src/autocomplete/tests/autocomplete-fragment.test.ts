import { Component, computed, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { NgpAutocompleteDropdown } from '../../autocomplete-dropdown/autocomplete-dropdown';
import { getCaretPosition } from '../../autocomplete-input/autocomplete-caret-position';
import {
  NgpAutocompleteFragment,
  coerceFragmentMatcher,
  createFragmentMatcher,
} from '../../autocomplete-input/autocomplete-fragment';
import { NgpAutocompleteInput } from '../../autocomplete-input/autocomplete-input';
import { NgpAutocompleteOption } from '../../autocomplete-option/autocomplete-option';
import { NgpAutocompletePortal } from '../../autocomplete-portal/autocomplete-portal';
import { NgpAutocomplete } from '../autocomplete';

@Component({
  imports: [
    NgpAutocomplete,
    NgpAutocompleteDropdown,
    NgpAutocompleteInput,
    NgpAutocompleteOption,
    NgpAutocompletePortal,
  ],
  template: `
    <div
      (ngpAutocompleteSelected)="field.replaceFragment('@' + $event + ' ')"
      ngpAutocomplete
      ngpAutocompleteDropdownPlacement="bottom-start"
    >
      <textarea
        #field="ngpAutocompleteInput"
        [ngpAutocompleteInputFragmentMatcher]="mention"
        [rows]="rows"
        (ngpAutocompleteInputFragmentChange)="onFragmentChange($event)"
        (input)="text = $any($event.target).value"
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
  styles: `
    textarea {
      width: 400px;
      font: 16px/20px monospace;
      padding: 4px;
      border: 1px solid;
    }

    [ngpAutocompleteDropdown] {
      position: absolute;
    }
  `,
})
class MentionComponent {
  readonly mention = createFragmentMatcher('@');
  readonly query = signal('');
  readonly fragments: (NgpAutocompleteFragment | null)[] = [];
  readonly everyone = ['Marty', 'Marvin', 'Doc'];
  readonly people = computed(() =>
    this.everyone.filter(person => person.toLowerCase().startsWith(this.query().toLowerCase())),
  );
  rows = 3;
  text = '';

  onFragmentChange(fragment: NgpAutocompleteFragment | null) {
    this.fragments.push(fragment);
    this.query.set(fragment?.query ?? '');
  }
}

/** Takes the trigger characters straight from the template. */
@Component({
  imports: [
    NgpAutocomplete,
    NgpAutocompleteDropdown,
    NgpAutocompleteInput,
    NgpAutocompleteOption,
    NgpAutocompletePortal,
  ],
  template: `
    <div ngpAutocomplete>
      <input
        (ngpAutocompleteInputFragmentChange)="fragments.push($event)"
        ngpAutocompleteInput
        ngpAutocompleteInputFragmentMatcher="#"
      />

      <div *ngpAutocompletePortal ngpAutocompleteDropdown>
        <div ngpAutocompleteOption ngpAutocompleteOptionValue="angular">angular</div>
      </div>
    </div>
  `,
})
class HashtagComponent {
  readonly fragments: (NgpAutocompleteFragment | null)[] = [];
}

function keydown(element: HTMLElement, key: string): KeyboardEvent {
  // cancelable, so defaultPrevented reports whether the autocomplete handled the key
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event;
}

describe('createFragmentMatcher', () => {
  const mention = createFragmentMatcher('@');

  it('should match the word under the caret that starts with the trigger', () => {
    expect(mention('Hi @ma', 6)).toEqual({ start: 3, end: 6, query: 'ma' });
  });

  it('should match a lone trigger with an empty query', () => {
    expect(mention('Hi @', 4)).toEqual({ start: 3, end: 4, query: '' });
  });

  it('should not match a trigger inside a word', () => {
    expect(mention('mail@example', 12)).toBeNull();
  });

  it('should not match when the caret is outside the fragment', () => {
    expect(mention('Hi @ma', 2)).toBeNull();
    expect(mention('Hi @ma there', 12)).toBeNull();
  });

  it('should match any of several triggers', () => {
    const tag = createFragmentMatcher(['@', '#']);
    expect(tag('see #an', 7)).toEqual({ start: 4, end: 7, query: 'an' });
    expect(tag('see @do', 7)).toEqual({ start: 4, end: 7, query: 'do' });
  });
});

describe('coerceFragmentMatcher', () => {
  it('should build a matcher from trigger characters', () => {
    expect(coerceFragmentMatcher('@')?.('Hi @ma', 6)).toEqual({ start: 3, end: 6, query: 'ma' });
    expect(coerceFragmentMatcher(['@', '#'])?.('see #an', 7)).toEqual({
      start: 4,
      end: 7,
      query: 'an',
    });
  });

  it('should pass a matcher function through', () => {
    const matcher = createFragmentMatcher('@');
    expect(coerceFragmentMatcher(matcher)).toBe(matcher);
  });

  it('should leave no matcher for null or undefined', () => {
    expect(coerceFragmentMatcher(null)).toBeUndefined();
    expect(coerceFragmentMatcher(undefined)).toBeUndefined();
  });
});

describe('NgpAutocomplete fragments', () => {
  afterEach(() => {
    screen.queryByRole('listbox')?.remove();
  });

  it('should take the trigger characters as the fragment matcher', async () => {
    const { fixture } = await render(HashtagComponent);
    const input = screen.getByRole('combobox');

    await userEvent.type(input, 'see #an');

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(fixture.componentInstance.fragments.at(-1)).toEqual({ start: 4, end: 7, query: 'an' });
  });

  it('should keep the textbox role of a textarea', async () => {
    await render(MentionComponent);
    const textarea = screen.getByTestId('message');

    expect(textarea).not.toHaveAttribute('role');
    expect(textarea).not.toHaveAttribute('aria-expanded');
    expect(textarea).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('should open for a fragment and not for plain text', async () => {
    const { fixture } = await render(MentionComponent);
    const textarea = screen.getByTestId('message');

    await userEvent.type(textarea, 'Hello');
    await fixture.whenStable();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await userEvent.type(textarea, ' @ma');

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(fixture.componentInstance.fragments.at(-1)).toEqual({ start: 6, end: 9, query: 'ma' });
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual([
      'Marty',
      'Marvin',
    ]);
    expect(textarea).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
  });

  it('should replace only the fragment and put the caret after it', async () => {
    const { fixture } = await render(MentionComponent);
    const textarea = screen.getByTestId('message') as HTMLTextAreaElement;

    textarea.value = 'Hello  world';
    await userEvent.type(textarea, '@ma', { initialSelectionStart: 6, initialSelectionEnd: 6 });
    await screen.findByRole('listbox');

    await userEvent.keyboard('{arrowdown}{enter}');

    expect(textarea.value).toBe('Hello @Marty  world');
    expect(textarea.selectionStart).toBe(13);
    expect(textarea.selectionEnd).toBe(13);
    // the replacement dispatches input, so bindings see the new text
    expect(fixture.componentInstance.text).toBe('Hello @Marty  world');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('should close when the caret leaves the fragment', async () => {
    await render(MentionComponent);
    const textarea = screen.getByTestId('message');

    await userEvent.type(textarea, 'Hi @ma');
    await screen.findByRole('listbox');

    await userEvent.keyboard('{Home}');

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('should close when the fragment ends', async () => {
    await render(MentionComponent);
    const textarea = screen.getByTestId('message');

    await userEvent.type(textarea, 'Hi @ma');
    await screen.findByRole('listbox');

    await userEvent.type(textarea, ' ');

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('should leave the keys to the textarea while the dropdown is closed', async () => {
    await render(MentionComponent);
    const textarea = screen.getByTestId('message');

    await userEvent.type(textarea, 'Hi @ma');
    await screen.findByRole('listbox');
    await userEvent.keyboard('{escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    // still inside the fragment, but a closed dropdown leaves the caret and new lines alone
    expect(keydown(textarea, 'ArrowDown').defaultPrevented).toBe(false);
    expect(keydown(textarea, 'ArrowUp').defaultPrevented).toBe(false);
    expect(keydown(textarea, 'Enter').defaultPrevented).toBe(false);
  });

  it('should anchor the dropdown at the start of the fragment', async () => {
    await render(MentionComponent);
    const textarea = screen.getByTestId('message') as HTMLTextAreaElement;

    await userEvent.type(textarea, 'Hello @ma');
    const dropdown = await screen.findByRole('listbox');
    const caret = getCaretPosition(textarea, 6);

    await waitFor(() => {
      const rect = dropdown.getBoundingClientRect();
      expect(Math.abs(rect.left - caret.x)).toBeLessThan(2);
      expect(Math.abs(rect.top - caret.y)).toBeLessThan(2);
    });

    // measured apart from the mirror: border (1px) + padding (4px), then the text before the `@`
    const sample = document.createElement('span');
    sample.style.font = '16px/20px monospace';
    // pre, or the trailing space would not count towards the width
    sample.style.whiteSpace = 'pre';
    sample.textContent = 'Hello ';
    document.body.appendChild(sample);
    const textWidth = sample.getBoundingClientRect().width;
    sample.remove();

    const box = textarea.getBoundingClientRect();
    expect(Math.abs(caret.x - (box.left + 5 + textWidth))).toBeLessThan(2);
    // the bottom of the first 20px line
    expect(Math.abs(caret.y - (box.top + 5 + 20))).toBeLessThan(2);
  });

  it('should follow the fragment when the textarea scrolls', async () => {
    const { fixture } = await render(MentionComponent);
    fixture.componentInstance.rows = 2;
    fixture.detectChanges();
    const textarea = screen.getByTestId('message') as HTMLTextAreaElement;

    await userEvent.type(textarea, '1{enter}2{enter}3{enter}4{enter}@ma');
    const dropdown = await screen.findByRole('listbox');
    const fragmentStart = textarea.value.indexOf('@');

    async function expectAtFragment(): Promise<number> {
      // measured outside waitFor: the measurement mutates the DOM, which would rerun waitFor forever
      const expected = getCaretPosition(textarea, fragmentStart).y;
      let top = 0;
      await waitFor(() => {
        top = dropdown.getBoundingClientRect().top;
        expect(Math.abs(top - expected)).toBeLessThan(2);
      });
      return top;
    }

    // typing is simulated, so the textarea does not scroll to the caret on its own
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event('scroll'));
    const scrolledDown = await expectAtFragment();

    textarea.scrollTop = 0;
    textarea.dispatchEvent(new Event('scroll'));
    const scrolledUp = await expectAtFragment();

    // back at the top, the fragment's line sits further down, below the visible rows
    expect(scrolledUp).toBeGreaterThan(scrolledDown);
  });
});
