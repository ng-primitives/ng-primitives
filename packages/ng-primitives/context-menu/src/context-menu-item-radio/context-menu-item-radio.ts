import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpMenuItemRadio, provideMenuItemRadioState } from 'ng-primitives/menu';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import { coerceBooleanOrUndefined } from 'ng-primitives/utils';

/**
 * The `NgpContextMenuItemRadio` directive represents a radio context menu item within a radio group.
 */
@Directive({
  selector: '[ngpContextMenuItemRadio]',
  exportAs: 'ngpContextMenuItemRadio',
  providers: [provideMenuItemRadioState(), provideRovingFocusItemState()],
})
export class NgpContextMenuItemRadio {
  /** The value this radio item represents */
  readonly value = input.required<string>({
    alias: 'ngpContextMenuItemRadioValue',
  });

  /** Whether the radio item is disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpContextMenuItemRadioDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether choosing the item closes the menu. By default (`undefined`) a click or Enter closes
   * it and Space keeps it open, as React Aria does for a single choice. `null` counts as `false`.
   */
  readonly closeOnSelect = input<boolean | undefined, BooleanInput>(undefined, {
    alias: 'ngpContextMenuItemRadioCloseOnSelect',
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
