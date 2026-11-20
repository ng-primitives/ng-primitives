import { ElementRef, Signal, signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectAutocompleteState } from '../autocomplete/autocomplete-state';

export interface NgpAutocompleteButtonState {
  /**
   * @internal Access the element reference.
   */
  readonly elementRef: ElementRef<HTMLButtonElement>;
}

export interface NgpAutocompleteButtonProps {
  /** The id of the button. */
  readonly id?: Signal<string>;
}

export const [
  NgpAutocompleteButtonStateToken,
  ngpAutocompleteButton,
  injectAutocompleteButtonState,
  provideAutocompleteButtonState,
] = createPrimitive(
  'NgpAutocompleteButton',
  ({
    id = signal(uniqueId('ngp-autocomplete-button')),
  }: NgpAutocompleteButtonProps): NgpAutocompleteButtonState => {
    const elementRef = injectElementRef<HTMLButtonElement>();
    const state = injectAutocompleteState();

    ngpInteractions({
      hover: true,
      press: true,
      disabled: state().disabled,
    });

    // Host bindings
    attrBinding(elementRef, 'type', 'button');
    attrBinding(elementRef, 'tabindex', -1);
    attrBinding(elementRef, 'aria-haspopup', 'listbox');
    attrBinding(elementRef, 'id', id);
    attrBinding(elementRef, 'aria-controls', () => state().dropdown()?.id());
    attrBinding(elementRef, 'aria-expanded', () => state().open());
    attrBinding(elementRef, 'disabled', () => (state().disabled() ? '' : null));
    dataBinding(elementRef, 'data-open', () => state().open());
    dataBinding(elementRef, 'data-disabled', () => state().disabled());

    // Event listeners
    listener(elementRef, 'click', toggleDropdown);

    async function toggleDropdown(): Promise<void> {
      await state().toggleDropdown({ activate: 'selected' });
      state().input()?.focus();
    }

    const buttonState = {
      elementRef,
    } satisfies NgpAutocompleteButtonState;

    state().registerButton(buttonState);
    onDestroy(() => state().unregisterButton(buttonState));

    return buttonState;
  },
);
