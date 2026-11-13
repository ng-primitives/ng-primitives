import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { coerceNumberOrUndefined, uniqueId } from 'ng-primitives/utils';
import { ngpAutocompleteOption, provideAutocompleteOptionState } from './autocomplete-option-state';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type T = any;

@Directive({
  selector: '[ngpAutocompleteOption]',
  exportAs: 'ngpAutocompleteOption',
  providers: [provideAutocompleteOptionState()],
})
export class NgpAutocompleteOption {
  /** The id of the option. */
  readonly id = input<string>(uniqueId('ngp-autocomplete-option'));

  /** @required The value emitted by `ngpAutocompleteSelected` when the option is selected. */
  readonly value = input<T>(undefined, {
    alias: 'ngpAutocompleteOptionValue',
  });

  /** The disabled state of the option. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpAutocompleteOptionDisabled',
    transform: booleanAttribute,
  });

  /**
   * The index of the option in the autocomplete. This can be used to define the order of options
   * when virtual scrolling is used or when the order is not determined by DOM order.
   */
  readonly index = input<number | undefined, NumberInput>(undefined, {
    alias: 'ngpAutocompleteOptionIndex',
    // undefined means DOM order, so it must not become NaN
    transform: coerceNumberOrUndefined,
  });

  /**
   * Event emitted when the option is activated via click or keyboard.
   * This is useful for options without values that need custom behavior.
   */
  readonly activated = output<void>({
    alias: 'ngpAutocompleteOptionActivated',
  });

  protected readonly state = ngpAutocompleteOption({
    id: this.id,
    value: this.value,
    disabled: this.disabled,
    index: this.index,
    onActivated: () => this.activated.emit(),
  });
}
