import { DOCUMENT } from '@angular/common';
import { afterRenderEffect, ElementRef, inject, Signal, signal, untracked } from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { NgpControlStatus, uniqueId } from 'ng-primitives/utils';
import { injectAutocompleteState } from '../autocomplete/autocomplete-state';
import { getCaretPosition } from './autocomplete-caret-position';
import type {
  NgpAutocompleteFragment,
  NgpAutocompleteFragmentMatcher,
} from './autocomplete-fragment';

export interface NgpAutocompleteInputState {
  /**
   * @internal Access the element reference.
   */
  readonly elementRef: ElementRef<HTMLInputElement | HTMLTextAreaElement>;

  /**
   * The status of the form control the input belongs to.
   * @internal
   */
  readonly controlStatus: Signal<NgpControlStatus>;

  /**
   * Focus the input field.
   * @internal
   */
  focus(): void;

  /**
   * Replace the fragment, or the whole text without a fragment matcher, and put the caret after
   * the new text. Dispatches an `input` event, so bindings and forms pick the text up.
   */
  replaceFragment(text: string): void;

  /**
   * Take the inline completion out of the text, leaving what the user typed.
   * @internal
   */
  clearCompletion(): void;
}

export interface NgpAutocompleteInputProps {
  /** The id of the input. */
  readonly id?: Signal<string>;

  /** Find the fragment to search by. Without one, the whole text is the query. */
  readonly fragmentMatcher?: Signal<NgpAutocompleteFragmentMatcher | undefined>;

  /** The text to complete the query with, usually the active option's label. */
  readonly suggestion?: Signal<string | undefined>;

  /** Called when the fragment under the caret changes, `null` when there is none. */
  readonly onFragmentChange?: (fragment: NgpAutocompleteFragment | null) => void;
}

/** A completion written after the typed text, selected so the next keystroke replaces it. */
interface Completion {
  /** The element's value with the completion. */
  readonly value: string;
  /** The value the user typed. */
  readonly typed: string;
  /** Where the user's caret was, and the completion starts. */
  readonly start: number;
  /** Where the completion ends. */
  readonly end: number;
}

export const [
  NgpAutocompleteInputStateToken,
  ngpAutocompleteInput,
  injectAutocompleteInputState,
  provideAutocompleteInputState,
] = createPrimitive(
  'NgpAutocompleteInput',
  ({
    id = signal(uniqueId('ngp-autocomplete-input')),
    fragmentMatcher = signal<NgpAutocompleteFragmentMatcher | undefined>(undefined),
    suggestion = signal<string | undefined>(undefined),
    onFragmentChange,
  }: NgpAutocompleteInputProps): NgpAutocompleteInputState => {
    const elementRef = injectElementRef<HTMLInputElement | HTMLTextAreaElement>();
    const element = elementRef.nativeElement;
    const document = inject(DOCUMENT);
    const state = injectAutocompleteState();
    const isInput = element.nodeName === 'INPUT';

    // Whether the pointer focused the input, in which case its text is not selected.
    let pointerFocused = false;

    // A deletion is not completed again until the next typed character.
    let deleting = false;

    let completion: Completion | null = null;
    let fragment: NgpAutocompleteFragment | null = null;

    const focused = signal(false);
    const composing = signal(false);

    // Bumped when the user changes the text, so the completion is worked out again.
    const textVersion = signal(0);

    ngpInteractions({
      focus: true,
      hover: true,
      press: true,
      disabled: state().disabled,
    });

    // binds the id, the disabled state and the form status
    const controlStatus = ngpFormControl({ id, disabled: state().disabled });

    // Host bindings
    // a textarea keeps its textbox role, which has no aria-expanded
    if (isInput) {
      attrBinding(elementRef, 'role', 'combobox');
      attrBinding(elementRef, 'type', 'text');
      attrBinding(elementRef, 'aria-expanded', () => state().open());
    }
    attrBinding(elementRef, 'autocomplete', 'off');
    attrBinding(elementRef, 'autocorrect', 'off');
    attrBinding(elementRef, 'spellcheck', 'false');
    attrBinding(elementRef, 'aria-haspopup', 'listbox');
    attrBinding(elementRef, 'aria-autocomplete', () => (suggestion() ? 'both' : 'list'));
    attrBinding(elementRef, 'aria-controls', () =>
      state().open() ? state().dropdownId() : undefined,
    );
    attrBinding(elementRef, 'aria-activedescendant', () => state().activeOptionId());
    dataBinding(elementRef, 'data-open', () => state().open());

    // Event listeners
    listener(elementRef, 'keydown', handleKeydown);
    listener(elementRef, 'input', onInput);
    listener(elementRef, 'blur', onBlur);
    listener(elementRef, 'focus', onFocus);
    listener(elementRef, 'pointerdown', () => (pointerFocused = true));
    listener(elementRef, 'compositionstart', () => composing.set(true));
    listener(elementRef, 'compositionend', () => {
      composing.set(false);
      textVersion.update(version => version + 1);
    });
    // there is no caret move event that every browser fires for every move, so listen for all
    for (const event of ['keyup', 'click', 'select', 'selectionchange']) {
      listener(elementRef, event, onCaretMove);
    }

    // After render, so a [value] binding updated in the same pass doesn't overwrite it.
    afterRenderEffect({
      write: () => {
        textVersion();
        const text = suggestion();
        const canComplete = focused() && state().open() && !composing();

        untracked(() => updateCompletion(canComplete ? text : undefined));
      },
    });

    function handleKeydown(event: KeyboardEvent): void {
      // moving through the list shows completions again after a deletion
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        deleting = false;
      }

      state().onKeydown(event);

      // closed, the arrow keys open the dropdown, unless an IME uses them to pick its candidates
      // or a matcher leaves them to the caret until a fragment opens the dropdown
      if (event.defaultPrevented || event.isComposing || state().open() || fragmentMatcher()) {
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        void state().openDropdown({ activate: event.key === 'ArrowDown' ? 'first' : 'last' });
        event.preventDefault();
      }
    }

    function onInput(event: Event): void {
      // the browser replaced any completion, so the element holds what the user typed
      completion = null;
      const inputType = event instanceof InputEvent ? event.inputType : undefined;
      deleting = inputType?.startsWith('delete') ?? false;
      textVersion.update(version => version + 1);

      const current = syncFragment();

      // typing always has an inputType, code and a replaced fragment don't count as typing
      const typed = !!inputType && inputType !== 'insertReplacementText';
      state().onQueryChange(current?.query ?? null, { typed });
    }

    function onCaretMove(): void {
      if (completion) {
        // the value changed elsewhere, so the completion is gone
        if (element.value !== completion.value) {
          completion = null;
        } else if (
          element.selectionStart !== completion.start ||
          element.selectionEnd !== completion.end
        ) {
          // moving the caret past the completion keeps it, as typed text
          completion = null;
          dispatchInput(element.value);
        }
        return;
      }

      const previous = fragment;
      const current = syncFragment();

      // leaving the fragment closes the dropdown, coming back to one waits for typing
      if (previous && !current && fragmentMatcher()) {
        state().closeDropdown();
      }
    }

    function onFocus(): void {
      focused.set(true);

      if (pointerFocused) {
        pointerFocused = false;
        return;
      }

      // selecting it all only suits a field that holds a single value
      if (!fragmentMatcher() && isInput) {
        element.setSelectionRange(0, element.value.length);
      }
    }

    // the autocomplete closes the dropdown once focus leaves it
    function onBlur(): void {
      focused.set(false);
      clearCompletion();
    }

    /** The text and caret the user typed, without any completion shown after them. */
    function typedText(): { text: string; caret: number } {
      if (completion && element.value === completion.value) {
        return { text: completion.typed, caret: completion.start };
      }

      return { text: element.value, caret: element.selectionStart ?? element.value.length };
    }

    function matchFragment(text: string, caret: number): NgpAutocompleteFragment | null {
      const matcher = fragmentMatcher();
      return matcher ? matcher(text, caret) : { start: 0, end: text.length, query: text };
    }

    function syncFragment(): NgpAutocompleteFragment | null {
      const { text, caret } = typedText();
      const previous = fragment;
      fragment = matchFragment(text, caret);

      if (
        fragmentMatcher() &&
        (previous?.start !== fragment?.start ||
          previous?.end !== fragment?.end ||
          previous?.query !== fragment?.query)
      ) {
        onFragmentChange?.(fragment);
      }

      updatePosition();
      return fragment;
    }

    function updatePosition(): void {
      // without a matcher the dropdown stays at the autocomplete element
      if (!fragmentMatcher()) {
        return;
      }

      // a function, as the fragment's caret moves on screen when the page or the textarea scrolls
      const start = fragment?.start;
      state().setPosition(start === undefined ? null : () => getCaretPosition(element, start));
    }

    function updateCompletion(text: string | undefined): void {
      const typed = typedText();
      const current = matchFragment(typed.text, typed.caret);

      // the completion goes at the caret, so the caret must be where the query ends
      const insertion =
        text &&
        current &&
        !deleting &&
        typed.caret === current.end &&
        text.toLowerCase().startsWith(current.query.toLowerCase())
          ? text.slice(current.query.length)
          : '';

      if (!insertion) {
        clearCompletion();
        return;
      }

      const value = typed.text.slice(0, typed.caret) + insertion + typed.text.slice(typed.caret);

      if (completion?.value === value && element.value === value) {
        return;
      }

      element.value = value;
      element.setSelectionRange(typed.caret, typed.caret + insertion.length);
      completion = {
        value,
        typed: typed.text,
        start: typed.caret,
        end: typed.caret + insertion.length,
      };
    }

    function clearCompletion(): void {
      if (!completion) {
        return;
      }

      // when the value changed elsewhere, such as a label written on activation, keep it
      if (element.value === completion.value) {
        element.value = completion.typed;
        element.setSelectionRange(completion.start, completion.start);
      }

      completion = null;
    }

    function replaceFragment(text: string): void {
      clearCompletion();

      const { text: value, caret } = typedText();
      const current = matchFragment(value, caret);
      const start = current?.start ?? caret;
      const end = current?.end ?? caret;

      element.setRangeText(text, start, end, 'end');
      dispatchInput(text);

      // called once focus has moved away, typing still carries on from the new caret
      if (document.activeElement !== element) {
        focus();
      }
    }

    // insertReplacementText, so the input does not take it for typing and reopen the dropdown
    function dispatchInput(data: string): void {
      element.dispatchEvent(
        new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText', data }),
      );
    }

    function focus(): void {
      element.focus({ preventScroll: true });
    }

    const inputState = {
      elementRef,
      controlStatus,
      focus,
      replaceFragment,
      clearCompletion,
    } satisfies NgpAutocompleteInputState;

    state().registerInput(inputState);
    onDestroy(() => state().unregisterInput(inputState));

    return inputState;
  },
);
