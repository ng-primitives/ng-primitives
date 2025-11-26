import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { setupFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { uniqueId } from 'ng-primitives/utils';
import { provideNativeSelectState, selectNativeSelectState } from './native-select-state';

/**
 * Apply the `ngpNativeSelect` directive to a select element that you want to enhance.
 */
@Directive({
  selector: 'select[ngpNativeSelect]',
  exportAs: 'ngpNativeSelect',
  providers: [provideNativeSelectState()],
  host: {
    '[attr.disabled]': 'state.disabled() || null',
  },
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

  /**
   * The select state.
   */
  protected readonly state = selectNativeSelectState<NgpNativeSelect>(this);

  constructor() {
    ngpInteractions({
      hover: true,
      press: true,
      focus: true,
      focusVisible: true,
      disabled: this.state.disabled,
    });
    setupFormControl({ id: this.state.id, disabled: this.state.disabled });
  }
}
