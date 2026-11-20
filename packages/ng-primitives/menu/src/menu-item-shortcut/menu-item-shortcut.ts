import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpMenuItemShortcut, provideMenuItemShortcutState } from './menu-item-shortcut-state';

/**
 * The keyboard shortcut of a menu item, such as `⌘D`. Screen readers announce it as the item's
 * description.
 */
@Directive({
  selector: '[ngpMenuItemShortcut]',
  exportAs: 'ngpMenuItemShortcut',
  providers: [provideMenuItemShortcutState()],
})
export class NgpMenuItemShortcut {
  /** The id of the shortcut. */
  readonly id = input<string>(uniqueId('ngp-menu-item-shortcut'));

  /**
   * The keys of the shortcut in the `aria-keyshortcuts` format, such as `Control+D`, for the menu
   * item's `aria-keyshortcuts`. The text inside the element is what users see.
   */
  readonly keys = input<string | undefined>(undefined, {
    alias: 'ngpMenuItemShortcutKeys',
  });

  protected readonly state = ngpMenuItemShortcut({ id: this.id, keys: this.keys });
}
