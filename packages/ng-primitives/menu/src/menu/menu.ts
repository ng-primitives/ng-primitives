import { FocusOrigin } from '@angular/cdk/a11y';
import { Directive } from '@angular/core';
import { ngpFocusTrap, provideFocusTrapState } from 'ng-primitives/focus-trap';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { ngpMenu, provideMenuState } from './menu-state';

/**
 * The `NgpMenu` is a container for menu items.
 */
@Directive({
  selector: '[ngpMenu]',
  exportAs: 'ngpMenu',
  providers: [
    // ensure we don't inherit the focus group from the parent menu if there is one
    provideRovingFocusGroupState({ inherit: false }),
    provideMenuState({ inherit: false }),
    provideFocusTrapState(),
  ],
})
export class NgpMenu {
  private readonly state = ngpMenu({});

  constructor() {
    ngpRovingFocusGroup({ inherit: false });
    ngpFocusTrap({});
  }

  /** @internal Close the menu and any parent menus */
  closeAllMenus(origin: FocusOrigin): void {
    this.state.closeAllMenus(origin);
  }
}
