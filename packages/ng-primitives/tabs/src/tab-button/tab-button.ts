import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, Signal } from '@angular/core';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import { ngpTabButton, provideTabButtonState } from './tab-button-state';

/**
 * Apply the `ngpTabButton` directive to an element within a tab list to represent a tab button. This directive should be applied to a button element.
 */
@Directive({
  selector: '[ngpTabButton]',
  exportAs: 'ngpTabButton',
  providers: [provideTabButtonState(), provideRovingFocusItemState()],
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

  private readonly state = ngpTabButton({
    value: this.value as Signal<string>,
    disabled: this.disabled,
    id: this.id,
  });

  /**
   * Whether the tab is active
   */
  readonly active = this.state.active;

  constructor() {
    ngpRovingFocusItem({ disabled: this.disabled });
  }

  /**
   * Select the tab this trigger controls
   */
  select(): void {
    this.state.select();
  }
}
