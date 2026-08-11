import { computed } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, styleBinding } from 'ng-primitives/state';
import { injectMeterState } from '../meter/meter-state';

export interface NgpMeterIndicatorState {}

export interface NgpMeterIndicatorProps {}

export const [NgpMeterIndicatorStateToken, ngpMeterIndicator] = createPrimitive(
  'NgpMeterIndicator',
  ({}: NgpMeterIndicatorProps) => {
    const element = injectElementRef();

    const state = injectMeterState();

    const percentage = computed(() => {
      const value = state().value();
      const min = state().min();
      const max = state().max();
      // guard the zero-length range so we never divide by zero (NaN width)
      if (max <= min) {
        return value >= max ? 100 : 0;
      }
      // clamp so an out-of-range value can't push the bar past its track or negative
      return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    });

    styleBinding(element, 'width.%', percentage);

    return {} satisfies NgpMeterIndicatorState;
  },
);
