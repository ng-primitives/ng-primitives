import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { provideFocusTrapState } from 'ng-primitives/focus-trap';
import { ngpMenu, provideMenuState } from 'ng-primitives/menu';
import { provideControlContainerIsolation } from 'ng-primitives/portal';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';

/**
 * The `NgpContextMenu` is a container for context menu items.
 */
@Directive({
  selector: '[ngpContextMenu]',
  exportAs: 'ngpContextMenu',
  providers: [
    provideRovingFocusGroupState({ inherit: false }),
    provideMenuState({ inherit: false }),
    provideFocusTrapState(),
    provideControlContainerIsolation(),
  ],
})
export class NgpContextMenu {
  /**
   * Whether focus should wrap around when reaching the end of the menu.
   * @default true
   */
  readonly wrap = input<boolean, BooleanInput>(true, {
    alias: 'ngpContextMenuWrap',
    transform: booleanAttribute,
  });

  /**
   * Whether Escape closes only the submenu that has focus, and focuses its submenu trigger,
   * instead of closing the whole menu. Set it on the root menu; it applies to every submenu.
   * @default false
   */
  readonly escapeClosesSubmenu = input<boolean, BooleanInput>(false, {
    alias: 'ngpContextMenuEscapeClosesSubmenu',
    transform: booleanAttribute,
  });

  private readonly state = ngpMenu({
    wrap: this.wrap,
    escapeClosesSubmenu: this.escapeClosesSubmenu,
  });

  constructor() {
    ngpRovingFocusGroup({ inherit: false, wrap: this.wrap });
  }

  /** @internal Close the menu and any parent menus */
  closeAllMenus(origin: FocusOrigin): void {
    this.state.closeAllMenus(origin);
  }
}
