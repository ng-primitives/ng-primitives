import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import {
  ngpNavigationMenuItem,
  provideNavigationMenuItemState,
} from './navigation-menu-item-state';

/**
 * The `NgpNavigationMenuItem` directive is a container for a menu trigger and its content.
 * It manages the open/close state for this specific menu item.
 */
@Directive({
  selector: '[ngpNavigationMenuItem]',
  exportAs: 'ngpNavigationMenuItem',
  providers: [provideNavigationMenuItemState({ inherit: false })],
})
export class NgpNavigationMenuItem {
  /**
   * A unique value identifying this menu item.
   * Used to track which item is currently active.
   */
  readonly value = input<string>(uniqueId('navigation-menu-item'), {
    alias: 'ngpNavigationMenuItemValue',
  });

  private readonly state = ngpNavigationMenuItem({
    value: this.value,
  });

  /**
   * Whether this menu item is currently active (open).
   */
  readonly active = this.state.active;

  /**
   * Show the content for this menu item.
   */
  show(): void {
    this.state.show();
  }

  /**
   * Hide the content for this menu item.
   */
  hide(): void {
    this.state.hide();
  }
}
