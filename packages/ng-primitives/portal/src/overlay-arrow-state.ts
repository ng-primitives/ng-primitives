import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  controlled,
  createPrimitive,
  dataBinding,
  onDestroy,
  styleBinding,
} from 'ng-primitives/state';
import { injectOverlay } from './overlay';

/**
 * The state interface for the overlay arrow.
 */
export interface NgpOverlayArrowState {
  /**
   * The x position of the arrow.
   */
  readonly x: Signal<number | undefined>;
  /**
   * The y position of the arrow.
   */
  readonly y: Signal<number | undefined>;
  /**
   * The final placement of the overlay.
   */
  readonly placement: Signal<string | undefined>;
  /**
   * The padding between the arrow and the edges of the floating element.
   */
  readonly padding: WritableSignal<number | undefined>;
  /**
   * Set the padding between the arrow and the edges of the floating element.
   * @param value The padding value in pixels
   */
  setPadding(value: number | undefined): void;
}

/**
 * The props interface for the overlay arrow.
 */
export interface NgpOverlayArrowProps {
  /**
   * Padding between the arrow and the edges of the floating element.
   * This prevents the arrow from overflowing the rounded corners.
   */
  readonly padding?: Signal<number | undefined>;
}

export const [
  NgpOverlayArrowStateToken,
  ngpOverlayArrow,
  injectOverlayArrowState,
  provideOverlayArrowState,
] = createPrimitive(
  'NgpOverlayArrow',
  ({ padding: _padding = signal(undefined) }: NgpOverlayArrowProps) => {
    const overlay = injectOverlay();
    const element = injectElementRef();
    const padding = controlled(_padding);

    // register the arrow element with the overlay
    overlay.registerArrow(element.nativeElement, padding);

    // cleanup the arrow element on destroy
    onDestroy(() => overlay.unregisterArrow());

    const x = computed(() => overlay.arrowPosition().x);
    const y = computed(() => overlay.arrowPosition().y);
    const placement = computed(() => overlay.finalPlacement());

    // bind the arrow position styles
    styleBinding(element, 'inset-inline-start.px', () => x() ?? null);
    styleBinding(element, 'inset-block-start.px', () => y() ?? null);
    dataBinding(element, 'data-placement', () => placement() ?? null);

    function setPadding(value: number | undefined): void {
      padding.set(value);
    }

    return {
      x,
      y,
      placement,
      padding,
      setPadding,
    } satisfies NgpOverlayArrowState;
  },
);
