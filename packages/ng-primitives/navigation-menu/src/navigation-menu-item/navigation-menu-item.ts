import { Directive, input } from '@angular/core';
import {
  ngpNavigationMenuItem,
  provideNavigationMenuItemState,
} from './navigation-menu-item-state';

/**
 * Apply the `ngpNavigationMenuItem` directive to wrap a menu item trigger and content.
 */
@Directive({
  selector: '[ngpNavigationMenuItem]',
  exportAs: 'ngpNavigationMenuItem',
  providers: [provideNavigationMenuItemState({ inherit: false })],
  host: {
    role: 'none',
  },
})
export class NgpNavigationMenuItem {
  /**
   * The unique value for this item.
   */
  readonly value = input.required<string>({
    alias: 'ngpNavigationMenuItemValue',
  });

  private readonly state = ngpNavigationMenuItem({
    value: this.value,
  });

  /**
   * Whether this item is currently open.
   */
  readonly open = this.state.open;
}
