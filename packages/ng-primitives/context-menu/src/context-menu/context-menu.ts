import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { provideFocusTrapState } from 'ng-primitives/focus-trap';
import { ngpMenu, provideMenuState } from 'ng-primitives/menu';
import { NgpOverlayFinalFocus, provideControlContainerIsolation } from 'ng-primitives/portal';
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
   * Where focus goes when the menu closes: an element, `false` to leave focus where it is,
   * `null` for the default (the element focused when it opened, usually the trigger area), or a
   * function that receives the close origin and returns one of these.
   * @default null
   */
  readonly finalFocus = input<NgpOverlayFinalFocus | null>(null, {
    alias: 'ngpContextMenuFinalFocus',
  });

  private readonly state = ngpMenu({ wrap: this.wrap, finalFocus: this.finalFocus });

  constructor() {
    ngpRovingFocusGroup({ inherit: false, wrap: this.wrap });
  }

  /** @internal Close the menu and any parent menus */
  closeAllMenus(origin: FocusOrigin): void {
    this.state.closeAllMenus(origin);
  }
}
