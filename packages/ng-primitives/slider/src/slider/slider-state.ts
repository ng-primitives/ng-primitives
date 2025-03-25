import { OutputEmitterRef, Signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { createState } from 'ng-primitives/state';

/**
 * The state for the slider primitive.
 */
export interface NgpSliderState {
  /**
   * The value of the slider.
   */
  readonly value: Signal<number>;

  /**
   * Emits when the value changes.
   */
  readonly valueChange: OutputEmitterRef<number>;

  /**
   * The minimum value of the slider.
   */
  readonly min: Signal<number>;

  /**
   * The maximum value of the slider.
   */
  readonly max: Signal<number>;

  /**
   * The step value of the slider.
   */
  readonly step: Signal<number>;

  /**
   * The orientation of the slider.
   */
  readonly orientation: Signal<NgpOrientation>;

  /**
   * The disabled state of the slider.
   */
  readonly disabled: Signal<boolean>;
}

/**
 * The initial state for the slider primitive.
 */
export const { NgpSliderStateToken, provideSliderState, injectSliderState, sliderState } =
  createState<NgpSliderState>('Slider');
