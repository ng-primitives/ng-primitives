import { computed, ElementRef, signal, Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';

export interface NgpComboboxButtonState {
  /** @internal Access the element reference. */
  readonly elementRef: ElementRef<HTMLElement>;
  /** The id of the button. */
  readonly id: Signal<string>;
  /** The is of the dropdown */
  readonly dropdownId: Signal<string | undefined>;
}

export interface NgpComboboxButtonProps {
  /** The id of the button. */
  readonly id?: Signal<string>;
}

export const [
  NgpComboboxButtonStateToken,
  ngpComboboxButton,
  injectComboboxButtonState,
  provideComboboxButtonState,
] = createPrimitive(
  'NgpComboboxButton',
  ({ id: _id = signal<string>(uniqueId('ngp-combobox-button')) }: NgpComboboxButtonProps) => {
    const elementRef = injectElementRef();
    const comboboxState = injectComboboxState();

    const dropdownId = computed(() => comboboxState().dropdown()?.id());

    // Setup interactions
    ngpInteractions({ hover: true, press: true, disabled: comboboxState().disabled });

    // Host binding
    attrBinding(elementRef, 'id', () => _id());
    attrBinding(elementRef, 'aria-controls', () => dropdownId());
    attrBinding(elementRef, 'aria-expanded', () => comboboxState().open());
    attrBinding(elementRef, 'disabled', () => comboboxState().disabled());
    dataBinding(elementRef, 'data-open', () => (comboboxState().open() ? '' : null));
    dataBinding(elementRef, 'data-disabled', () => (comboboxState().disabled() ? '' : null));
    dataBinding(elementRef, 'data-multiple', () => (comboboxState().multiple() ? '' : null));

    // Event listener
    listener(elementRef, 'click', async () => {
      await comboboxState().toggleDropdown();
      comboboxState().input()?.focus();
    });

    const state = {
      elementRef,
      id: _id,
      dropdownId,
    } satisfies NgpComboboxButtonState;

    comboboxState().registerButton(state);

    return state;
  },
);
