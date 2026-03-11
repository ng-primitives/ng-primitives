import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
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

  constructor() {
    ngpMenuItemRadio({ value: this.value, disabled: this.disabled });
    ngpRovingFocusItem({ disabled: this.disabled });
  }
}
