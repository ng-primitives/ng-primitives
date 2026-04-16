import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { ngpMenuItemCheckbox, provideMenuItemCheckboxState } from 'ng-primitives/menu';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';

/**
 * The `NgpContextMenuItemCheckbox` directive represents a context menu item that can be toggled on and off.
 */
@Directive({
  selector: '[ngpContextMenuItemCheckbox]',
  exportAs: 'ngpContextMenuItemCheckbox',
  providers: [provideMenuItemCheckboxState(), provideRovingFocusItemState()],
})
export class NgpContextMenuItemCheckbox {
  /** Whether the checkbox is checked */
  readonly checked = input<boolean, BooleanInput>(false, {
    alias: 'ngpContextMenuItemCheckboxChecked',
    transform: booleanAttribute,
  });

  /** Event emitted when the checked state changes */
  readonly checkedChange = output<boolean>({
    alias: 'ngpContextMenuItemCheckboxCheckedChange',
  });

  /** Whether the menu item checkbox is disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpContextMenuItemCheckboxDisabled',
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
