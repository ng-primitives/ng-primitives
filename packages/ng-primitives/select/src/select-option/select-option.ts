import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpSelectOption, provideSelectOptionState } from './select-option-state';

@Directive({
  selector: '[ngpSelectOption]',
  exportAs: 'ngpSelectOption',
  providers: [provideSelectOptionState()],
})
export class NgpSelectOption {
  /** The id of the option. */
  readonly id = input<string>(uniqueId('ngp-select-option'));

  /** @required The value of the option. */
  readonly value = input<any>(undefined, {
    alias: 'ngpSelectOptionValue',
  });

  /** The disabled state of the option. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectOptionDisabled',
    transform: booleanAttribute,
  });

  constructor() {
    ngpSelectOption({
      id: this.id,
      value: this.value,
      disabled: this.disabled,
    });
  }
}
