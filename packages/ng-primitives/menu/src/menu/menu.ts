import { FocusOrigin } from '@angular/cdk/a11y';
import { Directive } from '@angular/core';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { NgpRovingFocusGroup, provideRovingFocusGroup } from 'ng-primitives/roving-focus';
import { ngpMenu, provideMenuState } from './menu-state';
import { provideMenu } from './menu-token';

/**
 * The `NgpMenu` is a container for menu items.
 */
@Directive({
  selector: '[ngpMenu]',
  exportAs: 'ngpMenu',
  hostDirectives: [NgpRovingFocusGroup, NgpFocusTrap],
  providers: [
    // ensure we don't inherit the focus group from the parent menu if there is one
    provideRovingFocusGroup(NgpRovingFocusGroup, { inherit: false }),
    provideMenu(NgpMenu),
    provideMenuState(),
  ],
})
export class NgpMenu {
  private readonly state = ngpMenu({});

  /** @internal Close the menu and any parent menus */
  closeAllMenus(origin: FocusOrigin): void {
    this.state.closeAllMenus(origin);
  }
}
