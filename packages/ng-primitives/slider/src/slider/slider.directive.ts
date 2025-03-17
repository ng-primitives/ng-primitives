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
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpFormControl } from 'ng-primitives/form-field';
import { controlState, provideControlState } from 'ng-primitives/forms';
import { NgpCanDisable, NgpCanOrientate, NgpDisabledToken } from 'ng-primitives/internal';
import type { NgpSliderTrack } from '../slider-track/slider-track.directive';
import { provideSlider } from './slider.token';

@Directive({
  standalone: true,
  selector: '[ngpSlider]',
  exportAs: 'ngpSlider',
  providers: [
    provideSlider(NgpSlider),
    provideControlState(),
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
   * @internal
   */
  readonly track = signal<NgpSliderTrack | undefined>(undefined);

  /**
   * The value as a percentage based on the min and max values.
   */
  protected readonly percentage = computed(
    () => ((this.state.value() - this.min()) / (this.max() - this.min())) * 100,
  );

  /**
   * The form control state. This is used to allow communication between the slider and the control value access and any
   * components that use this as a host directive.
   * @internal
   */
  readonly state = controlState({
    value: this.value,
    disabled: this.disabled,
  });
}
