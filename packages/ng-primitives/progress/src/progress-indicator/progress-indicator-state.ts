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
      return value === null ? null : ((value - min) / (max - min)) * 100;
    });

    styleBinding(element, 'width.%', percentage);

    return {} satisfies NgpProgressIndicatorState;
  },
);
