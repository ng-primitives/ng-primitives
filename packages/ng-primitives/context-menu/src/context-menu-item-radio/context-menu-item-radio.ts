import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpMenuItemRadio, provideMenuItemRadioState } from 'ng-primitives/menu';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';

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

  constructor() {
    ngpMenuItemRadio({ value: this.value, disabled: this.disabled });
    ngpRovingFocusItem({ disabled: this.disabled });
  }
}
