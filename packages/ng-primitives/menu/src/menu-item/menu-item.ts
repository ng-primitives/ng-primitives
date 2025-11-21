import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, HostListener, inject, Injector, input } from '@angular/core';
import { setupButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { injectMenu } from '../menu/menu-token';
import { NgpSubmenuTrigger } from '../submenu-trigger/submenu-trigger';

/**
 * The `NgpMenuItem` directive represents a menu item.
 */
@Directive({
  selector: '[ngpMenuItem]',
  exportAs: 'ngpMenuItem',
  hostDirectives: [
    { directive: NgpRovingFocusItem, inputs: ['ngpRovingFocusItemDisabled: ngpMenuItemDisabled'] },
  ],
  host: {
    role: 'menuitem',
    '(click)': 'onClick($event)',
    '(keydown.ArrowLeft)': 'handleArrowKey($event)',
    '(keydown.ArrowRight)': 'handleArrowKey($event)',
  },
})
export class NgpMenuItem {
  /** Access the injector */
  private readonly injector = inject(Injector);
  /** Access the button element */
  private readonly elementRef = injectElementRef();

  /** Access the parent menu */
  private readonly parentMenu = injectMenu();

  /** Whether the menu item is disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuItemDisabled',
    transform: booleanAttribute,
  });

  constructor() {
    setupButton({ disabled: this.disabled });
  }

  /** Close the menu when the item is clicked */
  protected onClick(event: MouseEvent): void {
    // we do this here to avoid circular dependency issues
    const trigger = this.injector.get(NgpSubmenuTrigger, null, { self: true, optional: true });

    const origin: FocusOrigin = event.detail === 0 ? 'keyboard' : 'mouse';

    // if this is a submenu trigger, we don't want to close the menu, we want to open the submenu
    if (!trigger) {
      this.parentMenu?.closeAllMenus(origin);
    }
  }

  /**
   * If the user presses the left arrow key (in LTR) and there is a parent menu,
   * we want to close the menu and focus the parent menu item.
   */
  protected handleArrowKey(event: Event): void {
    if (event instanceof KeyboardEvent === false) {
      return;
    }

    // if there is no parent menu, we don't want to do anything
    const trigger = this.injector.get(NgpSubmenuTrigger, null, { optional: true, skipSelf: true });

    if (!trigger) {
      return;
    }

    const direction = getComputedStyle(this.elementRef.nativeElement).direction;
    const isRtl = direction === 'rtl';

    const isLeftArrow = event.key === 'ArrowLeft';
    const isRightArrow = event.key === 'ArrowRight';

    if ((isLeftArrow && !isRtl) || (isRightArrow && isRtl)) {
      event.preventDefault();

      if (trigger) {
        trigger.hide('keyboard');
      }
    }
  }

  /**
   * If the user hovers over the trigger, we want to open the submenu
   */
  @HostListener('mouseenter')
  protected showSubmenuOnHover(): void {
    this.parentMenu?.closeSubmenus.next(this.elementRef.nativeElement);
  }
}
