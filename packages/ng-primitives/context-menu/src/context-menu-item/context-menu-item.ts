import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpMenuItem, provideMenuItemState } from 'ng-primitives/menu';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';

/**
 * The `NgpContextMenuItem` directive represents a context menu item.
 */
@Directive({
  selector: '[ngpContextMenuItem]',
  exportAs: 'ngpContextMenuItem',
  providers: [provideMenuItemState(), provideRovingFocusItemState()],
})
export class NgpContextMenuItem {
  /** Whether the menu item is disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpContextMenuItemDisabled',
    transform: booleanAttribute,
  });

  /** Whether the menu should close when this item is selected */
  readonly closeOnSelect = input<boolean, BooleanInput>(true, {
    alias: 'ngpContextMenuItemCloseOnSelect',
    transform: booleanAttribute,
  });

  constructor() {
    ngpMenuItem({ disabled: this.disabled, closeOnSelect: this.closeOnSelect });
    ngpRovingFocusItem({ disabled: this.disabled });
  }
}
