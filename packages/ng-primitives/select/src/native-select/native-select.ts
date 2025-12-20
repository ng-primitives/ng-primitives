import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpNativeSelect, provideNativeSelectState } from './native-select-state';

/**
 * Apply the `ngpNativeSelect` directive to a select element that you want to enhance.
 */
@Directive({
  selector: 'select[ngpNativeSelect]',
  exportAs: 'ngpNativeSelect',
  providers: [provideNativeSelectState()],
})
export class NgpNativeSelect {
  /**
   * The id of the select. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-native-select'));

  /**
   * Whether the select is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpNativeSelectDisabled',
    transform: booleanAttribute,
  });

  constructor() {
    ngpNativeSelect({
      id: this.id,
      disabled: this.disabled,
    });
  }
}
