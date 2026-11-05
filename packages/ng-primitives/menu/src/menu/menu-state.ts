import { FocusOrigin } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { computed, ElementRef, inject, Signal, signal } from '@angular/core';
import { ngpFocusTrap } from 'ng-primitives/focus-trap';
import {
  claimEscapeKey,
  createHoverTransitTracker,
  HoverTransitTracker,
  injectElementRef,
  labelledByTrigger,
} from 'ng-primitives/internal';
import { injectOverlay, NgpOverlayFinalFocus } from 'ng-primitives/portal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
  styleBinding,
} from 'ng-primitives/state';
import { onChange } from 'ng-primitives/utils';
import { Subject } from 'rxjs';
import { injectMenuTriggerState } from '../menu-trigger/menu-trigger-state';

export interface NgpMenuState extends HoverTransitTracker {
  /**
   * Close the menu and any parent menus.
   * @param origin - The focus origin
   * @param options.immediate - Whether to skip the hide delay
   */
  closeAllMenus(origin: FocusOrigin, options?: { immediate?: boolean }): void;
  /**
   * Subject that emits when submenus should be closed.
   * @internal
   */
  readonly closeSubmenus: Subject<HTMLElement>;
  /**
   * The panel's host element - the shared container a submenu trigger
   * suppresses pointer-events on while a sibling's hover-bridge is active.
   * @internal
   */
  readonly element: ElementRef<HTMLElement>;
  /**
   * Whether the root menu's open state is bound, so its binding decides for the whole chain.
   * @internal
   */
  isOpenControlled(): boolean;
}

export interface NgpMenuProps {
  /** Where focus goes when the menu closes. */
  readonly finalFocus?: Signal<NgpOverlayFinalFocus | null>;
  /** The menu directives' `wrap` input. Wrapping itself is set on their roving focus group. */
  readonly wrap?: Signal<boolean>;
}

export const [NgpMenuStateToken, ngpMenu, injectMenuState, provideMenuState] = createPrimitive(
  'NgpMenu',
  ({ finalFocus = signal<NgpOverlayFinalFocus | null>(null) }: NgpMenuProps) => {
    const element = injectElementRef<HTMLElement>();
    const transit = createHoverTransitTracker();
    const overlay = injectOverlay();
    const directionality = inject(Directionality, { optional: true });
    const menuTrigger = injectMenuTriggerState();
    const parentMenu = injectMenuState({ optional: true, skipSelf: true });

    // Always trap focus in menus per WAI-ARIA guidelines (Tab should not navigate within menus)
    // Pass the open origin so focus trap uses the correct origin for :focus-visible styling
    const openOrigin = computed(() => menuTrigger()?.openOrigin() ?? 'program');
    ngpFocusTrap({
      focusOrigin: openOrigin,
    });

    // Register this element as the overlay outlet so floating-ui positions it correctly,
    // even when this directive is on a nested child component rather than the portal root.
    overlay.registerOutletElement(element.nativeElement);
    overlay.registerAvailableSizePrefix('--ngp-menu');

    onChange(finalFocus, value => overlay.setFinalFocus(value));
    onDestroy(() => overlay.removeFinalFocus());

    // Host bindings
    attrBinding(element, 'role', 'menu');
    labelledByTrigger(element, () => menuTrigger()?.triggerId());
    attrBinding(element, 'data-placement', overlay.finalPlacement);
    dataBinding(element, 'data-reference-hidden', overlay.referenceHidden);
    attrBinding(element, 'data-overlay', '');
    styleBinding(element, 'left.px', () => overlay.position().x ?? null);
    styleBinding(element, 'top.px', () => overlay.position().y ?? null);
    styleBinding(element, '--ngp-menu-trigger-width.px', overlay.triggerWidth);
    styleBinding(element, '--ngp-menu-transform-origin', overlay.transformOrigin);
    styleBinding(element, '--ngp-menu-available-width.px', overlay.availableWidth);
    styleBinding(element, '--ngp-menu-available-height.px', overlay.availableHeight);

    // Event listeners for pointer tracking and keyboard
    listener(element, 'pointerenter', onPointerEnter);
    listener(element, 'pointerleave', onPointerLeave);
    listener(element, 'keydown', onKeydown);

    // Escape inside the menu is handled by onKeydown, so the overlay registry must not
    // dismiss it as well: a bound trigger would report the same Escape twice.
    claimEscapeKey(event => event.composedPath().includes(element.nativeElement));

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
      // Handle Escape key - close all menus and restore focus to root trigger
      // We handle this here instead of using overlay's closeOnEscape to ensure
      // proper focus restoration through the closeAllMenus chain
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeAllMenus('keyboard', { immediate: true });
        return;
      }

      // Only handle arrow close keys for top-level menus (no parent submenu)
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

    function closeAllMenus(origin: FocusOrigin, options?: { immediate?: boolean }): void {
      const parent = parentMenu();

      if (!parent) {
        if (!overlay.isClosing()) {
          overlay.hide({ origin, immediate: options?.immediate });
        }
        return;
      }

      // A bound root decides for the chain: its overlay closes the nested menus once the close
      // commits, so a close the binding declines leaves them open.
      if (isOpenControlled()) {
        parent.closeAllMenus(origin, options);
        return;
      }

      // Otherwise each nested menu closes first, without the root's hide delay, and animates out.
      overlay.hide({ origin });
      parent.closeAllMenus(origin);
    }

    function isOpenControlled(): boolean {
      const parent = parentMenu();
      return parent ? parent.isOpenControlled() : (menuTrigger()?.isOpenControlled?.() ?? false);
    }

    return {
      closeAllMenus,
      closeSubmenus,
      element,
      isOpenControlled,
      ...transit,
    } satisfies NgpMenuState;
  },
);
