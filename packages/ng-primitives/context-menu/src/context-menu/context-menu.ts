import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { provideFocusTrapState } from 'ng-primitives/focus-trap';
import { ngpMenu, provideMenuState } from 'ng-primitives/menu';
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

  private readonly state = ngpMenu({ wrap: this.wrap });

  constructor() {
    ngpRovingFocusGroup({ inherit: false, wrap: this.wrap });
  }

  /** @internal Close the menu and any parent menus */
  closeAllMenus(origin: FocusOrigin): void {
    this.state.closeAllMenus(origin);
  }
}
