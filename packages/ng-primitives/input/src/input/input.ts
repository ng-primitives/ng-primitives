import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpAutofill } from 'ng-primitives/autofill';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpFocus, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { NgpInputToken } from './input-token';

@Directive({
  selector: 'input[ngpInput]',
  exportAs: 'ngpInput',
  providers: [
    { provide: NgpInputToken, useExisting: NgpInput },
    { provide: NgpDisabledToken, useExisting: NgpInput },
  ],
  hostDirectives: [NgpFormControl, NgpHover, NgpFocus, NgpPress, NgpAutofill],
})
export class NgpInput implements NgpCanDisable {
  /**
   * Whether the element is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });
}
