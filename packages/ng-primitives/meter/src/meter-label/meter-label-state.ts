import { effect, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectMeterState } from '../meter/meter-state';

export interface NgpMeterLabelState {}

export interface NgpMeterLabelProps {
  /**
   * The unique identifier for the meter label.
   */
  readonly id?: Signal<string>;
}

export const [NgpMeterLabelStateToken, ngpMeterLabel] = createPrimitive(
  'NgpMeterLabel',
  ({ id = signal(uniqueId('ngp-meter-label')) }: NgpMeterLabelProps) => {
    const element = injectElementRef();

    const state = injectMeterState();

    attrBinding(element, 'id', id);

    // Keep the meter's `aria-labelledby` in sync with the label id. The factory runs
    // during construction, before Angular has assigned the `id` input, so track it
    // reactively rather than capturing the default value once. On teardown, clear the
    // id (unless another label has since taken over) so `aria-labelledby` never points
    // at a label that has been removed from the DOM.
    effect(onCleanup => {
      const currentId = id();
      state().labelId.set(currentId);
      onCleanup(() => {
        if (state().labelId() === currentId) {
          state().labelId.set(undefined);
        }
      });
    });

    return {} satisfies NgpMeterLabelState;
  },
);
