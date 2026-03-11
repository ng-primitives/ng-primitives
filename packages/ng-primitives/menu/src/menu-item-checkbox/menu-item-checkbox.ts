import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import { ngpMenuItemCheckbox, provideMenuItemCheckboxState } from './menu-item-checkbox-state';

/**
 * The `NgpMenuItemCheckbox` directive represents a menu item that can be toggled on and off.
 */
@Directive({
  selector: '[ngpMenuItemCheckbox]',
  exportAs: 'ngpMenuItemCheckbox',
  providers: [provideMenuItemCheckboxState(), provideRovingFocusItemState()],
})
export class NgpMenuItemCheckbox {
  /** Whether the checkbox is checked */
  readonly checked = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuItemCheckboxChecked',
    transform: booleanAttribute,
  });

  /** Event emitted when the checked state changes */
  readonly checkedChange = output<boolean>({
    alias: 'ngpMenuItemCheckboxCheckedChange',
  });

  /** Whether the menu item checkbox is disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuItemCheckboxDisabled',
    transform: booleanAttribute,
  });

  constructor() {
    ngpMenuItemCheckbox({
      checked: this.checked,
      disabled: this.disabled,
      onCheckedChange: value => this.checkedChange.emit(value),
    });
    ngpRovingFocusItem({ disabled: this.disabled });
  }
}
