import { computed } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, styleBinding } from 'ng-primitives/state';
import { injectProgressState } from '../progress/progress-state';

export interface NgpProgressIndicatorState {}

export interface NgpProgressIndicatorProps {}

export const [NgpProgressIndicatorStateToken, ngpProgressIndicator] = createPrimitive(
  'NgpProgressIndicator',
  ({}: NgpProgressIndicatorProps) => {
    const element = injectElementRef();

    const state = injectProgressState();

    const percentage = computed(() => {
      const min = state().min();
      const max = state().max();
      const value = state().value();
      if (value === null) {
        return null;
      }
      // guard the zero-length range so we never divide by zero (NaN width)
      if (max <= min) {
        return value >= max ? 100 : 0;
      }
      // clamp so an out-of-range value can't push the bar past its track or negative
      return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    });

    styleBinding(element, 'width.%', percentage);

    return {} satisfies NgpProgressIndicatorState;
  },
);
