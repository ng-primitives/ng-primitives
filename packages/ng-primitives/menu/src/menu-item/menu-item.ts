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
  providers: [provideMenuItemState(), provideRovingFocusItemState()],
})
export class NgpMenuItem {
  /** Whether the menu item is disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuItemDisabled',
    transform: booleanAttribute,
  });

  constructor() {
    ngpMenuItem({ disabled: this.disabled });
    ngpRovingFocusItem({ disabled: this.disabled });
  }
}
