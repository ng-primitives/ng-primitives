import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input } from '@angular/core';
import { ngpTabButtonPattern, provideTabButtonPattern } from './tab-button-pattern';

/**
 * Apply the `ngpTabButton` directive to an element within a tab list to represent a tab button. This directive should be applied to a button element.
 */
@Directive({
  selector: '[ngpTabButton]',
  exportAs: 'ngpTabButton',
  providers: [provideTabButtonPattern(NgpTabButton, instance => instance.pattern)],
})
export class NgpTabButton {
  /**
   * The value of the tab this trigger controls
   * @required
   */
  readonly value = input<string>(undefined, { alias: 'ngpTabButtonValue' });

  /**
   * Whether the tab is disabled
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpTabButtonDisabled',
    transform: booleanAttribute,
  });

  /**
   * Determine the id of the tab button
   * @internal
   */
  readonly id = input<string>();

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpTabButtonPattern({
    value: this.value,
    disabled: this.disabled,
    id: this.id,
  });

  /**
   * Select the tab this trigger controls
   */
  select(): void {
    this.pattern.select();
  }
}
