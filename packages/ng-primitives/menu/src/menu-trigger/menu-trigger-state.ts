import { FocusOrigin, InputModalityDetector } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import {
  afterRenderEffect,
  computed,
  effect,
  inject,
  Injector,
  signal,
  Signal,
  untracked,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import {
  createHoverBridge,
  createHoverTransitDecline,
  injectElementRef,
} from 'ng-primitives/internal';
import {
  createOverlay,
  NgpFlip,
  NgpOffset,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
  NgpPlacement,
  NgpShift,
} from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  listener,
  onDestroy,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { injectDisposables, uniqueId } from 'ng-primitives/utils';
import { NgpMenuTriggerType } from '../config/menu-config';
import { injectMenuTriggerGroupState } from '../menu-trigger-group/menu-trigger-group-state';

export interface NgpMenuTriggerState<T = unknown> {
  /**
   * The menu template or component.
   */
  readonly menu: WritableSignal<NgpOverlayContent<any> | undefined>;
  /**
   * The computed placement of the menu.
   */
  readonly placement: WritableSignal<NgpPlacement>;
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
   * Define an anchor element for positioning the menu.
   * If provided, the menu will be positioned relative to this element instead of the trigger.
   */
  readonly anchor: WritableSignal<HTMLElement | null>;

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
  setPlacement(placement: NgpPlacement): void;

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
   * Set whether the menu opens on first render when its open state is not bound.
   * @param defaultOpen - Whether the menu opens on first render
   */
  setDefaultOpen(defaultOpen: boolean): void;

  /**
   * Set the anchor element the menu is positioned against. An open menu moves to the
   * new anchor.
   *
   * When re-anchoring in response to a press, do it on `pointerdown` rather than `click`:
   * outside-press dismissal is decided on a capture-phase `mouseup`, which runs before
   * a bubbling `click`, so an anchor claimed there arrives too late and the press that
   * was meant to move the menu dismisses it instead.
   * @param anchor - The new anchor element
   */
  setAnchor(anchor: HTMLElement | null): void;

  /**
   * Set the container in which the menu should be attached. Takes effect the
   * next time the menu is opened; it does not move a menu that is already open.
   * @param container - The new container
   */
  setContainer(container: HTMLElement | string | null): void;

  /**
   * Show the menu. While `open` is bound, ask the binding to open it instead.
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

  /**
   * The id of the trigger element, which names the menu.
   * @internal
   */
  triggerId(): string | null;

  /**
   * Whether `open` is bound, so the binding decides whether the menu closes. Optional because
   * a submenu or context menu trigger also provides this state.
   * @internal
   */
  isOpenControlled?(): boolean;
}

export interface NgpMenuTriggerProps<T = unknown> {
  /**
   * Whether the menu is open. Leave `undefined` to let the trigger manage it.
   */
  readonly open?: Signal<boolean | undefined>;
  /**
   * Whether the menu opens on first render when `open` is `undefined`.
   * @default false
   */
  readonly defaultOpen?: Signal<boolean>;
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
  readonly placement?: Signal<NgpPlacement>;
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
   * Define an anchor element for positioning the menu.
   * If provided, the menu will be positioned relative to this element instead of the trigger.
   */
  readonly anchor?: Signal<HTMLElement | null>;
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

  /**
   * Called when the menu opens or closes, or, while `open` is bound, asks to.
   */
  readonly onOpenChange?: (open: boolean) => void;
}

export const [
  NgpMenuTriggerStateToken,
  ngpMenuTrigger,
  _injectMenuTriggerState,
  provideMenuTriggerState,
] = createPrimitive(
  'NgpMenuTrigger',
  <T>({
    open: _open,
    defaultOpen: _defaultOpen,
    disabled: _disabled = signal(false),
    menu: _menu = signal<NgpOverlayContent<T> | undefined>(undefined),
    placement: _placement = signal('bottom-start' as NgpPlacement),
    offset: _offset = signal(4),
    flip: _flip = signal(true),
    shift: _shift = signal(undefined),
    context: _context = signal<T>(undefined as T),
    anchor: _anchor,
    container: _container,
    scrollBehavior,
    cooldown,
    triggers = signal(['click'] as NgpMenuTriggerType[]),
    showDelay = signal(0),
    hideDelay = signal(0),
    onOpenChange,
  }: NgpMenuTriggerProps<T>) => {
    const element = injectElementRef();
    const injector = inject(Injector);
    const viewContainerRef = inject(ViewContainerRef);
    const directionality = inject(Directionality);
    const inputModality = inject(InputModalityDetector);
    const disposables = injectDisposables();

    // Controlled properties
    const menu = controlled(_menu);
    const disabled = controlled(_disabled);
    const placement = controlled(_placement);
    const flip = controlled(_flip);
    const shift = controlled(_shift);
    const offset = controlled(_offset);
    const context = controlled(_context);
    const anchor = controlled<HTMLElement | null>(_anchor, null);
    const container = controlled(_container, 'body');
    const defaultOpen = controlled(_defaultOpen, false);

    // Internal state
    const overlay = signal<NgpOverlay<T> | null>(null);
    const open = computed(() => overlay()?.isOpen() ?? false);
    const expanded = computed(() => open() && !overlay()?.isClosing());
    const openOrigin = signal<FocusOrigin>('program');

    // Two show() calls inside the show delay both settle when that single open
    // completes, so track what has been announced rather than what was open per call.
    let announcedOpen = false;

    // Tearing the overlay down closes it, but a destroyed directive can no longer
    // emit through `openChange` (Angular NG0953), so skip the notification.
    let destroyed = false;

    onDestroy(() => {
      destroyed = true;
    });

    // Runs after render, so a bound or default open never runs during server rendering.
    let defaultOpenApplied = false;
    afterRenderEffect(() => {
      const bound = _open?.();
      // Tracked so that a binding already `true`, or `defaultOpen`, opens once the content arrives.
      const hasContent = !!menu();
      // `defaultOpen` applies to the first render that has content, never again.
      const applyDefaultOpen = hasContent && !defaultOpenApplied;
      defaultOpenApplied ||= hasContent;

      untracked(() => {
        if (bound === false) {
          closeOverlay({ immediate: true, fromOwner: true });
        } else if (hasContent && (bound === true || (applyDefaultOpen && defaultOpen()))) {
          openOverlay();
        }
      });
    });

    // Track whether pointer is over trigger or content (for hover triggers)
    const pointerOverTrigger = signal(false);
    const pointerOverContent = signal(false);
    const isPointerOverMenuArea = computed(() => pointerOverTrigger() || pointerOverContent());

    // Siblings only have a shared container to protect when the consumer opted
    // in by wrapping this trigger and its siblings in NgpMenuTriggerGroup - a
    // lone trigger has no group and the bridge is a no-op there.
    const triggerGroup = injectMenuTriggerGroupState({ optional: true });

    // Safe-polygon hover intent: while the pointer travels inside a corridor from
    // the trigger exit point toward the open menu, the menu stays open. Reversing
    // away closes it (requireForwardMovement).
    const hoverBridge = createHoverBridge({
      isPointerInAnchor: isPointerOverMenuArea,
      close: () => hide(),
      requireForwardMovement: true,
      siblingContainer: () => triggerGroup()?.siblingContainer() ?? null,
      onSuppressionChange: active =>
        active
          ? triggerGroup()?.setTransitSource(element.nativeElement)
          : triggerGroup()?.clearTransitSource(element.nativeElement),
    });

    /**
     * A sibling's corridor can't withhold an enter the browser resolved before
     * pointer-events applied, so the sibling has to decline it itself.
     */
    const declineHoverDuringTransit = createHoverTransitDecline({
      isBlocked: () => triggerGroup()?.isTransitBlocked(element.nativeElement) ?? false,
      isPointerOverTrigger: pointerOverTrigger,
      show: () => show('mouse'),
    });

    // Reset pointer tracking when menu closes
    effect(() => {
      const isOpen = open();

      // When menu closes, reset pointer tracking state and tear down any
      // in-progress hover bridge (and its global listener).
      if (!isOpen) {
        hoverBridge.clear();
        pointerOverTrigger.set(false);
        pointerOverContent.set(false);
      }
    });

    // Host bindings
    // the menu is named by its trigger, so the trigger needs an id; the consumer's own is kept
    const fallbackId = uniqueId('ngp-menu-trigger');
    attrBinding(element, 'id', () => element.nativeElement.id || fallbackId);
    attrBinding(element, 'aria-haspopup', 'true');
    attrBinding(element, 'aria-expanded', expanded);
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
        hoverBridge.clear();
        overlay()?.cancelPendingClose();
        // the pending close may have been an exit animation, already reported as a close
        announceOpen();
        return;
      }

      if (declineHoverDuringTransit()) {
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
      const started =
        !!menuElement &&
        hoverBridge.track({
          triggerRect: element.nativeElement.getBoundingClientRect(),
          targetRect: menuElement.getBoundingClientRect(),
          exitPoint: { x: event.clientX, y: event.clientY },
        });

      if (started) {
        currentOverlay.cancelPendingClose();
        return;
      }

      // Fall back to a small grace period when we can't build the corridor.
      disposables.setTimeout(() => {
        if (!isPointerOverMenuArea()) {
          hide();
        }
      }, 50);
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
        if (expanded()) {
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

      // if the menu is open then hide it - one that is animating out opens again
      if (expanded()) {
        hide(origin);
      } else {
        show(origin, true);
      }
    }

    function show(origin: FocusOrigin = 'program', fromTriggerPress = false): void {
      // Store the origin used to open the menu
      openOrigin.set(origin);

      // Create the overlay if it doesn't exist yet
      if (!overlay()) {
        createOverlayInstance();
      }

      overlay()?.show({ fromTriggerPress }).then(announceOpen);
    }

    /**
     * Report an open once. A show also settles when the menu was already open, or when a
     * concurrent call opened it first.
     */
    function announceOpen(): void {
      if (expanded() && !announcedOpen) {
        announcedOpen = true;
        announce(true);
      }
    }

    /** Open for the binding or `defaultOpen`: no delay, nothing to report. */
    function openOverlay(): void {
      // the binding does not say how it was set, so take the input the user last used
      openOrigin.set(inputModality.mostRecentModality ?? 'program');

      if (!overlay()) {
        createOverlayInstance();
      }

      overlay()
        ?.show({ immediate: true })
        .then(() => (announcedOpen ||= open()));
    }

    /**
     * Let a change through when nothing is bound or it matches the binding. Anything else is
     * reported through `onOpenChange` and left to the binding.
     */
    function requestOpenChange(next: boolean): boolean {
      const bound = _open?.();

      if (bound === undefined || bound === next) {
        return true;
      }

      onOpenChange?.(next);
      return false;
    }

    /**
     * Report a change the menu made on its own. While bound, only a close can be one: every
     * open is the binding's own, or a request `requestOpenChange` has already reported.
     */
    function announce(value: boolean): void {
      const bound = _open?.();

      if (bound === undefined || (bound && !value)) {
        onOpenChange?.(value);
      }
    }

    function hide(origin: FocusOrigin = 'program'): void {
      closeOverlay({ origin });
    }

    /** Close the overlay unless it is already animating out, which would close it twice. */
    function closeOverlay(options: {
      origin?: FocusOrigin;
      immediate?: boolean;
      fromOwner?: boolean;
    }): void {
      const currentOverlay = overlay();

      if (currentOverlay && !currentOverlay.isClosing()) {
        currentOverlay.hide(options);
      }
    }

    function createOverlayInstance(): void {
      const menuContent = menu?.();

      if (!menuContent) {
        throw new Error('Menu must be either a TemplateRef or a ComponentType');
      }

      // Create config for the overlay
      const config: NgpOverlayConfig<T> = {
        content: menu,
        triggerElement: element.nativeElement,
        anchorElement: anchor,
        viewContainerRef,
        injector,
        context,
        container,
        placement: placement,
        offset: offset(),
        flip: flip(),
        shift: shift(),
        closeOnOutsideClick: true,
        closeOnEscape: true,
        restoreFocus: true,
        scrollBehaviour: scrollBehavior?.() ?? 'block',
        overlayType: 'menu',
        cooldown: cooldown?.(),
        showDelay: showDelay(),
        hideDelay: hideDelay(),
        requestOpenChange,
        onClose: () => {
          announcedOpen = false;
          if (!destroyed) {
            announce(false);
          }
        },
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

    function setPlacement(newPlacement: NgpPlacement): void {
      placement.set(newPlacement);
    }

    function setOffset(newOffset: NgpOffset): void {
      offset.set(newOffset);
    }

    function setContext(newContext: T): void {
      context.set(newContext);
    }

    function setAnchor(newAnchor: HTMLElement | null): void {
      anchor.set(newAnchor);
    }

    function setContainer(newContainer: HTMLElement | string | null): void {
      container.set(newContainer);
    }

    function setDefaultOpen(shouldOpen: boolean): void {
      defaultOpen.set(shouldOpen);
    }

    /**
     * Called by menu content when pointer enters/leaves
     * @internal
     */
    function setPointerOverContent(isOver: boolean): void {
      pointerOverContent.set(isOver);

      if (isOver) {
        // The pointer reached the menu - the hover bridge has served its purpose.
        hoverBridge.clear();
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
      menu: deprecatedSetter(menu, 'setMenu', setMenu),
      placement: deprecatedSetter(placement, 'setPlacement', setPlacement),
      offset: deprecatedSetter(offset, 'setOffset', setOffset),
      disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
      context: deprecatedSetter(context, 'setContext', setContext),
      anchor: deprecatedSetter(anchor, 'setAnchor', setAnchor),
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
      setAnchor,
      setContainer,
      setDefaultOpen,
      setPointerOverContent,
      triggerId: () => element.nativeElement.id,
      isOpenControlled: () => _open?.() !== undefined,
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
