import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, onDestroy } from 'ng-primitives/state';
import { onChange, uniqueId } from 'ng-primitives/utils';
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

    // Keep the meter's `aria-labelledby` in sync with the label id. On teardown the
    // label removes itself so `aria-labelledby` never points at an element that has
    // been removed from the DOM.
    onChange(id, (currentId, previousId) => {
      if (previousId) {
        state().removeLabel(previousId);
      }
      state().setLabel(currentId);
    });

    onDestroy(() => state().removeLabel(id()));

    return {} satisfies NgpMeterLabelState;
  },
);
