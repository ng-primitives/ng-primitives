import { FocusOrigin } from '@angular/cdk/a11y';
import { computed, inject, Injector, signal, Signal, ViewContainerRef } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  createOverlay,
  NgpOffset,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
} from 'ng-primitives/portal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { NgpMenuPlacement } from './menu-trigger';

export interface NgpMenuTriggerState {
  /**
   * The computed placement of the menu.
   */
  readonly placement: Signal<NgpMenuPlacement>;
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
   * How the menu behaves when the window is scrolled.
   */
  readonly scrollBehavior?: Signal<'reposition' | 'block'>;
  /**
   * Context to provide to the menu.
   */
  readonly context?: Signal<T | undefined>;
}

export const [
  NgpMenuTriggerStateToken,
  ngpMenuTrigger,
  injectMenuTriggerState,
  provideMenuTriggerState,
] = createPrimitive(
  'NgpMenuTrigger',
  <T>({
    disabled,
    menu,
    placement = signal('bottom-start' as NgpMenuPlacement),
    offset = signal(4),
    flip = signal(true),
    container,
    scrollBehavior,
    context,
  }: NgpMenuTriggerProps<T>) => {
    const element = injectElementRef();
    const injector = inject(Injector);
    const viewContainerRef = inject(ViewContainerRef);

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

    return {
      placement,
      show,
      hide,
      toggle,
    };
  },
);
