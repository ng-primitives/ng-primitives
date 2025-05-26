import { FocusOrigin } from '@angular/cdk/a11y';
import { Directive, inject } from '@angular/core';
import { NgpPopover } from 'ng-primitives/popover';
import { injectOverlay } from 'ng-primitives/portal';
import { NgpRovingFocusGroup, provideRovingFocusGroup } from 'ng-primitives/roving-focus';
import { Subject } from 'rxjs';
import { injectMenuTriggerState } from '../menu-trigger/menu-trigger-state';
import { NgpMenuToken, provideMenu } from './menu-token';

/**
 * The `NgpMenu` is a container for menu items.
 */
@Directive({
  selector: '[ngpMenu]',
  exportAs: 'ngpMenu',
  hostDirectives: [NgpPopover, NgpRovingFocusGroup],
  providers: [
    // ensure we don't inherit the focus group from the parent menu if there is one
    provideRovingFocusGroup(NgpRovingFocusGroup, { inherit: false }),
    provideMenu(NgpMenu),
  ],
  host: {
    role: 'menu',
    '[style.left.px]': 'overlay.position().x',
    '[style.top.px]': 'overlay.position().y',
    '[style.--ngp-menu-trigger-width.px]': 'overlay.triggerWidth()',
    '[style.--ngp-menu-transform-origin]': 'overlay.transformOrigin()',
  },
})
export class NgpMenu {
  /**
   * Access the overlay.
   */
  protected readonly overlay = injectOverlay();

  /** Access the menu trigger state */
  private readonly menuTrigger = injectMenuTriggerState();

  /** Access any parent menus */
  private readonly parentMenu = inject(NgpMenuToken, { optional: true, skipSelf: true });

  /** @internal Whether we should close submenus */
  readonly closeSubmenus = new Subject<HTMLElement>();

  /** Close the menu and any parent menus */
  closeAllMenus(origin: FocusOrigin): void {
    this.menuTrigger().hide(origin);
    this.parentMenu?.closeAllMenus(origin);
  }
}
