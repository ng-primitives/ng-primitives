import { FocusOrigin } from '@angular/cdk/a11y';
import { Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpSliderThumb } from 'ng-primitives/slider';
import { attrBinding, createPrimitive } from 'ng-primitives/state';
import { injectColorSliderState } from '../color-slider/color-slider-state';

/**
 * Public state surface for the Color Slider Thumb primitive.
 */
export interface NgpColorSliderThumbState {
  /** Whether the thumb is currently dragging. */
  readonly dragging: Signal<boolean>;
  /** Focus the thumb element. */
  focus(origin?: FocusOrigin): void;
}

/**
 * Inputs for configuring the Color Slider Thumb primitive.
 */
export interface NgpColorSliderThumbProps {
  /** Callback fired when dragging starts. */
  readonly onDragStart?: () => void;
  /** Callback fired when dragging ends. */
  readonly onDragEnd?: () => void;
}

export const [
  NgpColorSliderThumbStateToken,
  ngpColorSliderThumb,
  injectColorSliderThumbState,
  provideColorSliderThumbState,
] = createPrimitive(
  'NgpColorSliderThumb',
  ({ onDragStart, onDragEnd }: NgpColorSliderThumbProps): NgpColorSliderThumbState => {
    const element = injectElementRef<HTMLElement>();
    const color = injectColorSliderState();

    // Compose the slider thumb: it owns role=slider, aria-value*, keyboard, drag and focus.
    const thumb = ngpSliderThumb({ onDragStart, onDragEnd });

    // Name and describe the slider in terms of the color channel for screen readers.
    attrBinding(element, 'aria-label', () => color().channel());
    attrBinding(
      element,
      'aria-valuetext',
      () => `${color().channel()} ${Math.round(color().channelValue())}`,
    );

    return thumb;
  },
);
