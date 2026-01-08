import { FocusOrigin } from '@angular/cdk/a11y';
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
  NgpShift,
} from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  listener,
} from 'ng-primitives/state';
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
  readonly flip: WritableSignal<boolean>;

  /**
   * The context provided to the menu.
   */
  readonly context?: WritableSignal<T>;

  /**
   * Set whether the trigger is disabled.
   * @param isDisabled - Whether the trigger is disabled
   */
  setDisabled(isDisabled: boolean): void;

  /**
   * Set whether the menu should flip when there is not enough space.
   * @param shouldFlip - Whether the menu should flip
   */
  setFlip(shouldFlip: boolean): void;

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
   * Show the menu.
   */
  show(): void;
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
  readonly flip?: Signal<boolean>;
  /**
   * The container in which the menu should be attached.
   */
  readonly container?: Signal<HTMLElement | string | null>;

  /**
   * Configure shift behavior to keep the menu in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  shift: NgpShift;

  /**
   * How the menu behaves when the window is scrolled.
   */
  readonly scrollBehavior?: Signal<'reposition' | 'block'>;
  /**
   * Context to provide to the menu.
   */
  readonly context?: Signal<T>;
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
    context: _context = signal<T>(undefined as T),
    container,
    scrollBehavior,
  }: NgpMenuTriggerProps<T>) => {
    const element = injectElementRef();
    const injector = inject(Injector);
    const viewContainerRef = inject(ViewContainerRef);

    // Controlled properties
    const menu = controlled(_menu);
    const disabled = controlled(_disabled);
    const placement = controlled(_placement);
    const flip = controlled(_flip);
    const offset = controlled(_offset);
    const context = controlled(_context);

    // Internal state
    const overlay = signal<NgpOverlay<T> | null>(null);
    const open = computed(() => overlay()?.isOpen() ?? false);

    // Host bindings
    attrBinding(element, 'aria-haspopup', 'true');
    attrBinding(element, 'aria-expanded', open);
    dataBinding(element, 'data-open', open);
    dataBinding(element, 'data-placement', placement);

    // Event listeners
    listener(element, 'click', onClick);

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
        show();
      }
    }

    function show(): void {
      // Create the overlay if it doesn't exist yet
      if (!overlay()) {
        createOverlayInstance();
      }

      // Show the overlay
      overlay()?.show();
    }

    function hide(origin: FocusOrigin = 'program'): void {
      // If the trigger is disabled or the menu is not open, do nothing
      if (!open()) {
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
      const config: NgpOverlayConfig<T> = {
        content: menuContent,
        triggerElement: element.nativeElement,
        viewContainerRef,
        injector,
        context,
        container: container?.(),
        placement: placement,
        offset: offset(),
        flip: flip(),
        closeOnOutsideClick: true,
        closeOnEscape: true,
        restoreFocus: true,
        scrollBehaviour: scrollBehavior?.() ?? 'block',
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

    function setFlip(shouldFlip: boolean): void {
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

    return {
      menu: deprecatedSetter(menu, 'setMenu'),
      placement: deprecatedSetter(placement, 'setPlacement'),
      offset: deprecatedSetter(offset, 'setOffset'),
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      context: deprecatedSetter(context, 'setContext'),
      open,
      show,
      hide,
      toggle,
      setDisabled,
      setMenu,
      setFlip,
      setPlacement,
      setOffset,
      setContext,
      flip,
    } satisfies NgpMenuTriggerState<T>;
  },
);

export function injectMenuTriggerState<T>(): Signal<NgpMenuTriggerState<T>> {
  return _injectMenuTriggerState() as Signal<NgpMenuTriggerState<T>>;
}
