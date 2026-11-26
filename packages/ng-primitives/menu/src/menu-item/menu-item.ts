import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import { ngpMenuItem, provideMenuItemState } from './menu-item-state';

/**
 * The `NgpMenuItem` directive represents a menu item.
 */
@Directive({
  selector: '[ngpMenuItem]',
  exportAs: 'ngpMenuItem',
  providers: [provideMenuItemState({ inherit: false }), provideRovingFocusItemState()],
})
export class NgpMenuItem {
  /** Whether the menu item is disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuItemDisabled',
    transform: booleanAttribute,
  });

  /** Keeps the item focusable while preventing menu selection and opening its submenu. */
  readonly softDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuItemSoftDisabled',
    transform: booleanAttribute,
  });

  /** Whether the menu should close when this item is selected */
  readonly closeOnSelect = input<boolean, BooleanInput>(true, {
    alias: 'ngpMenuItemCloseOnSelect',
    transform: booleanAttribute,
  });

  constructor() {
    ngpMenuItem({
      disabled: this.disabled,
      softDisabled: this.softDisabled,
      closeOnSelect: this.closeOnSelect,
    });
    ngpRovingFocusItem({ disabled: this.disabled });
  }
}
