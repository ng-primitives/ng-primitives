import { Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, onDestroy } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';

export interface NgpComboboxListState {
  /** The id of the list. */
  readonly id: Signal<string>;
}

export interface NgpComboboxListProps {
  /** The id of the list. */
  readonly id?: Signal<string>;
}

export const [
  NgpComboboxListStateToken,
  ngpComboboxList,
  injectComboboxListState,
  provideComboboxListState,
] = createPrimitive(
  'NgpComboboxList',
  ({ id = signal(uniqueId('ngp-combobox-list')) }: NgpComboboxListProps): NgpComboboxListState => {
    const elementRef = injectElementRef<HTMLElement>();
    const comboboxState = injectComboboxState();

    // Host bindings
    attrBinding(elementRef, 'role', 'listbox');
    attrBinding(elementRef, 'id', id);
    attrBinding(elementRef, 'aria-multiselectable', () => comboboxState().multiple());
    // Focus stays on the input, and a list that scrolls is otherwise a tab stop of its own.
    attrBinding(elementRef, 'tabindex', '-1');

    const state = { id } satisfies NgpComboboxListState;

    comboboxState().registerList(state);

    onDestroy(() => comboboxState().unregisterList(state));

    return state;
  },
);
