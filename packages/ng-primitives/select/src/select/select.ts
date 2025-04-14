import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { NgpSelectToken } from './select-token';

/**
 * Apply the `ngpSelect` directive to a select element that you want to enhance.
 */
@Directive({
  selector: 'select[ngpSelect]',
  exportAs: 'ngpSelect',
  providers: [
    { provide: NgpSelectToken, useExisting: NgpSelect },
    { provide: NgpDisabledToken, useExisting: NgpSelect },
  ],
  hostDirectives: [NgpFormControl, NgpFocusVisible, NgpHover, NgpPress],
  host: {
    '[attr.disabled]': 'disabled() || null',
  },
})
export class NgpSelect implements NgpCanDisable {
  /**
   * Whether the select is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectDisabled',
    transform: booleanAttribute,
  });
}
