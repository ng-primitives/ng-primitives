import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, onDestroy } from 'ng-primitives/state';
import { onChange, uniqueId } from 'ng-primitives/utils';
import { injectDateControllerState } from '../date-picker/date-picker-state';

export interface NgpDatePickerLabelState {
  /**
   * The id of the label.
   */
  readonly id: Signal<string>;
}

export interface NgpDatePickerLabelProps {
  /**
   * The id of the label.
   */
  readonly id?: Signal<string>;
  /**
   * The aria-live politeness of the label.
   */
  readonly ariaLive?: Signal<string>;
}

export const [
  NgpDatePickerLabelStateToken,
  ngpDatePickerLabel,
  injectDatePickerLabelState,
  provideDatePickerLabelState,
] = createPrimitive(
  'NgpDatePickerLabel',
  <T>({
    id = signal(uniqueId('ngp-date-picker-label')),
    ariaLive = signal('polite'),
  }: NgpDatePickerLabelProps): NgpDatePickerLabelState => {
    const elementRef = injectElementRef();
    const state = injectDateControllerState<T>();

    // Host bindings
    attrBinding(elementRef, 'id', id);
    attrBinding(elementRef, 'aria-live', ariaLive);
    dataBinding(elementRef, 'data-disabled', () => (state().disabled() ? '' : null));

    // Register the label id with the containing picker so the grid can reflect
    // it on `aria-labelledby`; re-register on change and deregister on teardown.
    onChange(id, (current, previous) => {
      if (previous) {
        state().removeLabel(previous);
      }
      if (current) {
        state().setLabel(current);
      }
    });

    onDestroy(() => state().removeLabel(id()));

    return { id } satisfies NgpDatePickerLabelState;
  },
);
