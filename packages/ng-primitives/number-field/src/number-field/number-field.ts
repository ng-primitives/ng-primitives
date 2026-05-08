import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, numberAttribute, output } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpNumberField, provideNumberFieldState } from './number-field-state';

/**
 * Apply the `ngpNumberField` directive to an element that represents the number field
 * and contains the input, increment, and decrement buttons.
 */
@Directive({
  selector: '[ngpNumberField]',
  exportAs: 'ngpNumberField',
  providers: [provideNumberFieldState()],
})
export class NgpNumberField {
  /**
   * The id of the number field. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-number-field'));

  /**
   * The value of the number field.
   */
  readonly value = input<number | null, NumberInput>(null, {
    alias: 'ngpNumberFieldValue',
    transform: (v: NumberInput) =>
      v === null || v === undefined || v === '' ? null : numberAttribute(v),
  });

  /**
   * Emits when the value changes.
   */
  readonly valueChange = output<number | null>({
    alias: 'ngpNumberFieldValueChange',
  });

  /**
   * The minimum value.
   */
  readonly min = input<number, NumberInput>(-Infinity, {
    alias: 'ngpNumberFieldMin',
    transform: numberAttribute,
  });

  /**
   * The maximum value.
   */
  readonly max = input<number, NumberInput>(Infinity, {
    alias: 'ngpNumberFieldMax',
    transform: numberAttribute,
  });

  /**
   * The step value.
   */
  readonly step = input<number, NumberInput>(1, {
    alias: 'ngpNumberFieldStep',
    transform: numberAttribute,
  });

  /**
   * The large step value (used with Shift key).
   */
  readonly largeStep = input<number, NumberInput>(10, {
    alias: 'ngpNumberFieldLargeStep',
    transform: numberAttribute,
  });

  /**
   * The disabled state of the number field.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpNumberFieldDisabled',
    transform: booleanAttribute,
  });

  /**
   * The readonly state of the number field.
   */
  readonly readonly = input<boolean, BooleanInput>(false, {
    alias: 'ngpNumberFieldReadonly',
    transform: booleanAttribute,
  });

  /**
   * @internal
   */
  protected readonly state = ngpNumberField({
    id: this.id,
    value: this.value,
    min: this.min,
    max: this.max,
    step: this.step,
    largeStep: this.largeStep,
    disabled: this.disabled,
    readonly: this.readonly,
    onValueChange: value => this.valueChange.emit(value),
  });

  /**
   * Set the value of the number field.
   */
  setValue(value: number | null): void {
    this.state.setValue(value);
  }

  /**
   * Increment the value.
   */
  increment(multiplier?: number): void {
    this.state.increment(multiplier);
  }

  /**
   * Decrement the value.
   */
  decrement(multiplier?: number): void {
    this.state.decrement(multiplier);
  }

  /**
   * Set the disabled state.
   */
  setDisabled(disabled: boolean): void {
    this.state.setDisabled(disabled);
  }

  /**
   * Set the readonly state.
   */
  setReadonly(readonly: boolean): void {
    this.state.setReadonly(readonly);
  }
}
