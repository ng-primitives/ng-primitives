import { FocusOrigin } from '@angular/cdk/a11y';
import { computed, inject, Injector, signal, Signal, ViewContainerRef } from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpMenuTriggerStateToken } from 'ng-primitives/menu';
import {
  createOverlay,
  NgpFlip,
  NgpOffset,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
  NgpPosition,
  NgpShift,
} from 'ng-primitives/portal';
import { controlled, createPrimitive, dataBinding, listener, onDestroy } from 'ng-primitives/state';

export interface NgpContextMenuTriggerState {
  /**
   * Whether the context menu is open.
   */
  readonly open: Signal<boolean>;

  /**
   * The focus origin that was used to open the menu.
   */
  readonly openOrigin: Signal<FocusOrigin>;

  /**
   * Show the context menu.
   */
  show(origin?: FocusOrigin): void;

  /**
   * Hide the context menu.
   */
  hide(origin?: FocusOrigin): void;

  /**
   * Set whether the pointer is over the menu content.
   */
  setPointerOverContent(isOver: boolean): void;
}

export interface NgpContextMenuTriggerProps<T = unknown> {
  /**
   * The menu template or component.
   */
  readonly menu?: Signal<NgpOverlayContent<T> | undefined>;

  /**
   * Whether the trigger is disabled.
   */
  readonly disabled?: Signal<boolean>;

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
   * Configure shift behavior.
   */
  shift: NgpShift;

  /**
   * How the menu behaves when the window is scrolled.
   */
  readonly scrollBehavior?: Signal<'reposition' | 'block' | 'close'>;

  /**
   * Context to provide to the menu.
   */
  readonly context?: Signal<T>;
}

/** Duration in ms before a long-press fires. */
const LONG_PRESS_DURATION = 700;

/** Movement threshold in px to cancel a long-press. */
const LONG_PRESS_MOVE_THRESHOLD = 10;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
const noop = (): any => {};

export const [
  NgpContextMenuTriggerStateToken,
  ngpContextMenuTrigger,
  _injectContextMenuTriggerState,
  provideContextMenuTriggerState,
] = createPrimitive(
  'NgpContextMenuTrigger',
  <T>({
    disabled: _disabled = signal(false),
    menu: _menu = signal<NgpOverlayContent<T> | undefined>(undefined),
    offset: _offset = signal(2),
    flip: _flip = signal(true),
    context: _context = signal<T>(undefined as T),
    container,
    scrollBehavior,
    shift,
  }: NgpContextMenuTriggerProps<T>) => {
    const element = injectElementRef();
    const injector = inject(Injector);
    const viewContainerRef = inject(ViewContainerRef);

    // Controlled properties
    const menu = controlled(_menu);
    const disabled = controlled(_disabled);
    const flip = controlled(_flip);
    const offset = controlled(_offset);
    const context = controlled(_context);

    // Internal state
    const overlay = signal<NgpOverlay<T> | null>(null);
    const open = computed(() => overlay()?.isOpen() ?? false);
    const openOrigin = signal<FocusOrigin>('program');
    const cursorPosition = signal<NgpPosition | null>(null);

    // Host bindings
    dataBinding(element, 'data-open', open);

    // Long-press state
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    let longPressStartX = 0;
    let longPressStartY = 0;
    let longPressTriggered = false;

    // Event listeners
    listener(element, 'contextmenu', onContextMenu);
    listener(element, 'pointerdown', onPointerDown);
    listener(element, 'pointermove', onPointerMove);
    listener(element, 'pointerup', onPointerUp);
    listener(element, 'pointercancel', onPointerCancel);

    function onContextMenu(event: MouseEvent): void {
      event.preventDefault();

      if (disabled?.()) {
        return;
      }

      // If long-press already triggered, don't re-open
      if (longPressTriggered) {
        longPressTriggered = false;
        return;
      }

      cursorPosition.set({ x: event.clientX, y: event.clientY });
      openOrigin.set('mouse');

      if (open()) {
        // Already open - reposition by updating cursor position and triggering reposition
        overlay()?.updatePosition();
      } else {
        showMenu();
      }
    }

    function onPointerDown(event: PointerEvent): void {
      if (event.pointerType !== 'touch' || disabled?.()) {
        return;
      }

      longPressTriggered = false;
      longPressStartX = event.clientX;
      longPressStartY = event.clientY;

      longPressTimer = setTimeout(() => {
        longPressTriggered = true;
        cursorPosition.set({ x: longPressStartX, y: longPressStartY });
        openOrigin.set('touch');
        showMenu();
      }, LONG_PRESS_DURATION);
    }

    function onPointerMove(event: PointerEvent): void {
      if (event.pointerType !== 'touch' || !longPressTimer) {
        return;
      }

      const dx = event.clientX - longPressStartX;
      const dy = event.clientY - longPressStartY;
      if (Math.sqrt(dx * dx + dy * dy) > LONG_PRESS_MOVE_THRESHOLD) {
        cancelLongPress();
      }
    }

    function onPointerUp(event: PointerEvent): void {
      if (event.pointerType !== 'touch') {
        return;
      }
      cancelLongPress();
    }

    function onPointerCancel(event: PointerEvent): void {
      if (event.pointerType !== 'touch') {
        return;
      }
      cancelLongPress();
    }

    function cancelLongPress(): void {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }

    onDestroy(() => cancelLongPress());

    function showMenu(): void {
      if (!overlay()) {
        createOverlayInstance();
      }
      overlay()?.show();
    }

    function show(origin: FocusOrigin = 'program'): void {
      openOrigin.set(origin);
      showMenu();
    }

    function hide(origin: FocusOrigin = 'program'): void {
      const currentOverlay = overlay();
      if (!currentOverlay) {
        return;
      }
      currentOverlay.hide({ origin });
    }

    function createOverlayInstance(): void {
      const menuContent = menu?.();

      if (!menuContent) {
        throw new Error('Context menu must be either a TemplateRef or a ComponentType');
      }

      const config: NgpOverlayConfig<T> = {
        content: menuContent,
        triggerElement: element.nativeElement,
        viewContainerRef,
        injector,
        context,
        container: container?.(),
        offset: offset(),
        flip: flip(),
        shift,
        placement: signal<Placement>('right-start'),
        closeOnOutsideClick: true,
        closeOnEscape: true,
        treatTriggerClickAsOutside: true,
        restoreFocus: false,
        scrollBehaviour: scrollBehavior?.() ?? 'close',
        overlayType: 'menu',
        position: cursorPosition,
        trackPosition: true,
      };

      overlay.set(createOverlay(config));
    }

    function setPointerOverContent(_isOver: boolean): void {
      // No-op for context menu
    }

    // Set the compat state on NgpMenuTriggerStateToken so NgpMenu can find it.
    // NgpMenu injects this token and calls hide(), openOrigin(), setPointerOverContent() on it.
    const menuTriggerToken = inject(NgpMenuTriggerStateToken, { optional: true });
    // eslint-disable-next-line @angular-eslint/no-uncalled-signals -- checking inject() nullability, not signal value
    if (menuTriggerToken) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (menuTriggerToken as any).set({
        menu,
        placement: signal('bottom-start'),
        open,
        offset,
        disabled,
        flip,
        context,
        openOrigin,
        setDisabled: noop,
        setFlip: noop,
        setPlacement: noop,
        setOffset: noop,
        setContext: noop,
        show,
        hide,
        toggle: noop,
        setMenu: noop,
        setPointerOverContent,
      });
    }

    return {
      open,
      openOrigin,
      show,
      hide,
      setPointerOverContent,
    } satisfies NgpContextMenuTriggerState;
  },
);

export function injectContextMenuTriggerState(): Signal<NgpContextMenuTriggerState> {
  return _injectContextMenuTriggerState() as Signal<NgpContextMenuTriggerState>;
}
