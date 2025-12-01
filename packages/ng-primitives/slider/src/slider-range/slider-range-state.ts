import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, styleBinding } from 'ng-primitives/state';
import { injectSliderState } from '../slider/slider-state';

/**
 * Public state surface for the Slider Range primitive.
 */
export interface NgpSliderRangeState {}

/**
 * Inputs for configuring the Slider Range primitive.
 */
export interface NgpSliderRangeProps {}

export const [
  NgpSliderRangeStateToken,
  ngpSliderRange,
  injectSliderRangeState,
  provideSliderRangeState,
] = createPrimitive('NgpSliderRange', ({}: NgpSliderRangeProps): NgpSliderRangeState => {
  const element = injectElementRef<HTMLElement>();
  const slider = injectSliderState();

  // Host bindings
  dataBinding(element, 'data-orientation', () => slider().orientation());
  dataBinding(element, 'data-disabled', () => slider().disabled());
  styleBinding(element, 'width.%', () =>
    slider().orientation() === 'horizontal' ? slider().percentage() : null,
  );
  styleBinding(element, 'height.%', () =>
    slider().orientation() === 'vertical' ? slider().percentage() : null,
  );

  return {};
});
