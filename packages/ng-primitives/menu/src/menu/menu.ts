import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpFocusTrap, provideFocusTrapState } from 'ng-primitives/focus-trap';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { injectMenuConfig } from '../config/menu-config';
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
  private readonly config = injectMenuConfig();
  private readonly state = ngpMenu({});

  /**
   * Whether focus should wrap around when reaching the end of the menu.
   * @default true
   */
  readonly wrap = input<boolean, BooleanInput>(this.config.wrap, {
    alias: 'ngpMenuWrap',
    transform: booleanAttribute,
  });

  constructor() {
    ngpRovingFocusGroup({ inherit: false, wrap: this.wrap });
    ngpFocusTrap({});
  }

  /** @internal Close the menu and any parent menus */
  closeAllMenus(origin: FocusOrigin): void {
    this.state.closeAllMenus(origin);
  }
}
