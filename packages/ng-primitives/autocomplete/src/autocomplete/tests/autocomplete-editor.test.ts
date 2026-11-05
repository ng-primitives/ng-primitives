import { Component, signal, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpAutocompleteButton } from '../../autocomplete-button/autocomplete-button';
import { NgpAutocompleteDropdown } from '../../autocomplete-dropdown/autocomplete-dropdown';
import { NgpAutocompleteOption } from '../../autocomplete-option/autocomplete-option';
import { NgpAutocompletePortal } from '../../autocomplete-portal/autocomplete-portal';
import { NgpAutocomplete } from '../autocomplete';

/** An editable element of the consumer's own drives the list, with no ngpAutocompleteInput. */
@Component({
  imports: [
    NgpAutocomplete,
    NgpAutocompleteButton,
    NgpAutocompleteDropdown,
    NgpAutocompleteOption,
    NgpAutocompletePortal,
  ],
  template: `
    <div
      #autocomplete="ngpAutocomplete"
      [ngpAutocompleteMinLength]="minLength()"
      [ngpAutocompleteAutoActivate]="autoActivate()"
      (ngpAutocompleteSelected)="selections.push($event)"
      ngpAutocomplete
      ngpAutocompleteDropdownPlacement="bottom-start"
    >
      <div
        [attr.aria-controls]="autocomplete.dropdownId()"
        [attr.aria-activedescendant]="autocomplete.activeOptionId()"
        (keydown)="autocomplete.onKeydown($event)"
        data-testid="editor"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
      ></div>

      <button data-testid="inside" ngpAutocompleteButton>▼</button>

      <div *ngpAutocompletePortal ngpAutocompleteDropdown>
        @for (person of people; track person) {
          <div [ngpAutocompleteOptionValue]="person" ngpAutocompleteOption>{{ person }}</div>
        }
      </div>
    </div>

    <button data-testid="outside">Outside</button>
  `,
  styles: `
    [ngpAutocompleteDropdown] {
      position: absolute;
    }
  `,
})
class EditorComponent {
  readonly autocomplete = viewChild.required(NgpAutocomplete);
  readonly minLength = signal(1);
  readonly autoActivate = signal(false);
  readonly people = ['Marty', 'Doc', 'Biff'];
  readonly selections: string[] = [];
}

async function setup() {
  const { fixture } = await render(EditorComponent);
  const autocomplete = fixture.componentInstance.autocomplete();
  const editor = screen.getByTestId('editor');
  editor.focus();
  return { fixture, autocomplete, editor };
}

function keydown(element: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  // cancelable, so defaultPrevented reports whether the autocomplete handled the key
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  element.dispatchEvent(event);
  return event;
}

function expectClosed() {
  return waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
}

describe('NgpAutocomplete driven by an element of your own', () => {
  afterEach(() => {
    screen.queryByRole('listbox')?.remove();
  });

  it('should not warn when there is no ngpAutocompleteInput', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fixture, autocomplete } = await setup();

    autocomplete.setQuery('m');
    await screen.findByRole('listbox');
    await fixture.whenStable();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('should open once the query reaches the minimum length and close below it', async () => {
    const { fixture, autocomplete } = await setup();
    fixture.componentInstance.minLength.set(2);
    fixture.detectChanges();

    autocomplete.setQuery('m');
    await fixture.whenStable();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(autocomplete.open()).toBe(false);

    autocomplete.setQuery('ma');
    await screen.findByRole('listbox');
    expect(autocomplete.open()).toBe(true);

    autocomplete.setQuery('m');
    await expectClosed();
  });

  it('should close when the query is null', async () => {
    const { autocomplete } = await setup();

    autocomplete.setQuery('m');
    await screen.findByRole('listbox');

    autocomplete.setQuery(null);
    await expectClosed();
  });

  it('should open with no active option, or the first one with auto activation', async () => {
    const { fixture, autocomplete } = await setup();

    autocomplete.setQuery('m');
    await screen.findByRole('listbox');
    await fixture.whenStable();
    expect(autocomplete.activeOptionId()).toBeUndefined();

    autocomplete.setQuery(null);
    await expectClosed();

    fixture.componentInstance.autoActivate.set(true);
    fixture.detectChanges();
    autocomplete.setQuery('m');

    await waitFor(() => expect(screen.getByText('Marty')).toHaveAttribute('data-active'));
    expect(autocomplete.activeOptionId()).toBe(screen.getByText('Marty').id);
  });

  it('should keep the active option when the same query is reported again', async () => {
    const { fixture, autocomplete } = await setup();

    autocomplete.setQuery('m');
    await screen.findByRole('listbox');
    autocomplete.activateNextOption();
    autocomplete.activateNextOption();
    await waitFor(() => expect(screen.getByText('Doc')).toHaveAttribute('data-active'));

    // an editor reports the query again when only its caret moves
    autocomplete.setQuery('m');
    await fixture.whenStable();
    expect(screen.getByText('Doc')).toHaveAttribute('data-active');

    // a new query is typing, which hands visual focus back to the editor
    autocomplete.setQuery('ma');
    await waitFor(() => expect(screen.getByText('Doc')).not.toHaveAttribute('data-active'));
    expect(autocomplete.activeOptionId()).toBeUndefined();
  });

  it('should give the editor the ids it needs for ARIA', async () => {
    const { autocomplete, editor } = await setup();

    autocomplete.setQuery('m');
    const dropdown = await screen.findByRole('listbox');
    await waitFor(() => expect(editor).toHaveAttribute('aria-controls', dropdown.id));

    autocomplete.activatePreviousOption();
    await waitFor(() =>
      expect(editor).toHaveAttribute('aria-activedescendant', screen.getByText('Biff').id),
    );
  });

  it('should select the active option and report whether one was active', async () => {
    const { fixture, autocomplete } = await setup();

    // closed, nothing to select, so the editor keeps its Enter
    expect(autocomplete.selectActiveOption()).toBe(false);

    await autocomplete.openDropdown();
    await screen.findByRole('listbox');
    expect(autocomplete.selectActiveOption()).toBe(false);

    autocomplete.activateNextOption();
    expect(autocomplete.selectActiveOption()).toBe(true);
    expect(fixture.componentInstance.selections).toEqual(['Marty']);
    await expectClosed();
  });

  it('should open on the first option when asked', async () => {
    const { autocomplete } = await setup();

    await autocomplete.openDropdown({ activate: 'first' });

    await waitFor(() => expect(screen.getByText('Marty')).toHaveAttribute('data-active'));
  });

  it('should keep focus in the editor when an option is pressed', async () => {
    const { fixture, autocomplete, editor } = await setup();

    autocomplete.setQuery('m');
    await userEvent.click(await screen.findByText('Doc'));

    expect(fixture.componentInstance.selections).toEqual(['Doc']);
    expect(editor).toHaveFocus();
  });

  it('should stay open on a press inside the editor', async () => {
    const { fixture, autocomplete, editor } = await setup();

    autocomplete.setQuery('m');
    await screen.findByRole('listbox');

    await userEvent.click(editor);
    await fixture.whenStable();

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(autocomplete.open()).toBe(true);
  });

  it('should close when focus leaves the autocomplete, not when it moves inside it', async () => {
    const { fixture, autocomplete } = await setup();

    autocomplete.setQuery('m');
    await screen.findByRole('listbox');

    screen.getByTestId('inside').focus();
    await fixture.whenStable();
    expect(autocomplete.open()).toBe(true);

    screen.getByTestId('outside').focus();
    await expectClosed();
  });

  it('should place the dropdown at the position it is given', async () => {
    const { autocomplete } = await setup();

    autocomplete.setPosition({ x: 120, y: 80 });
    autocomplete.setQuery('m');
    const dropdown = await screen.findByRole('listbox');

    await waitFor(() => {
      const rect = dropdown.getBoundingClientRect();
      expect(Math.abs(rect.left - 120)).toBeLessThan(2);
      expect(Math.abs(rect.top - 80)).toBeLessThan(2);
    });
  });
  it('should leave every key to the editor while the dropdown is closed', async () => {
    const { autocomplete, editor } = await setup();

    for (const key of ['ArrowDown', 'ArrowUp', 'Enter', 'Escape']) {
      expect(keydown(editor, key).defaultPrevented).toBe(false);
    }
    expect(autocomplete.open()).toBe(false);
  });

  it('should move through the options and select one with the keys of an open dropdown', async () => {
    const { fixture, autocomplete, editor } = await setup();

    autocomplete.setQuery('m');
    await screen.findByRole('listbox');

    expect(keydown(editor, 'ArrowDown').defaultPrevented).toBe(true);
    await waitFor(() => expect(screen.getByText('Marty')).toHaveAttribute('data-active'));
    expect(keydown(editor, 'ArrowDown').defaultPrevented).toBe(true);
    expect(keydown(editor, 'ArrowUp').defaultPrevented).toBe(true);
    await waitFor(() => expect(screen.getByText('Marty')).toHaveAttribute('data-active'));

    expect(keydown(editor, 'Enter').defaultPrevented).toBe(true);
    expect(fixture.componentInstance.selections).toEqual(['Marty']);
    await expectClosed();
  });

  it('should close and leave Enter to the editor when no option is active', async () => {
    const { fixture, autocomplete, editor } = await setup();

    autocomplete.setQuery('m');
    await screen.findByRole('listbox');

    expect(keydown(editor, 'Enter').defaultPrevented).toBe(false);
    expect(fixture.componentInstance.selections).toEqual([]);
    await expectClosed();
  });

  it('should ignore keys an IME is composing with, and other keys', async () => {
    const { autocomplete, editor } = await setup();

    autocomplete.setQuery('m');
    await screen.findByRole('listbox');

    expect(keydown(editor, 'ArrowDown', { isComposing: true }).defaultPrevented).toBe(false);
    expect(keydown(editor, 'a').defaultPrevented).toBe(false);
    expect(autocomplete.activeOptionId()).toBeUndefined();
  });

  it('should close on Escape, through the overlay', async () => {
    const { autocomplete, editor } = await setup();

    autocomplete.setQuery('m');
    await screen.findByRole('listbox');

    keydown(editor, 'Escape');
    await expectClosed();
  });

  it('should measure a position function again when the page scrolls or resizes', async () => {
    const { autocomplete } = await setup();
    let y = 80;

    autocomplete.setPosition(() => ({ x: 120, y }));
    autocomplete.setQuery('m');
    const dropdown = await screen.findByRole('listbox');

    async function expectTop(top: number) {
      await waitFor(() =>
        expect(Math.abs(dropdown.getBoundingClientRect().top - top)).toBeLessThan(2),
      );
    }

    await expectTop(80);

    y = 140;
    document.dispatchEvent(new Event('scroll'));
    await expectTop(140);

    y = 60;
    window.dispatchEvent(new Event('resize'));
    await expectTop(60);
  });

  it('should measure a position function again when the dropdown reopens', async () => {
    const { autocomplete } = await setup();
    let y = 80;

    autocomplete.setPosition(() => ({ x: 120, y }));
    autocomplete.setQuery('m');
    await screen.findByRole('listbox');
    autocomplete.closeDropdown();
    await expectClosed();

    // the page moved while the dropdown was closed
    y = 150;
    await autocomplete.openDropdown();
    const dropdown = await screen.findByRole('listbox');

    await waitFor(() =>
      expect(Math.abs(dropdown.getBoundingClientRect().top - 150)).toBeLessThan(2),
    );
  });
});
