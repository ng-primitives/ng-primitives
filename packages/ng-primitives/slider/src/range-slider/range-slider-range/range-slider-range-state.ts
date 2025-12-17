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
  const rangeSlider = injectRangeSliderState();

  // Host bindings
  dataBinding(element, 'data-orientation', () => rangeSlider().orientation());
  dataBinding(element, 'data-disabled', () => rangeSlider().disabled());

  // Horizontal
  styleBinding(element, 'width.%', () =>
    rangeSlider().orientation() === 'horizontal' ? rangeSlider().rangePercentage() : null,
  );
  styleBinding(element, 'inset-inline-start.%', () =>
    rangeSlider().orientation() === 'horizontal' ? rangeSlider().lowPercentage() : null,
  );

  // Vertical
  styleBinding(element, 'height.%', () =>
    rangeSlider().orientation() === 'vertical' ? rangeSlider().rangePercentage() : null,
  );
  styleBinding(element, 'inset-block-start.%', () =>
    rangeSlider().orientation() === 'vertical' ? rangeSlider().lowPercentage() : null,
  );

  return {};
});
