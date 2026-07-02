import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
  computed,
  effect,
  inject,
  Injector,
  signal,
  Signal,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { createHoverBridge, injectElementRef } from 'ng-primitives/internal';
import {
  createOverlay,
  NgpFlip,
  NgpOffset,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
} from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  listener,
} from 'ng-primitives/state';
import { injectDisposables, safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { NgpMenuPlacement } from '../menu-trigger/menu-trigger';
import { injectMenuState } from '../menu/menu-state';

export interface NgpSubmenuTriggerState {
  /**
   * The menu template or component.
   */
  readonly menu: WritableSignal<NgpOverlayContent<any> | undefined>;

  /**
   * The computed placement of the menu.
   */
  readonly placement: WritableSignal<NgpMenuPlacement>;

  /**
   * Whether the menu is open.
   */
  readonly open: Signal<boolean>;

  /**
   * The offset of the menu.
   */
  readonly offset: WritableSignal<NgpOffset>;

  /**
   * The disabled state of the trigger.
   */
  readonly disabled: WritableSignal<boolean>;

  /**
   * Whether the menu should flip when there is not enough space.
   */
  readonly flip: WritableSignal<NgpFlip>;

  /**
   * The container in which the menu should be attached.
   * @default document.body
   */
  readonly container: WritableSignal<HTMLElement | string | null>;

  /**
   * The focus origin used to open the submenu.
   * Used by the submenu's focus trap for :focus-visible styling.
   * @internal
   */
  readonly openOrigin: Signal<FocusOrigin>;

  /**
   * Show the menu.
   * @param origin - The focus origin (keyboard, mouse, touch, or program)
   */
  show(origin?: FocusOrigin): void;

  /**
   * Hide the menu.
   * @param origin - The focus origin
   */
  hide(origin?: FocusOrigin): void;

  /**
   * Toggle the menu.
   * @param event - The mouse event
   */
  toggle(event: MouseEvent): void;

  /**
   * Set whether the trigger is disabled.
   * @param isDisabled - Whether the trigger is disabled
   */
  setDisabled(isDisabled: boolean): void;

  /**
   * Set the menu template or component.
   * @param menu - The menu content
   */
  setMenu(menu: NgpOverlayContent<any> | undefined): void;

  /**
   * Set the placement of the menu.
   * @param placement - The menu placement
   */
  setPlacement(placement: NgpMenuPlacement): void;

  /**
   * Set the offset of the menu.
   * @param offset - The menu offset
   */
  setOffset(offset: NgpOffset): void;

  /**
   * Set whether the menu should flip when there is not enough space.
   * @param shouldFlip - Whether the menu should flip
   */
  setFlip(shouldFlip: NgpFlip): void;

  /**
   * Set the container in which the menu should be attached. Takes effect the
   * next time the menu is opened; it does not move a menu that is already open.
   * @param container - The new container
   */
  setContainer(container: HTMLElement | string | null): void;

  /**
   * Focus the trigger element.
   * @param origin - The focus origin
   */
  focus(origin: FocusOrigin): void;

  /**
   * Set whether the pointer is over the submenu content. Entering the submenu
   * tears down the hover bridge (the pointer arrived safely).
   * @param isOver - Whether the pointer is over the content
   * @internal
   */
  setPointerOverContent(isOver: boolean): void;
}

export interface NgpSubmenuTriggerProps<T = unknown> {
  /**
   * Whether the trigger is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * The menu template or component.
   */
  readonly menu?: Signal<NgpOverlayContent<T> | undefined>;
  /**
   * The placement of the menu.
   */
  readonly placement?: Signal<NgpMenuPlacement>;
  /**
   * The offset of the menu.
   */
  readonly offset?: Signal<NgpOffset>;
  /**
   * Whether the menu should flip when there is not enough space.
   */
  readonly flip?: Signal<NgpFlip>;
  /**
   * The container in which the menu should be attached.
   */
  readonly container?: Signal<HTMLElement | string | null>;
}

export const [
  NgpSubmenuTriggerStateToken,
  ngpSubmenuTrigger,
  injectSubmenuTriggerState,
  provideSubmenuTriggerState,
] = createPrimitive(
  'NgpSubmenuTrigger',
  <T>({
    disabled: _disabled = signal(false),
    menu: _menu = signal<NgpOverlayContent<T> | undefined>(undefined),
    placement: _placement = signal('right-start'),
    offset: _offset = signal(0),
    flip: _flip = signal(true),
    container: _container,
  }: NgpSubmenuTriggerProps<T>) => {
    const element = injectElementRef();
    const injector = inject(Injector);
    const viewContainerRef = inject(ViewContainerRef);
    const parentMenu = injectMenuState({ optional: true });
    const focusMonitor = inject(FocusMonitor);
    const disposables = injectDisposables();

    // Controlled properties
    const menu = controlled(_menu);
    const disabled = controlled(_disabled);
    const placement = controlled(_placement);
    const flip = controlled(_flip);
    const offset = controlled(_offset);
    const container = controlled(_container, 'body');

    const overlay = signal<NgpOverlay<T> | null>(null);
    const open = computed(() => overlay()?.isOpen() ?? false);
    const openOrigin = signal<FocusOrigin>('program');

    // Track pointer presence for the safe-polygon hover bridge.
    const pointerOverTrigger = signal(false);
    const pointerOverContent = signal(false);
    const isPointerOverSubmenu = computed(() => pointerOverTrigger() || pointerOverContent());

    // Safe-polygon hover intent: while the pointer travels inside a corridor from
    // the submenu trigger toward the open submenu, sibling hover events are
    // ignored so the submenu doesn't collapse mid-traversal.
    const hoverBridge = createHoverBridge({
      isPointerInAnchor: isPointerOverSubmenu,
      close: () => hide('mouse'),
      requireForwardMovement: true,
    });

    // Tear down any hover bridge whenever the submenu closes - including close
    // paths that bypass hide() (e.g. an outside click on the overlay), so a
    // stale corridor can't linger or wrongly suppress the next sibling hover.
    // Also reset the pointer flags: destroying the panel under the pointer never
    // fires its pointerleave, and a stuck pointerOverContent would make every
    // future corridor treat the pointer as anchored and never close.
    effect(() => {
      if (!open()) {
        hoverBridge.clear();
        pointerOverTrigger.set(false);
        pointerOverContent.set(false);
      }
    });

    // Subscribe to parent menu's closeSubmenus
    parentMenu()
      ?.closeSubmenus.pipe(safeTakeUntilDestroyed())
      .subscribe(submenuElement => {
        // if the element is not the trigger, we want to close the menu
        if (submenuElement === element.nativeElement) {
          return;
        }

        // While the pointer is still inside the safe-polygon corridor toward this
        // submenu, ignore sibling hover-driven closes. The pointer-move listener
        // closes the submenu itself once the pointer actually leaves the corridor.
        if (hoverBridge.isActive()) {
          return;
        }

        hide('mouse');
      });

    // Host bindings
    attrBinding(element, 'aria-haspopup', 'true');
    attrBinding(element, 'aria-expanded', open);
    dataBinding(element, 'data-open', open);

    // Event listeners
    listener(element, 'click', onClick);
    listener(element, 'keydown', handleArrowKey);
    listener(element, 'pointerenter', showSubmenuOnHover);
    listener(element, 'pointerleave', onPointerLeave);

    // Methods
    function onClick(event: MouseEvent): void {
      if (disabled?.()) {
        return;
      }
      toggle(event);
    }

    function toggle(event: MouseEvent): void {
      // determine the origin of the event, 0 is keyboard, 1 is mouse
      const origin: FocusOrigin = event.detail === 0 ? 'keyboard' : 'mouse';

      // if the menu is open then hide it
      if (open()) {
        hide(origin);
      } else {
        show(origin);
      }
    }

    function show(origin: FocusOrigin = 'program'): void {
      // If the trigger is disabled, don't show the menu
      if (disabled?.()) {
        return;
      }

      // Store the origin used to open the menu (for focus-visible styling in submenu)
      openOrigin.set(origin);

      // Create the overlay if it doesn't exist yet
      if (!overlay()) {
        createOverlayInstance();
      }

      // Show the overlay
      overlay()?.show();
    }

    function hide(origin: FocusOrigin = 'program'): void {
      // If the trigger is disabled or the menu is not open, do nothing
      if (disabled?.() || !open()) {
        return;
      }

      // The submenu is closing - any active hover bridge is no longer relevant.
      hoverBridge.clear();

      // Hide the overlay
      overlay()?.hide({ origin });
    }

    function createOverlayInstance(): void {
      const menuContent = menu?.();

      if (!menuContent) {
        throw new Error('Menu must be either a TemplateRef or a ComponentType');
      }

      // Create config for the overlay
      // Note: restoreFocus is false because submenus should never auto-restore focus.
      // When closeAllMenus is called, the ROOT menu's overlay handles focus restoration.
      // When closing just the submenu (Left Arrow), the caller handles focus explicitly.
      // closeOnEscape is false because we handle Escape in menu-state.ts to ensure
      // proper focus restoration through closeAllMenus.
      const config: NgpOverlayConfig<T> = {
        content: menuContent,
        triggerElement: element.nativeElement,
        injector,
        container: container(),
        placement,
        offset: offset(),
        flip: flip(),
        closeOnOutsideClick: true,
        closeOnEscape: false,
        restoreFocus: false,
        viewContainerRef,
      };

      overlay.set(createOverlay(config));
    }

    function handleArrowKey(event: Event): void {
      if (event instanceof KeyboardEvent === false) {
        return;
      }

      const direction = getComputedStyle(element.nativeElement).direction;
      const isRtl = direction === 'rtl';

      const isRightArrow = event.key === 'ArrowRight';
      const isLeftArrow = event.key === 'ArrowLeft';

      if ((isRightArrow && !isRtl) || (isLeftArrow && isRtl)) {
        event.preventDefault();
        show('keyboard');
      }
    }

    function showSubmenuOnHover(event: Event): void {
      if (event instanceof PointerEvent === false) {
        return;
      }

      // if this was triggered by a touch event, we don't want to show the submenu
      // as it will be shown by the click event - this prevents the submenu from being toggled
      if (event.pointerType === 'touch') {
        return;
      }

      pointerOverTrigger.set(true);
      // The pointer is back on the trigger - drop any in-progress hover bridge.
      hoverBridge.clear();

      show('mouse');
    }

    function onPointerLeave(event: Event): void {
      if (event instanceof PointerEvent === false || event.pointerType === 'touch') {
        return;
      }

      pointerOverTrigger.set(false);

      const currentOverlay = overlay();

      // Only build a corridor while the submenu is actually open.
      if (!open() || !currentOverlay) {
        return;
      }

      const submenuElement = currentOverlay.getElements()[0];
      const started =
        !!submenuElement &&
        hoverBridge.track({
          triggerRect: element.nativeElement.getBoundingClientRect(),
          targetRect: submenuElement.getBoundingClientRect(),
          exitPoint: { x: event.clientX, y: event.clientY },
        });

      if (!started) {
        // Defensive fallback: if the corridor can't be built, close after a short
        // grace period rather than leaving the submenu stuck open.
        disposables.setTimeout(() => {
          if (!isPointerOverSubmenu()) {
            hide('mouse');
          }
        }, 50);
      }
    }

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);

      if (isDisabled && open()) {
        hide();
      }
    }

    function setMenu(newMenu: NgpOverlayContent<T> | undefined): void {
      menu.set(newMenu);
    }

    function setPlacement(newPlacement: NgpMenuPlacement): void {
      placement.set(newPlacement);
    }

    function setOffset(newOffset: NgpOffset): void {
      offset.set(newOffset);
    }

    function setFlip(shouldFlip: NgpFlip): void {
      flip.set(shouldFlip);
    }

    function setContainer(newContainer: HTMLElement | string | null): void {
      container.set(newContainer);
    }

    function focus(origin: FocusOrigin): void {
      focusMonitor.focusVia(element.nativeElement, origin, { preventScroll: true });
    }

    function setPointerOverContent(isOver: boolean): void {
      pointerOverContent.set(isOver);

      // Reaching the submenu content means the pointer arrived safely, so the
      // hover bridge corridor is no longer needed.
      if (isOver) {
        hoverBridge.clear();
      }
    }

    return {
      placement: deprecatedSetter(placement, 'setPlacement'),
      offset: deprecatedSetter(offset, 'setOffset'),
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      menu: deprecatedSetter(menu, 'setMenu'),
      flip: deprecatedSetter(flip, 'setFlip'),
      open,
      openOrigin,
      show,
      hide,
      toggle,
      setDisabled,
      setMenu,
      setFlip,
      setPlacement,
      setOffset,
      setContainer,
      focus,
      setPointerOverContent,
      container: deprecatedSetter(container, 'setContainer', setContainer),
    } satisfies NgpSubmenuTriggerState;
  },
);
