import { DOCUMENT } from '@angular/common';
import { computed, inject, Injector, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  styleBinding,
} from 'ng-primitives/state';
import { injectSliderState } from '../slider/slider-state';

type SliderKey = 'ArrowLeft' | 'ArrowDown' | 'ArrowRight' | 'ArrowUp' | 'Home' | 'End';

/**
 * Public state surface for the Slider Thumb primitive.
 */
export interface NgpSliderThumbState {
  /**
   * Whether the thumb is currently dragging.
   */
  readonly dragging: Signal<boolean>;
  /**
   * Focus the thumb element.
   */
  focus(): void;
}

/**
 * Inputs for configuring the Slider Thumb primitive.
 */
export interface NgpSliderThumbProps {
  /**
   * Callback fired when dragging starts.
   */
  readonly onDragStart?: () => void;
  /**
   * Callback fired when dragging ends.
   */
  readonly onDragEnd?: () => void;
}

export const [
  NgpSliderThumbStateToken,
  ngpSliderThumb,
  injectSliderThumbState,
  provideSliderThumbState,
] = createPrimitive(
  'NgpSliderThumb',
  ({ onDragStart, onDragEnd }: NgpSliderThumbProps): NgpSliderThumbState => {
    const elementRef = injectElementRef<HTMLElement>();
    const slider = injectSliderState();
    const injector = inject(Injector);
    const document = inject(DOCUMENT);

    let dragging = false;
    let activePointerId: number | null = null;
    let cleanupDocumentListeners: (() => void)[] = [];

    ngpButton({
      disabled: slider().disabled,
      role: 'slider',
      type: 'button',
    });

    const ariaValueNow = computed(() => slider().value());

    // Host bindings
    attrBinding(elementRef, 'aria-valuemin', () => slider().min().toString());
    attrBinding(elementRef, 'aria-valuemax', () => slider().max().toString());
    attrBinding(elementRef, 'aria-valuenow', () => ariaValueNow().toString());
    attrBinding(elementRef, 'aria-orientation', () => slider().orientation());
    dataBinding(elementRef, 'data-orientation', () => slider().orientation());
    styleBinding(elementRef, 'inset-inline-start.%', () =>
      slider().orientation() === 'horizontal' ? slider().percentage() : null,
    );
    styleBinding(elementRef, 'inset-block-start.%', () =>
      slider().orientation() === 'vertical' ? 100 - slider().percentage() : null,
    );

    // Pointer interactions
    listener(elementRef, 'pointerdown', (event: PointerEvent) => {
      event.preventDefault();

      if (slider().disabled()) {
        return;
      }

      dragging = true;
      activePointerId = event.pointerId;
      onDragStart?.();

      // Clean up any existing listeners
      cleanupDocumentListeners.forEach(cleanup => cleanup());

      // Set up document-level listeners to handle pointer events anywhere
      const pointerMoveCleanup = listener(document, 'pointermove', onPointerMove, {
        config: false,
        injector,
      });

      const pointerUpCleanup = listener(document, 'pointerup', onPointerEnd, {
        config: false,
        injector,
      });

      const pointerCancelCleanup = listener(document, 'pointercancel', onPointerEnd, {
        config: false,
        injector,
      });

      cleanupDocumentListeners = [pointerMoveCleanup, pointerUpCleanup, pointerCancelCleanup];
    });

    function onPointerMove(event: PointerEvent): void {
      if (slider().disabled() || !dragging || event.pointerId !== activePointerId) {
        return;
      }

      const track = slider().track();
      const rect = track?.nativeElement.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const percentage =
        slider().orientation() === 'horizontal'
          ? (event.clientX - rect.left) / rect.width
          : 1 - (event.clientY - rect.top) / rect.height;

      const value =
        slider().min() + (slider().max() - slider().min()) * Math.max(0, Math.min(1, percentage));

      slider().setValue(value);
    }

    function onPointerEnd(event: PointerEvent): void {
      if (event.pointerId !== activePointerId) {
        return;
      }

      dragging = false;
      activePointerId = null;
      onDragEnd?.();
      cleanupDocumentListeners.forEach(cleanup => cleanup());
      cleanupDocumentListeners = [];
    }

    // Keyboard interactions
    listener(elementRef, 'keydown', (event: KeyboardEvent) => {
      const multiplier = event.shiftKey ? 10 : 1;
      const step = slider().step() * multiplier;
      const currentValue = slider().value();

      // determine the document direction
      const isRTL = getComputedStyle(elementRef.nativeElement).direction === 'rtl';

      let newValue: number;

      switch (event.key as SliderKey) {
        case 'ArrowLeft':
          newValue = isRTL
            ? Math.min(currentValue + step, slider().max())
            : Math.max(currentValue - step, slider().min());
          break;
        case 'ArrowDown':
          newValue = Math.max(currentValue - step, slider().min());
          break;
        case 'ArrowRight':
          newValue = isRTL
            ? Math.max(currentValue - step, slider().min())
            : Math.min(currentValue + step, slider().max());
          break;
        case 'ArrowUp':
          newValue = Math.min(currentValue + step, slider().max());
          break;
        case 'Home':
          newValue = isRTL ? slider().max() : slider().min();
          break;
        case 'End':
          newValue = isRTL ? slider().min() : slider().max();
          break;
        default:
          return;
      }

      // prevent the default action to prevent the page from scrolling
      event.preventDefault();

      if (newValue === currentValue) {
        return;
      }

      slider().setValue(newValue);
    });

    /**
     * Moves keyboard focus to the host element without scrolling the page.
     */
    function focus(): void {
      elementRef.nativeElement.focus({ preventScroll: true });
    }

    return {
      dragging: computed(() => dragging),
      focus,
    } satisfies NgpSliderThumbState;
  },
);
