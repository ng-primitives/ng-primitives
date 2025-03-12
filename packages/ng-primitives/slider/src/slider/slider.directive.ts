/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  Directive,
  booleanAttribute,
  computed,
  contentChild,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpCanDisable, NgpCanOrientate, NgpDisabledToken } from 'ng-primitives/internal';
import { NgpSliderTrackToken } from '../slider-track/slider-track.token';
import { NgpSliderToken } from './slider.token';

@Directive({
  standalone: true,
  selector: '[ngpSlider]',
  exportAs: 'ngpSlider',
  providers: [
    { provide: NgpSliderToken, useExisting: NgpSlider },
    { provide: NgpDisabledToken, useExisting: NgpSlider },
  ],
  hostDirectives: [NgpFormControl],
  host: {
    '[attr.data-orientation]': 'orientation()',
  },
})
export class NgpSlider implements NgpCanDisable, NgpCanOrientate {
  /**
   * The value of the slider.
   */
  readonly value = model<number>(0, {
    alias: 'ngpSliderValue',
  });

  /**
   * The minimum value of the slider.
   */
  readonly min = input<number, NumberInput>(0, {
    alias: 'ngpSliderMin',
    transform: numberAttribute,
  });

  /**
   * The maximum value of the slider.
   */
  readonly max = input<number, NumberInput>(100, {
    alias: 'ngpSliderMax',
    transform: numberAttribute,
  });

  /**
   * The step value of the slider.
   */
  readonly step = input<number, NumberInput>(1, {
    alias: 'ngpSliderStep',
    transform: numberAttribute,
  });

  /**
   * The orientation of the slider.
   */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpSliderOrientation',
  });

  /**
   * The disabled state of the slider.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSliderDisabled',
    transform: booleanAttribute,
  });

  /**
   * Access the slider track.
   */
  readonly track = contentChild(NgpSliderTrackToken);

  /**
   * The value as a percentage based on the min and max values.
   */
  protected readonly percentage = computed(
    () => ((this.value() - this.min()) / (this.max() - this.min())) * 100,
  );
}
