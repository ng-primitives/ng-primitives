import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import { coerceBooleanOrUndefined } from 'ng-primitives/utils';
import { ngpMenuItemRadio, provideMenuItemRadioState } from './menu-item-radio-state';

/**
 * The `NgpMenuItemRadio` directive represents a radio menu item within a radio group.
 */
@Directive({
  selector: '[ngpMenuItemRadio]',
  exportAs: 'ngpMenuItemRadio',
  providers: [provideMenuItemRadioState(), provideRovingFocusItemState()],
})
export class NgpMenuItemRadio {
  /** The value this radio item represents */
  readonly value = input.required<string>({
    alias: 'ngpMenuItemRadioValue',
  });

  /** Whether the radio item is disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuItemRadioDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether choosing the item closes the menu. By default (`undefined`) a click or Enter closes
   * it and Space keeps it open, as React Aria does for a single choice. `null` counts as `false`.
   */
  readonly closeOnSelect = input<boolean | undefined, BooleanInput>(undefined, {
    alias: 'ngpMenuItemRadioCloseOnSelect',
    transform: coerceBooleanOrUndefined,
  });

  constructor() {
    ngpMenuItemRadio({
      value: this.value,
      disabled: this.disabled,
      closeOnSelect: this.closeOnSelect,
    });
    ngpRovingFocusItem({ disabled: this.disabled });
  }
}
