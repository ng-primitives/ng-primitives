import { computed, effect, signal, Signal } from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpOffset, NgpOverlay, NgpShift } from 'ng-primitives/portal';
import { controlled, createPrimitive, onDestroy } from 'ng-primitives/state';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';

/**
 * The state for the NgpNavigationMenuPortal directive.
 */
export interface NgpNavigationMenuPortalState {
  /**
   * The placement of the portal.
   */
  readonly placement: Signal<Placement>;

  /**
   * The offset of the portal.
   */
  readonly offset: Signal<NgpOffset>;

  /**
   * Whether to flip the portal when there is not enough space.
   */
  readonly flip: Signal<boolean>;

  /**
   * The shift configuration.
   */
  readonly shift: Signal<NgpShift>;

  /**
   * The overlay instance.
   */
  readonly overlay: Signal<NgpOverlay<void> | null>;

  /**
   * Whether the portal is open.
   */
  readonly open: Signal<boolean>;

  /**
   * Set the placement.
   */
  setPlacement(placement: Placement): void;

  /**
   * Set the offset.
   */
  setOffset(offset: NgpOffset): void;

  /**
   * Set whether to flip.
   */
  setFlip(flip: boolean): void;

  /**
   * Set the shift configuration.
   */
  setShift(shift: NgpShift): void;
}

export interface NgpNavigationMenuPortalProps {
  /**
   * The placement of the portal.
   */
  readonly placement?: Signal<Placement>;

  /**
   * The offset of the portal.
   */
  readonly offset?: Signal<NgpOffset>;

  /**
   * Whether to flip the portal.
   */
  readonly flip?: Signal<boolean>;

  /**
   * The shift configuration.
   */
  readonly shift?: Signal<NgpShift>;

  /**
   * The container element or selector.
   */
  readonly container?: Signal<HTMLElement | string | null>;

  /**
   * Callback to create the overlay.
   */
  readonly createOverlayFn: (triggerElement: HTMLElement) => NgpOverlay<void>;
}

export const [
  NgpNavigationMenuPortalStateToken,
  ngpNavigationMenuPortal,
  injectNavigationMenuPortalState,
  provideNavigationMenuPortalState,
] = createPrimitive(
  'NgpNavigationMenuPortal',
  ({
    placement: _placement = signal('bottom'),
    offset: _offset = signal(0),
    flip: _flip = signal(true),
    shift: _shift = signal(true),
    createOverlayFn,
  }: NgpNavigationMenuPortalProps): NgpNavigationMenuPortalState => {
    const element = injectElementRef();
    const menu = injectNavigationMenuState();

    const placement = controlled(_placement);
    const offset = controlled(_offset);
    const flip = controlled(_flip);
    const shift = controlled(_shift);

    // The overlay instance - created lazily when first trigger is available
    const overlay = signal<NgpOverlay<void> | null>(null);

    // Whether the portal is open (based on menu value)
    const open = computed(() => menu().value() !== undefined);

    // Get the active trigger element
    const activeTriggerElement = computed(() => {
      const currentValue = menu().value();
      if (!currentValue) return null;

      const items = menu().items();
      const activeItem = items.find(item => item.value() === currentValue);
      return activeItem?.triggerElement() ?? null;
    });

    // Register portal with menu
    menu().registerPortal({
      element: element.nativeElement,
      placement,
      offset,
      flip,
      shift,
      overlay,
    });

    // Clean up on destroy
    onDestroy(() => {
      menu().registerPortal(null);
      overlay()?.destroy();
    });

    // Track if we're waiting for overlay creation
    let pendingCreation = false;

    // Effect to show/hide overlay based on open state
    effect(() => {
      const isOpen = open();
      const triggerElement = activeTriggerElement();
      const currentOverlay = overlay();

      if (isOpen && triggerElement) {
        if (!currentOverlay && !pendingCreation) {
          // Schedule overlay creation outside reactive context
          pendingCreation = true;
          queueMicrotask(() => {
            // Double-check we still need to create it
            if (!overlay()) {
              const newOverlay = createOverlayFn(triggerElement);
              overlay.set(newOverlay);
              newOverlay.show();
            }
            pendingCreation = false;
          });
        } else if (currentOverlay) {
          // Update the trigger element for positioning and show
          currentOverlay.updateConfig({
            triggerElement,
            placement: placement,
            offset: offset(),
            flip: flip(),
            shift: shift(),
          });
          currentOverlay.show();
        }
      } else if (!isOpen && currentOverlay?.isOpen()) {
        // Hide the overlay when closed
        currentOverlay.hideImmediate();
      }
    });

    // Effect to update trigger element when it changes while open
    effect(() => {
      const currentOverlay = overlay();
      const triggerElement = activeTriggerElement();

      if (currentOverlay && triggerElement && open()) {
        currentOverlay.updateConfig({
          triggerElement,
        });
        currentOverlay.updatePosition();
      }
    });

    return {
      placement,
      offset,
      flip,
      shift,
      overlay,
      open,
      setPlacement: (value: Placement) => placement.set(value),
      setOffset: (value: NgpOffset) => offset.set(value),
      setFlip: (value: boolean) => flip.set(value),
      setShift: (value: NgpShift) => shift.set(value),
    } satisfies NgpNavigationMenuPortalState;
  },
);
