import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute, output } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpComboboxOption } from './combobox-option-state';

type T = any;

@Directive({
  selector: '[ngpComboboxOption]',
  exportAs: 'ngpComboboxOption',
})
export class NgpComboboxOption {
  /** The id of the option. */
  readonly id = input<string>(uniqueId('ngp-combobox-option'));

  /** @required The value of the option. */
  readonly value = input<T>(undefined, {
    alias: 'ngpComboboxOptionValue',
  });

  /** The disabled state of the option. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpComboboxOptionDisabled',
    transform: booleanAttribute,
  });

  /**
   * The index of the option in the combobox. This can be used to define the order of options
   * when virtual scrolling is used or when the order is not determined by DOM order.
   */
  readonly index = input<number, NumberInput>(undefined, {
    alias: 'ngpComboboxOptionIndex',
    transform: numberAttribute,
  });

  /**
   * Event emitted when the option is activated via click or keyboard.
   * This is useful for options without values that need custom behavior.
   */
  readonly activated = output<void>({
    alias: 'ngpComboboxOptionActivated',
  });

  protected readonly state = ngpComboboxOption({
    id: this.id,
    value: this.value,
    disabled: this.disabled,
    index: this.index,
    onActivatedChange: () => this.activated.emit(),
  });

  /** @internal Access the element reference. */
  readonly elementRef = this.state.elementRef;

  /**
   * Select the option.
   * @internal
   */
  select(): void {
    return this.state.select();
  }

  /**
   * Scroll the option into view.
   * @internal
   */
  scrollIntoView(): void {
    return this.state.scrollIntoView();
  }
}
