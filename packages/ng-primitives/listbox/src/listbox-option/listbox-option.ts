import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpListboxOption } from './listbox-option-state';

@Directive({
  selector: '[ngpListboxOption]',
  exportAs: 'ngpListboxOption',
})
export class NgpListboxOption<T> {
  /**
   * The id of the listbox.
   */
  readonly id = input(uniqueId('ngp-listbox-option'));

  /**
   * The value of the option.
   */
  readonly value = input.required<T>({
    alias: 'ngpListboxOptionValue',
  });

  /**
   * Whether the option is disabled.
   */
  readonly optionDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpListboxOptionDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpListboxOption<T>({
    id: this.id,
    value: this.value,
    optionDisabled: this.optionDisabled,
  });

  /**
   * Whether the option is selected.
   */
  readonly selected = this.state.selected;
}
