import { FocusOrigin } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
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
import {
  createHoverBridgePolygon,
  HOVER_BRIDGE_TIMEOUT_MS,
  HoverBridgePoint,
  injectElementRef,
  isPointInHoverBridgePolygon,
} from 'ng-primitives/internal';
import {
  createOverlay,
  NgpFlip,
  NgpOffset,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
  NgpShift,
} from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  listener,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { injectDisposables } from 'ng-primitives/utils';
import { NgpMenuTriggerType } from '../config/menu-config';
import { NgpMenuPlacement } from './menu-trigger';

export interface NgpMenuTriggerState<T = unknown> {
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
   * The context provided to the menu.
   */
  readonly context: WritableSignal<T>;

  /**
   * The focus origin that was used to open the menu.
   * @internal
   */
  readonly openOrigin: Signal<FocusOrigin>;

  /**
   * Set whether the trigger is disabled.
   * @param isDisabled - Whether the trigger is disabled
   */
  setDisabled(isDisabled: boolean): void;

  /**
   * Set whether the menu should flip when there is not enough space.
   * @param shouldFlip - Whether the menu should flip
   */
  setFlip(shouldFlip: NgpFlip): void;

  /**
   * Set the placement of the menu.
   * @param placement - The new placement
   */
  setPlacement(placement: NgpMenuPlacement): void;

  /**
   * Set the offset of the menu.
   * @param offset - The new offset
   */
  setOffset(offset: NgpOffset): void;

  /**
   * Set the context provided to the menu.
   * @param context - The new context
   */
  setContext(context: T): void;

  /**
   * Set the container in which the menu should be attached. Takes effect the
   * next time the menu is opened; it does not move a menu that is already open.
   * @param container - The new container
   */
  setContainer(container: HTMLElement | string | null): void;

  /**
   * Show the menu.
   * @param origin - The focus origin
   */
  show(origin?: FocusOrigin): void;
  /**
   * Hide the menu.
   * @param origin - The focus origin
   * @internal
   */
  hide(origin?: FocusOrigin): void;
  /**
   * Toggle the menu.
   * @param event - The mouse event
   */
  toggle(event: MouseEvent): void;

  /**
   * Set the menu content.
   * @param menu - The new menu
   */
  setMenu(menu: NgpOverlayContent<any>): void;

  /**
   * Set whether the pointer is over the menu content.
   * @param isOver - Whether the pointer is over the content
   * @internal
   */
  setPointerOverContent(isOver: boolean): void;
}

export interface NgpMenuTriggerProps<T = unknown> {
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

  /**
   * Configure shift behavior to keep the menu in view.
   */
  readonly shift?: Signal<NgpShift>;

  /**
   * How the menu behaves when the window is scrolled.
   */
  readonly scrollBehavior?: Signal<'reposition' | 'block' | 'close'>;
  /**
   * Context to provide to the menu.
   */
  readonly context?: Signal<T>;
  /**
   * Cooldown duration in milliseconds.
   */
  readonly cooldown?: Signal<number>;

  /**
   * Which trigger types are enabled.
   */
  readonly triggers?: Signal<NgpMenuTriggerType[]>;

  /**
   * The delay before showing the menu.
   */
  readonly showDelay?: Signal<number>;

  /**
   * The delay before hiding the menu.
   */
  readonly hideDelay?: Signal<number>;
}

export const [
  NgpMenuTriggerStateToken,
  ngpMenuTrigger,
  _injectMenuTriggerState,
  provideMenuTriggerState,
] = createPrimitive(
  'NgpMenuTrigger',
  <T>({
    disabled: _disabled = signal(false),
    menu: _menu = signal<NgpOverlayContent<T> | undefined>(undefined),
    placement: _placement = signal('bottom-start' as NgpMenuPlacement),
    offset: _offset = signal(4),
    flip: _flip = signal(true),
    shift: _shift = signal(undefined),
    context: _context = signal<T>(undefined as T),
    container: _container,
    scrollBehavior,
    cooldown,
    triggers = signal(['click'] as NgpMenuTriggerType[]),
    showDelay = signal(0),
    hideDelay = signal(0),
  }: NgpMenuTriggerProps<T>) => {
    const element = injectElementRef();
    const injector = inject(Injector);
    const viewContainerRef = inject(ViewContainerRef);
    const directionality = inject(Directionality);
    const disposables = injectDisposables();

    // Controlled properties
    const menu = controlled(_menu);
    const disabled = controlled(_disabled);
    const placement = controlled(_placement);
    const flip = controlled(_flip);
    const shift = controlled(_shift);
    const offset = controlled(_offset);
    const context = controlled(_context);
    const container = controlled(_container, 'body');

    // Internal state
    const overlay = signal<NgpOverlay<T> | null>(null);
    const open = computed(() => overlay()?.isOpen() ?? false);
    const openOrigin = signal<FocusOrigin>('program');
    const closeOrigin = signal<FocusOrigin>('program');

    // Track whether pointer is over trigger or content (for hover triggers)
    const pointerOverTrigger = signal(false);
    const pointerOverContent = signal(false);
    const isPointerOverMenuArea = computed(() => pointerOverTrigger() || pointerOverContent());

    // Safe-polygon hover intent: while the pointer travels inside this corridor
    // from the trigger exit point toward the open menu, the menu stays open.
    const hoverBridgePolygon = signal<HoverBridgePoint[] | null>(null);
    let removePointerMoveListener: (() => void) | undefined = undefined;
    let clearHoverBridgeTimeout: (() => void) | undefined = undefined;

    // Reset pointer tracking when menu closes
    effect(() => {
      const isOpen = open();

      // When menu closes, reset pointer tracking state and tear down any
      // in-progress hover bridge (and its global listener).
      if (!isOpen) {
        clearHoverBridge();
        pointerOverTrigger.set(false);
        pointerOverContent.set(false);
      }
    });

    // Computed signal to determine if focus should be restored
    // Only restore if opened via keyboard OR closed via keyboard
    const shouldRestoreFocus = computed(
      () => openOrigin() === 'keyboard' || closeOrigin() === 'keyboard',
    );

    // Host bindings
    attrBinding(element, 'aria-haspopup', 'true');
    attrBinding(element, 'aria-expanded', open);
    dataBinding(element, 'data-open', open);
    dataBinding(element, 'data-placement', placement);

    // Event listeners - conditionally add based on enabled triggers
    listener(element, 'click', onClick);
    listener(element, 'pointerenter', onPointerEnter);
    listener(element, 'pointerleave', onPointerLeave);
    listener(element, 'focus', onFocus);
    listener(element, 'blur', onBlur);
    listener(element, 'keydown', onKeydown);

    // Methods
    function onClick(event: MouseEvent): void {
      if (disabled?.() || !triggers().includes('click')) {
        return;
      }
      toggle(event);
    }

    function onPointerEnter(event: PointerEvent): void {
      if (disabled?.() || !triggers().includes('hover')) {
        return;
      }

      // Don't trigger on touch events
      if (event.pointerType === 'touch') {
        return;
      }

      pointerOverTrigger.set(true);

      // If already open, cancel any pending hide - the pointer is back on the
      // trigger, so any in-progress hover bridge is no longer needed.
      if (open()) {
        clearHoverBridge();
        overlay()?.cancelPendingClose();
        return;
      }

      show('mouse');
    }

    function onPointerLeave(event: PointerEvent): void {
      if (disabled?.() || !triggers().includes('hover')) {
        return;
      }

      // Don't trigger on touch events
      if (event.pointerType === 'touch') {
        return;
      }

      pointerOverTrigger.set(false);

      const currentOverlay = overlay();

      // If the overlay hasn't been created, there's nothing to cancel
      if (!currentOverlay) {
        return;
      }

      // Build a safe-polygon corridor from the pointer exit point toward the
      // open menu. While the pointer stays inside it the menu stays open, so
      // diagonal travel across the offset gap doesn't collapse the menu.
      const menuElement = open() ? currentOverlay.getElements()[0] : undefined;
      const polygon = menuElement
        ? createHoverBridgePolygon({
            triggerRect: element.nativeElement.getBoundingClientRect(),
            targetRect: menuElement.getBoundingClientRect(),
            exitPoint: { x: event.clientX, y: event.clientY },
          })
        : null;

      if (!polygon) {
        // Fall back to a small grace period when we can't build the corridor.
        disposables.setTimeout(() => {
          if (!isPointerOverMenuArea()) {
            hide();
          }
        }, 50);
        return;
      }

      hoverBridgePolygon.set(polygon);
      currentOverlay.cancelPendingClose();
      registerPointerMoveListener();
      scheduleHoverBridgeCloseFallback();
    }

    function onFocus(): void {
      if (disabled?.() || !triggers().includes('focus')) {
        return;
      }

      // If already open, do nothing
      if (open()) {
        return;
      }

      show('keyboard');
    }

    function onBlur(event: FocusEvent): void {
      if (disabled?.() || !triggers().includes('focus')) {
        return;
      }

      // If the overlay hasn't been created, there's nothing to cancel
      if (!overlay()) {
        return;
      }

      // Check if focus is moving to an element inside the menu
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      if (relatedTarget) {
        const menuElements = overlay()?.getElements() ?? [];
        const isFocusInMenu = menuElements.some(el => el.contains(relatedTarget));
        if (isFocusInMenu) {
          return;
        }
      }

      hide();
    }

    function onKeydown(event: KeyboardEvent): void {
      if (disabled?.()) {
        return;
      }

      const enabledTriggers = triggers();

      // Handle Enter key - toggle behavior
      if (event.key === 'Enter' && enabledTriggers.includes('enter')) {
        event.preventDefault();
        const origin: FocusOrigin = 'keyboard';
        if (open()) {
          hide(origin);
        } else {
          show(origin);
        }
        return;
      }

      // Handle arrow keys - placement-aware
      if (!enabledTriggers.includes('arrowkey')) {
        return;
      }

      const isArrowKey =
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight';

      if (!isArrowKey) {
        return;
      }

      // Get RTL direction
      const isRtl = directionality.value === 'rtl';

      // Check if arrow direction matches placement
      const currentPlacement = placement();
      let shouldOpen = false;

      if (currentPlacement.startsWith('bottom') && event.key === 'ArrowDown') {
        shouldOpen = true;
      } else if (currentPlacement.startsWith('top') && event.key === 'ArrowUp') {
        shouldOpen = true;
      } else if (currentPlacement.startsWith('right')) {
        const isRightArrow = event.key === 'ArrowRight';
        const isLeftArrow = event.key === 'ArrowLeft';
        shouldOpen = (isRightArrow && !isRtl) || (isLeftArrow && isRtl);
      } else if (currentPlacement.startsWith('left')) {
        const isRightArrow = event.key === 'ArrowRight';
        const isLeftArrow = event.key === 'ArrowLeft';
        shouldOpen = (isLeftArrow && !isRtl) || (isRightArrow && isRtl);
      }

      if (shouldOpen && !open()) {
        event.preventDefault();
        show('keyboard');
      }
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
      // Store the origin used to open the menu
      openOrigin.set(origin);

      // Create the overlay if it doesn't exist yet
      if (!overlay()) {
        createOverlayInstance();
      }

      // Show the overlay
      overlay()?.show();
    }

    function hide(origin: FocusOrigin = 'program'): void {
      const currentOverlay = overlay();
      if (!currentOverlay) {
        return;
      }

      // Hide the overlay (this will trigger onClose callback which updates closeOrigin)
      currentOverlay.hide({ origin });
    }

    /**
     * Track the pointer while it crosses from the trigger toward the menu. Closes
     * the menu as soon as the pointer leaves the safe-polygon corridor.
     */
    function registerPointerMoveListener(): void {
      if (removePointerMoveListener) {
        return;
      }

      const cleanup = disposables.addEventListener(
        document,
        'pointermove' as keyof HTMLElementEventMap,
        ((event: PointerEvent): void => {
          if (isPointerOverMenuArea() || !hoverBridgePolygon()) {
            clearHoverBridge();
            return;
          }

          const inBridge = isPointInHoverBridgePolygon(
            { x: event.clientX, y: event.clientY },
            hoverBridgePolygon()!,
          );

          if (!inBridge) {
            clearHoverBridge();
            hide();
          }
        }) as EventListener,
        true,
      );

      removePointerMoveListener = () => {
        cleanup();
        removePointerMoveListener = undefined;
      };
    }

    /** Tear down the hover bridge state and its global listeners. */
    function clearHoverBridge(): void {
      hoverBridgePolygon.set(null);
      clearHoverBridgeTimeout?.();
      clearHoverBridgeTimeout = undefined;
      removePointerMoveListener?.();
    }

    /** Close the menu if the pointer leaves the trigger but never reaches the menu. */
    function scheduleHoverBridgeCloseFallback(): void {
      clearHoverBridgeTimeout?.();

      clearHoverBridgeTimeout = disposables.setTimeout(() => {
        clearHoverBridgeTimeout = undefined;

        if (!isPointerOverMenuArea() && hoverBridgePolygon()) {
          clearHoverBridge();
          hide();
        }
      }, HOVER_BRIDGE_TIMEOUT_MS);
    }

    function createOverlayInstance(): void {
      const menuContent = menu?.();

      if (!menuContent) {
        throw new Error('Menu must be either a TemplateRef or a ComponentType');
      }

      // Create config for the overlay
      const config: NgpOverlayConfig<T> = {
        content: menuContent,
        triggerElement: element.nativeElement,
        viewContainerRef,
        injector,
        context,
        container: container(),
        placement: placement,
        offset: offset(),
        flip: flip(),
        shift: shift(),
        closeOnOutsideClick: true,
        closeOnEscape: true,
        restoreFocus: shouldRestoreFocus,
        onClose: (origin: FocusOrigin) => closeOrigin.set(origin),
        scrollBehaviour: scrollBehavior?.() ?? 'block',
        overlayType: 'menu',
        cooldown: cooldown?.(),
        showDelay: showDelay(),
        hideDelay: hideDelay(),
      };

      overlay.set(createOverlay(config));
    }

    function setMenu(newMenu: NgpOverlayContent<T> | undefined): void {
      menu.set(newMenu);
    }

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);

      if (isDisabled && open()) {
        hide();
      }
    }

    function setFlip(shouldFlip: NgpFlip): void {
      flip.set(shouldFlip);
    }

    function setPlacement(newPlacement: NgpMenuPlacement): void {
      placement.set(newPlacement);
    }

    function setOffset(newOffset: NgpOffset): void {
      offset.set(newOffset);
    }

    function setContext(newContext: T): void {
      context.set(newContext);
    }

    function setContainer(newContainer: HTMLElement | string | null): void {
      container.set(newContainer);
    }

    /**
     * Called by menu content when pointer enters/leaves
     * @internal
     */
    function setPointerOverContent(isOver: boolean): void {
      pointerOverContent.set(isOver);

      if (isOver) {
        // The pointer reached the menu - the hover bridge has served its purpose.
        clearHoverBridge();
        return;
      }

      if (open() && triggers().includes('hover')) {
        // Use a small delay to allow pointer to move back to trigger
        disposables.setTimeout(() => {
          // Only hide if pointer is not over trigger or content
          if (!isPointerOverMenuArea()) {
            hide();
          }
        }, 50);
      }
    }

    return {
      menu: deprecatedSetter(menu, 'setMenu'),
      placement: deprecatedSetter(placement, 'setPlacement'),
      offset: deprecatedSetter(offset, 'setOffset'),
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      context: deprecatedSetter(context, 'setContext'),
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
      setContext,
      setContainer,
      setPointerOverContent,
      flip,
      container: deprecatedSetter(container, 'setContainer', setContainer),
    } satisfies NgpMenuTriggerState<T>;
  },
);

export function injectMenuTriggerState<T>(
  options?: StateInjectionOptions,
): Signal<NgpMenuTriggerState<T>> {
  return _injectMenuTriggerState(options) as Signal<NgpMenuTriggerState<T>>;
}
