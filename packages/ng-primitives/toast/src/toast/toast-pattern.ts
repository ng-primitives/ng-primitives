import { InteractivityChecker } from '@angular/cdk/a11y';
import {
  afterNextRender,
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Injector,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { explicitEffect, injectDimensions, injectElementRef } from 'ng-primitives/internal';
import { dataBinding, listener, styleBinding } from 'ng-primitives/state';
import { uniqueId } from '../../../utils/src';
import { injectToastConfig } from '../config/toast-config';
import type { NgpToastPlacement } from './toast';
import { NgpToastManager } from './toast-manager';
import { injectToastOptions } from './toast-options';
import { toastTimer } from './toast-timer';

/**
 * The state interface for the Toast pattern.
 */
export interface NgpToastState {
  /**
   * The id of the toast.
   */
  readonly id: string;

  /**
   * The placement of the toast.
   */
  readonly placement: NgpToastPlacement;

  /**
   * The dimensions of the toast.
   */
  readonly dimensions: Signal<{ width: number; height: number }>;
}

/**
 * The props interface for the Toast pattern.
 */
export interface NgpToastProps {
  /**
   * The element reference for the toast.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The Toast pattern function.
 */
export function ngpToastPattern({
  element = injectElementRef(),
}: NgpToastProps = {}): NgpToastState {
  // Dependency injection
  const manager = inject(NgpToastManager);
  const injector = inject(Injector);
  const config = injectToastConfig();
  const options = injectToastOptions();
  const interactivityChecker = inject(InteractivityChecker);
  const dimensions = injectDimensions();

  // Unique identifier for the toast - this is not added to the DOM
  const id = uniqueId('ngp-toast');

  // Signals and computed values
  const isInteracting = signal(false);
  const swiping = signal(false);
  const swipeDirection = signal<'x' | 'y' | null>(null);
  const swipeAmount = signal({ x: 0, y: 0 });
  const x = options.placement.split('-')[1] || 'end';
  const y = options.placement.split('-')[0] || 'top';
  let pointerStartRef: { x: number; y: number } | null = null;
  let dragStartTime: Date | null = null;
  const timer = toastTimer(options.duration, () => manager.dismiss(state));

  const swipeOutDirection = computed(() => {
    const direction = swipeDirection();
    if (direction === 'x') {
      return swipeAmount().x > 0 ? 'right' : 'left';
    } else if (direction === 'y') {
      return swipeAmount().y > 0 ? 'bottom' : 'top';
    }
    return null;
  });
  const toasts = computed(() =>
    manager.toasts().filter(toast => toast.instance.placement === options.placement),
  );

  const index = computed(() => {
    return toasts().findIndex(toast => toast.instance.id === id);
  });

  const offset = computed(() => {
    const gap = config.gap;

    return toasts()
      .slice(0, index())
      .reduce((acc, toast) => acc + toast.instance.dimensions().height + gap, 0);
  });
  const visible = computed(() => {
    const maxToasts = config.maxToasts;
    // determine if this toast is within the maximum number of toasts that can be displayed
    return index() < maxToasts || toasts().length <= maxToasts;
  });
  const frontToastHeight = computed(() => {
    // get the first toast in the list with height - as when a new toast is added, it may not initially have dimensions
    return (
      toasts()
        .find(toast => toast.instance.dimensions().height)
        ?.instance.dimensions().height || 0
    );
  });
  const zIndex = computed(() => toasts().length - index());

  const state: NgpToastState = {
    id,
    placement: options.placement,
    dimensions,
  };

  // Constructor logic
  options.register(state);

  // Start the timer when the toast is created
  timer.start();

  // Pause the timer when the toast is expanded or when the user is interacting with it
  explicitEffect([options.expanded, isInteracting], ([expanded, interacting]) => {
    // If the toast is expanded, or if the user is interacting with it, reset the timer
    if (expanded || interacting) {
      timer.pause();
    } else {
      timer.start();
    }
  });

  // Host bindings
  dataBinding(element, 'data-position-x', x);
  dataBinding(element, 'data-position-y', y);
  dataBinding(element, 'data-visible', visible);
  dataBinding(
    element,
    'data-front',
    computed(() => index() === 0),
  );
  dataBinding(element, 'data-swiping', swiping);
  dataBinding(element, 'data-swipe-direction', swipeOutDirection);
  dataBinding(element, 'data-expanded', options.expanded);
  styleBinding(element, '--ngp-toast-gap.px', config.gap);
  styleBinding(element, '--ngp-toast-z-index', zIndex);
  styleBinding(element, '--ngp-toasts-before', index);
  styleBinding(
    element,
    '--ngp-toast-index',
    computed(() => index() + 1),
  );
  styleBinding(
    element,
    '--ngp-toast-height.px',
    computed(() => dimensions().height),
  );
  styleBinding(element, '--ngp-toast-offset.px', offset);
  styleBinding(element, '--ngp-toast-front-height.px', frontToastHeight);
  styleBinding(
    element,
    '--ngp-toast-swipe-amount-x.px',
    computed(() => swipeAmount().x),
  );
  styleBinding(
    element,
    '--ngp-toast-swipe-amount-y.px',
    computed(() => swipeAmount().y),
  );
  styleBinding(
    element,
    '--ngp-toast-swipe-x',
    computed(() => swipeAmount().x),
  );
  styleBinding(
    element,
    '--ngp-toast-swipe-y',
    computed(() => swipeAmount().y),
  );
  listener(element, 'pointerdown', onPointerDown);
  listener(element, 'pointermove', onPointerMove);
  listener(element, 'pointerup', onPointerUp);

  // Method implementations
  function onPointerDown(event: PointerEvent): void {
    // right click should not trigger swipe and we check if the toast is dismissible
    if (event.button === 2 || !options.dismissible) {
      return;
    }

    isInteracting.set(true);

    // we need to check if the pointer is on an interactive element, if so, we should not start swiping
    if (interactivityChecker.isFocusable(event.target as HTMLElement)) {
      return;
    }

    dragStartTime = new Date();
    // Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    swiping.set(true);
    pointerStartRef = { x: event.clientX, y: event.clientY };
  }
  function onPointerMove(event: PointerEvent): void {
    if (!pointerStartRef || !options.dismissible) {
      return;
    }

    const isHighlighted = window.getSelection()?.toString().length ?? 0 > 0;

    if (isHighlighted) {
      return;
    }

    const yDelta = event.clientY - pointerStartRef.y;
    const xDelta = event.clientX - pointerStartRef.x;

    const swipeDirections = options.swipeDirections;

    // Determine swipe direction if not already locked
    if (!swipeDirection() && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
      swipeDirection.set(Math.abs(xDelta) > Math.abs(yDelta) ? 'x' : 'y');
    }

    const newSwipeAmount = { x: 0, y: 0 };

    const getDampening = (delta: number) => {
      const factor = Math.abs(delta) / 20;

      return 1 / (1.5 + factor);
    };

    // Only apply swipe in the locked direction
    if (swipeDirection() === 'y') {
      // Handle vertical swipes
      if (swipeDirections.includes('top') || swipeDirections.includes('bottom')) {
        if (
          (swipeDirections.includes('top') && yDelta < 0) ||
          (swipeDirections.includes('bottom') && yDelta > 0)
        ) {
          newSwipeAmount.y = yDelta;
        } else {
          // Smoothly transition to dampened movement
          const dampenedDelta = yDelta * getDampening(yDelta);
          // Ensure we don't jump when transitioning to dampened movement
          newSwipeAmount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
        }
      }
    } else if (swipeDirection() === 'x') {
      // Handle horizontal swipes
      if (swipeDirections.includes('left') || swipeDirections.includes('right')) {
        if (
          (swipeDirections.includes('left') && xDelta < 0) ||
          (swipeDirections.includes('right') && xDelta > 0)
        ) {
          newSwipeAmount.x = xDelta;
        } else {
          // Smoothly transition to dampened movement
          const dampenedDelta = xDelta * getDampening(xDelta);
          // Ensure we don't jump when transitioning to dampened movement
          newSwipeAmount.x = Math.abs(dampenedDelta) < Math.abs(xDelta) ? dampenedDelta : xDelta;
        }
      }
    }

    swipeAmount.set({ x: newSwipeAmount.x, y: newSwipeAmount.y });

    if (Math.abs(newSwipeAmount.x) > 0 || Math.abs(newSwipeAmount.y) > 0) {
      swiping.set(true);
    }
  }

  function onPointerUp(): void {
    isInteracting.set(false);

    if (!config.dismissible || !pointerStartRef || !swiping() || !dragStartTime) {
      return;
    }

    pointerStartRef = null;

    const swipeAmountX = swipeAmount().x;
    const swipeAmountY = swipeAmount().y;
    const timeTaken = new Date().getTime() - dragStartTime.getTime();

    const newSwipeAmount = swipeDirection() === 'x' ? swipeAmountX : swipeAmountY;
    const velocity = Math.abs(newSwipeAmount) / timeTaken;

    if (Math.abs(newSwipeAmount) >= config.swipeThreshold || velocity > 0.11) {
      afterNextRender({ write: () => manager.dismiss(state) }, { injector: injector });
      return;
    } else {
      swipeAmount.set({ x: 0, y: 0 });
    }

    // Reset swipe state
    swipeDirection.set(null);
    swiping.set(false);
  }

  return state;
}

/**
 * The injection token for the Toast pattern.
 */
export const NgpToastPatternToken = new InjectionToken<NgpToastState>('NgpToastPatternToken');

/**
 * Injects the Toast pattern.
 */
export function injectToastPattern(): NgpToastState {
  return inject(NgpToastPatternToken);
}

/**
 * Provides the Toast pattern.
 */
export function provideToastPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpToastState,
): FactoryProvider {
  return { provide: NgpToastPatternToken, useFactory: () => fn(inject(type)) };
}
