import { FocusOrigin } from '@angular/cdk/a11y';
import { inject, Injector, signal, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, listener } from 'ng-primitives/state';
import { injectMenuState } from '../menu/menu-state';
import { NgpSubmenuTrigger } from '../submenu-trigger/submenu-trigger';

export interface NgpMenuItemState {}

export interface NgpMenuItemProps {
  /**
   * Whether the menu item is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [NgpMenuItemStateToken, ngpMenuItem, injectMenuItemState, provideMenuItemState] =
  createPrimitive('NgpMenuItem', ({ disabled = signal(false) }: NgpMenuItemProps) => {
    const element = injectElementRef();
    const injector = inject(Injector);
    const parentMenu = injectMenuState({ optional: true });

    ngpButton({ disabled });

    // Host bindings
    attrBinding(element, 'role', 'menuitem');

    // Event listeners
    listener(element, 'click', onClick);
    listener(element, 'keydown', handleArrowKey);
    listener(element, 'mouseenter', showSubmenuOnHover);

    // Methods
    function onClick(event: MouseEvent): void {
      // we do this here to avoid circular dependency issues
      const trigger = injector.get(NgpSubmenuTrigger, null, { self: true, optional: true });

      const origin: FocusOrigin = event.detail === 0 ? 'keyboard' : 'mouse';

      // if this is a submenu trigger, we don't want to close the menu, we want to open the submenu
      if (!trigger) {
        parentMenu()?.closeAllMenus(origin);
      }
    }

    function handleArrowKey(event: Event): void {
      if (event instanceof KeyboardEvent === false) {
        return;
      }

      // if there is no parent menu, we don't want to do anything
      const trigger = injector.get(NgpSubmenuTrigger, null, { optional: true, skipSelf: true });

      if (!trigger) {
        return;
      }

      const direction = getComputedStyle(element.nativeElement).direction;
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

    function showSubmenuOnHover(): void {
      parentMenu()?.closeSubmenus.next(element.nativeElement);
    }

    return {};
  });
