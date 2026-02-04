import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
  computed,
  inject,
  Injector,
  signal,
  Signal,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  createOverlay,
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
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
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
  readonly flip: WritableSignal<boolean>;

  /**
   * Show the menu.
   */
  show(): void;

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
  setFlip(shouldFlip: boolean): void;

  /**
   * Focus the trigger element.
   * @param origin - The focus origin
   */
  focus(origin: FocusOrigin): void;
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
  readonly flip?: Signal<boolean>;
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
  }: NgpSubmenuTriggerProps<T>) => {
    const element = injectElementRef();
    const injector = inject(Injector);
    const viewContainerRef = inject(ViewContainerRef);
    const parentMenu = injectMenuState({ optional: true });
    const focusMonitor = inject(FocusMonitor);

    // Controlled properties
    const menu = controlled(_menu);
    const disabled = controlled(_disabled);
    const placement = controlled(_placement);
    const flip = controlled(_flip);
    const offset = controlled(_offset);

    const overlay = signal<NgpOverlay<T> | null>(null);
    const open = computed(() => overlay()?.isOpen() ?? false);

    // Subscribe to parent menu's closeSubmenus
    parentMenu()
      ?.closeSubmenus.pipe(safeTakeUntilDestroyed())
      .subscribe(submenuElement => {
        // if the element is not the trigger, we want to close the menu
        if (submenuElement === element.nativeElement) {
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
        // if the origin was keyboard we must set this in the focus monitor manually - for some reason
        // it doesn't pick it up automatically
        if (origin === 'keyboard') {
          (focusMonitor as any)._lastFocusOrigin = 'keyboard';
        }

        show();
      }
    }

    function show(): void {
      // If the trigger is disabled, don't show the menu
      if (disabled?.()) {
        return;
      }

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
      const config: NgpOverlayConfig<T> = {
        content: menuContent,
        triggerElement: element.nativeElement,
        injector,
        placement,
        offset: offset(),
        flip: flip(),
        closeOnOutsideClick: true,
        closeOnEscape: true,
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
        show();
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

      show();
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

    function setFlip(shouldFlip: boolean): void {
      flip.set(shouldFlip);
    }

    function focus(origin: FocusOrigin): void {
      focusMonitor.focusVia(element.nativeElement, origin, { preventScroll: true });
    }

    return {
      placement: deprecatedSetter(placement, 'setPlacement'),
      offset: deprecatedSetter(offset, 'setOffset'),
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      menu: deprecatedSetter(menu, 'setMenu'),
      flip: deprecatedSetter(flip, 'setFlip'),
      open,
      show,
      hide,
      toggle,
      setDisabled,
      setMenu,
      setFlip,
      setPlacement,
      setOffset,
      focus,
    } satisfies NgpSubmenuTriggerState;
  },
);
