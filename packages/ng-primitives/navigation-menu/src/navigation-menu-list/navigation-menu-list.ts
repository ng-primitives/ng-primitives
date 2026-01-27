import { Directive } from '@angular/core';
import { ngpNavigationMenuList, provideNavigationMenuListState } from './navigation-menu-list-state';

/**
 * Apply the `ngpNavigationMenuList` directive to contain top-level menu items.
 */
@Directive({
  selector: '[ngpNavigationMenuList]',
  exportAs: 'ngpNavigationMenuList',
  providers: [provideNavigationMenuListState({ inherit: false })],
  host: {
    role: 'menubar',
  },
})
export class NgpNavigationMenuList {
  private readonly state = ngpNavigationMenuList();
}
