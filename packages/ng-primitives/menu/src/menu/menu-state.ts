import { FocusOrigin } from '@angular/cdk/a11y';
import { computed, Signal } from '@angular/core';
import { ngpFocusTrap } from 'ng-primitives/focus-trap';
import { injectElementRef } from 'ng-primitives/internal';
import { injectOverlay } from 'ng-primitives/portal';
import { attrBinding, createPrimitive, listener, styleBinding } from 'ng-primitives/state';
import { Subject } from 'rxjs';
import { injectMenuTriggerState } from '../menu-trigger/menu-trigger-state';

export interface NgpMenuState {
  /**
   * Close the menu and any parent menus.
   * @param origin - The focus origin
   */
  closeAllMenus(origin: FocusOrigin): void;
  /**
   * Subject that emits when submenus should be closed.
   * @internal
   */
  readonly closeSubmenus: Subject<HTMLElement>;
}

export interface NgpMenuProps {
  /**
   * Whether focus should wrap around when reaching the end of the menu.
   */
  readonly wrap?: Signal<boolean>;
}

export const [NgpMenuStateToken, ngpMenu, injectMenuState, provideMenuState] = createPrimitive(
  'NgpMenu',
  ({ wrap }: NgpMenuProps) => {
    const element = injectElementRef();
    const overlay = injectOverlay();
    const menuTrigger = injectMenuTriggerState();
    const parentMenu = injectMenuState({ optional: true, skipSelf: true });

    // Only trap focus when the menu was opened via keyboard
    ngpFocusTrap({ disabled: computed(() => menuTrigger().openOrigin() !== 'keyboard') });

    // Host bindings
    attrBinding(element, 'role', 'menu');
    attrBinding(element, 'data-placement', overlay.finalPlacement);
    attrBinding(element, 'data-overlay', '');
    styleBinding(element, 'left.px', () => overlay.position().x ?? null);
    styleBinding(element, 'top.px', () => overlay.position().y ?? null);
    styleBinding(element, '--ngp-menu-trigger-width.px', overlay.triggerWidth);
    styleBinding(element, '--ngp-menu-transform-origin', overlay.transformOrigin);

    // Event listeners for pointer tracking
    listener(element, 'pointerenter', onPointerEnter);
    listener(element, 'pointerleave', onPointerLeave);

    // Subject to notify children to close submenus
    const closeSubmenus = new Subject<HTMLElement>();

    // Methods
    function onPointerEnter(): void {
      menuTrigger()?.setPointerOverContent(true);
    }

    function onPointerLeave(): void {
      menuTrigger()?.setPointerOverContent(false);
    }

    function closeAllMenus(origin: FocusOrigin): void {
      menuTrigger().hide(origin);
      parentMenu()?.closeAllMenus(origin);
    }

    return {
      closeAllMenus,
      closeSubmenus,
    } satisfies NgpMenuState;
  },
);
