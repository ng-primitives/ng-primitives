import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, numberAttribute, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { SetterOptions } from 'ng-primitives/state';
import { coerceNumberOrUndefined, uniqueId } from 'ng-primitives/utils';
import { ngpSlider, provideSliderState } from './slider-state';

/**
 * Apply the `ngpSlider` directive to an element that represents the slider and contains the track, range, and thumb.
 */
@Directive({
  selector: '[ngpSlider]',
  exportAs: 'ngpSlider',
  providers: [provideSliderState()],
})
export class NgpSlider {
  /**
   * The id of the slider. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-slider'));

  /**
   * The value of the slider.
   */
  readonly value = input<number | undefined, NumberInput>(undefined, {
    alias: 'ngpSliderValue',
    transform: coerceNumberOrUndefined,
  });

  /**
   * The default value of the slider for uncontrolled usage.
   * @default 0
   */
  readonly defaultValue = input<number, NumberInput>(0, {
    alias: 'ngpSliderDefaultValue',
    transform: (value: NumberInput) => numberAttribute(value, 0),
  });

  /**
   * Emits when the value changes.
   */
  readonly valueChange = output<number>({
    alias: 'ngpSliderValueChange',
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
   * The state of the slider. We use this for the slider state rather than relying on the inputs.
   * @internal
   */
  protected readonly state = ngpSlider({
    id: this.id,
    value: this.value,
    defaultValue: this.defaultValue,
    min: this.min,
    max: this.max,
    step: this.step,
    orientation: this.orientation,
    disabled: this.disabled,
    onValueChange: value => this.valueChange.emit(value),
  });

  /**
   * Set the value of the slider.
   */
  setValue(value: number, options?: SetterOptions): void {
    this.state.setValue(value, options);
  }
  /**
   * Set the disabled state.
   */
  setDisabled(disabled: boolean): void {
    this.state.setDisabled(disabled);
  }

  /**
   * Set the orientation.
   */
  setOrientation(orientation: NgpOrientation): void {
    this.state.setOrientation(orientation);
  }
}
