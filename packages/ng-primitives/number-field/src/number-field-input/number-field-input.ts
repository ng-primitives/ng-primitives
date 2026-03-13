import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input } from '@angular/core';
import { ngpNumberFieldInput, provideNumberFieldInputState } from './number-field-input-state';

/**
 * Apply the `ngpNumberFieldInput` directive to an input element within a number field.
 */
@Directive({
  selector: '[ngpNumberFieldInput]',
  exportAs: 'ngpNumberFieldInput',
  providers: [provideNumberFieldInputState()],
})
export class NgpNumberFieldInput {
  /**
   * Whether mouse wheel changes the value when the input is focused.
   */
  readonly allowWheelScrub = input<boolean, BooleanInput>(false, {
    alias: 'ngpNumberFieldInputAllowWheelScrub',
    transform: booleanAttribute,
  });

  constructor() {
    ngpNumberFieldInput({
      allowWheelScrub: this.allowWheelScrub,
    });
  }
}
