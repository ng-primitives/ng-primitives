import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { setupFormControl } from 'ng-primitives/form-field';
import { setupInteractions } from 'ng-primitives/internal';
import { provideSelectState, selectState } from './select-state';

/**
 * Apply the `ngpSelect` directive to a select element that you want to enhance.
 */
@Directive({
  selector: 'select[ngpSelect]',
  exportAs: 'ngpSelect',
  providers: [provideSelectState()],
  host: {
    '[attr.disabled]': 'disabled() || null',
  },
})
export class NgpSelect {
  /**
   * Whether the select is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectDisabled',
    transform: booleanAttribute,
  });

  /**
   * The select state.
   */
  private readonly state = selectState<NgpSelect>(this);

  constructor() {
    setupInteractions({
      hover: true,
      press: true,
      focus: true,
      focusVisible: true,
      disabled: this.state.disabled,
    });
    setupFormControl({ disabled: this.state.disabled });
  }
}
