import { ElementRef, Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  onDestroy,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectState } from '../select/select-state';

export interface NgpSelectListState {
  /**
   * @internal Access the element reference.
   */
  readonly elementRef: ElementRef<HTMLElement>;

  /** The id of the list. */
  readonly id: Signal<string>;
}

export interface NgpSelectListProps {
  /** The id of the list. */
  readonly id?: Signal<string>;
}

export const [
  NgpSelectListStateToken,
  ngpSelectList,
  _injectSelectListState,
  provideSelectListState,
] = createPrimitive(
  'NgpSelectList',
  ({ id: _id = signal(uniqueId('ngp-select-list')) }: NgpSelectListProps) => {
    const elementRef = injectElementRef<HTMLElement>();
    const selectState = injectSelectState();

    // Host bindings
    attrBinding(elementRef, 'role', 'listbox');
    attrBinding(elementRef, 'id', _id);

    const state = {
      elementRef,
      id: _id,
    } satisfies NgpSelectListState;

    selectState().registerList(state);

    onDestroy(() => selectState().unregisterList(state));

    return state;
  },
);

export function injectSelectListState(options?: StateInjectionOptions): Signal<NgpSelectListState> {
  return _injectSelectListState(options) as Signal<NgpSelectListState>;
}
