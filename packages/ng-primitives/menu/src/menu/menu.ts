import { FocusOrigin } from '@angular/cdk/a11y';
import { Directive, inject } from '@angular/core';
import { injectPopoverTriggerState, NgpPopover } from 'ng-primitives/popover';
import { NgpRovingFocusGroup, provideRovingFocusGroup } from 'ng-primitives/roving-focus';
import { Subject } from 'rxjs';
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
})
export class NgpMenu {
  /** Access the popover trigger state */
  private readonly popover = injectPopoverTriggerState();

  /** Access any parent menus */
  private readonly parentMenu = inject(NgpMenuToken, { optional: true, skipSelf: true });

  /** @internal Whether we should close submenus */
  readonly closeSubmenus = new Subject<HTMLElement>();

  /** Close the menu and any parent menus */
  closeAllMenus(origin: FocusOrigin): void {
    this.popover().hide(origin);
    this.parentMenu?.closeAllMenus(origin);
  }
}
