import { FocusOrigin } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { computed, inject } from '@angular/core';
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

export interface NgpMenuProps {}

export const [NgpMenuStateToken, ngpMenu, injectMenuState, provideMenuState] = createPrimitive(
  'NgpMenu',
  ({}: NgpMenuProps) => {
    const element = injectElementRef();
    const overlay = injectOverlay();
    const directionality = inject(Directionality, { optional: true });
    const menuTrigger = injectMenuTriggerState();
    const parentMenu = injectMenuState({ optional: true, skipSelf: true });

    // Only trap focus when the menu was opened via keyboard
    // Pass the open origin so focus trap uses the correct origin for focus-visible styling
    const openOrigin = computed(() => menuTrigger()?.openOrigin() ?? 'program');
    ngpFocusTrap({
      disabled: computed(() => openOrigin() !== 'keyboard'),
      focusOrigin: openOrigin,
    });

    // Host bindings
    attrBinding(element, 'role', 'menu');
    attrBinding(element, 'data-placement', overlay.finalPlacement);
    attrBinding(element, 'data-overlay', '');
    styleBinding(element, 'left.px', () => overlay.position().x ?? null);
    styleBinding(element, 'top.px', () => overlay.position().y ?? null);
    styleBinding(element, '--ngp-menu-trigger-width.px', overlay.triggerWidth);
    styleBinding(element, '--ngp-menu-transform-origin', overlay.transformOrigin);

    // Event listeners for pointer tracking and keyboard
    listener(element, 'pointerenter', onPointerEnter);
    listener(element, 'pointerleave', onPointerLeave);
    listener(element, 'keydown', onKeydown);

    // Subject to notify children to close submenus
    const closeSubmenus = new Subject<HTMLElement>();

    // Methods
    function onPointerEnter(): void {
      menuTrigger()?.setPointerOverContent(true);
    }

    function onPointerLeave(): void {
      menuTrigger()?.setPointerOverContent(false);
    }

    function onKeydown(event: KeyboardEvent): void {
      // Only handle close key for top-level menus (no parent submenu)
      // Submenus are handled by menu-item-state via NgpSubmenuTrigger
      if (parentMenu()) {
        return;
      }

      const placement = overlay.finalPlacement();
      if (!placement) {
        return;
      }

      const isRtl = (directionality?.value ?? 'ltr') === 'rtl';

      // Determine which arrow key should close based on placement
      // Note: Only Left/Right arrows close menus (for side-placed menus).
      // Up/Down arrows are reserved for roving focus navigation within the menu.
      let shouldClose = false;

      if (placement.startsWith('right')) {
        // Right-placed menu: Left Arrow closes (or Right Arrow in RTL)
        shouldClose = event.key === (isRtl ? 'ArrowRight' : 'ArrowLeft');
      } else if (placement.startsWith('left')) {
        // Left-placed menu: Right Arrow closes (or Left Arrow in RTL)
        shouldClose = event.key === (isRtl ? 'ArrowLeft' : 'ArrowRight');
      }

      if (shouldClose) {
        event.preventDefault();
        event.stopPropagation();
        menuTrigger()?.hide('keyboard');
      }
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
