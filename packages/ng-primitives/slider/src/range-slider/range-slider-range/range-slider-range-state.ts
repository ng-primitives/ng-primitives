import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, styleBinding } from 'ng-primitives/state';
import { injectRangeSliderState } from '../range-slider/range-slider-state';

/**
 * Public state surface for the RangeSliderRange primitive.
 */
export interface NgpRangeSliderRangeState {}

/**
 * Inputs for configuring the RangeSliderRange primitive.
 */
export interface NgpRangeSliderRangeProps {}

export const [
  NgpRangeSliderRangeStateToken,
  ngpRangeSliderRange,
  injectRangeSliderRangeState,
  provideRangeSliderRangeState,
] = createPrimitive('NgpRangeSliderRange', ({}: NgpRangeSliderRangeProps) => {
  const element = injectElementRef();
  const state = injectRangeSliderState();

  // Host bindings
  dataBinding(element, 'data-orientation', () => state().orientation());
  dataBinding(element, 'data-disabled', () => state().disabled());

  // Horizontal
  styleBinding(element, 'width.%', () =>
    state().orientation() === 'horizontal' ? state().rangePercentage() : null,
  );
  styleBinding(element, 'inset-inline-start.%', () =>
    state().orientation() === 'horizontal' ? state().lowPercentage() : null,
  );

  // Vertical
  styleBinding(element, 'height.%', () =>
    state().orientation() === 'vertical' ? state().rangePercentage() : null,
  );
  styleBinding(element, 'inset-block-start.%', () =>
    state().orientation() === 'vertical' ? state().lowPercentage() : null,
  );

  return {};
});
