import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, signal } from '@angular/core';
import { provideFocusTrapState } from 'ng-primitives/focus-trap';
import { NgpOverlayFinalFocus, provideControlContainerIsolation } from 'ng-primitives/portal';
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
    provideControlContainerIsolation(),
  ],
})
export class NgpMenu {
  private readonly config = injectMenuConfig();

  /**
   * Whether focus should wrap around when reaching the end of the menu.
   * @default true
   */
  readonly wrap = input<boolean, BooleanInput>(this.config.wrap, {
    alias: 'ngpMenuWrap',
    transform: booleanAttribute,
  });

  /**
   * Where focus goes when the menu closes: an element, `false` to leave focus where it is,
   * `null` for the default (for a root menu, the element focused when it opened, usually the
   * trigger; a submenu leaves focus alone), `true` for that default in a submenu too, or a
   * function that receives the close origin and returns one of these. Left Arrow in a submenu
   * always focuses its submenu trigger.
   * @default null
   */
  readonly finalFocus = input<NgpOverlayFinalFocus | null>(null, {
    alias: 'ngpMenuFinalFocus',
  });

  /**
   * Whether Escape closes only the submenu that has focus, and focuses its submenu trigger,
   * instead of closing the whole menu. Set it on the root menu; it applies to every submenu.
   * @default false
   */
  readonly escapeClosesOnlySubmenu = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuEscapeClosesOnlySubmenu',
    transform: booleanAttribute,
  });

  private readonly state = ngpMenu({
    finalFocus: this.finalFocus,
    escapeClosesOnlySubmenu: this.escapeClosesOnlySubmenu,
  });

  constructor() {
    ngpRovingFocusGroup({ inherit: false, wrap: this.wrap, typeahead: signal(true) });
  }

  /** @internal Close the menu and any parent menus */
  closeAllMenus(origin: FocusOrigin): void {
    this.state.closeAllMenus(origin);
  }
}
