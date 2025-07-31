import { InteractivityChecker } from '@angular/cdk/a11y';
import {
  afterNextRender,
  computed,
  Directive,
  HostListener,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { explicitEffect } from 'ng-primitives/internal';
import { injectDimensions } from 'ng-primitives/utils';
import { injectToastConfig } from '../config/toast-config';
import { NgpToastManager } from './toast-manager';
import { injectToastOptions } from './toast-options';
import { toastTimer } from './toast-timer';

@Directive({
  selector: '[ngpToast]',
  exportAs: 'ngpToast',
  host: {
    '[attr.data-position-x]': 'x',
    '[attr.data-position-y]': 'y',
    '[attr.data-visible]': 'visible()',
    '[attr.data-front]': 'index() === 0',
    '[attr.data-swiping]': 'swiping()',
    '[attr.data-swipe-direction]': 'swipeOutDirection()',
    '[attr.data-expanded]': 'options.expanded()',
    '[style.--ngp-toast-gap.px]': 'config.gap',
    '[style.--ngp-toast-z-index]': 'zIndex()',
    '[style.--ngp-toasts-before]': 'index()',
    '[style.--ngp-toast-index]': 'index() + 1',
    '[style.--ngp-toast-width.px]': 'config.width !== undefined ? config.width : null',
    '[style.--ngp-toast-height.px]': 'dimensions().height',
    '[style.--ngp-toast-offset.px]': 'offset()',
    '[style.--ngp-toast-front-height.px]': 'frontToastHeight()',
    '[style.--ngp-toast-swipe-amount-x.px]': 'swipeAmount().x',
    '[style.--ngp-toast-swipe-amount-y.px]': 'swipeAmount().y',
    '[style.--ngp-toast-swipe-x]': 'swipeAmount().x',
    '[style.--ngp-toast-swipe-y]': 'swipeAmount().y',
  },
})
export class NgpToast {
  private readonly manager = inject(NgpToastManager);
  private readonly injector = inject(Injector);
  protected readonly config = injectToastConfig();
  /** @internal */
  readonly options = injectToastOptions();
  private readonly interactivityChecker = inject(InteractivityChecker);
  private readonly isInteracting = signal(false);

  private pointerStartRef: { x: number; y: number } | null = null;
  private dragStartTime: Date | null = null;
  protected readonly swiping = signal(false);
  protected readonly swipeDirection = signal<'x' | 'y' | null>(null);
  protected readonly swipeAmount = signal({ x: 0, y: 0 });

  protected readonly swipeOutDirection = computed(() => {
    const direction = this.swipeDirection();
    if (direction === 'x') {
      return this.swipeAmount().x > 0 ? 'right' : 'left';
    } else if (direction === 'y') {
      return this.swipeAmount().y > 0 ? 'bottom' : 'top';
    }
    return null;
  });

  /**
   * Get all toasts that are currently being displayed in the same position.
   */
  private readonly toasts = computed(() =>
    this.manager
      .toasts()
      .filter(toast => toast.instance.options.placement === this.options.placement),
  );

  /**
   * The number of toasts that are currently being displayed before this toast.
   */
  protected readonly index = computed(() => {
    return this.toasts().findIndex(toast => toast.instance === this);
  });

  /**
   * Determine the position of the toast in the list of toasts.
   * This is the combination of the heights of all the toasts before this one, plus the gap between them.
   */
  protected readonly offset = computed(() => {
    const gap = this.config.gap;

    return this.toasts()
      .slice(0, this.index())
      .reduce((acc, toast) => acc + toast.instance.dimensions().height + gap, 0);
  });

  /**
   * Determine if this toast is visible.
   * Visible considers the maximum number of toasts that can be displayed at once, and the last x toasts that are currently being displayed.
   */
  protected readonly visible = computed(() => {
    const maxToasts = this.config.maxToasts;
    // determine if this toast is within the maximum number of toasts that can be displayed
    return this.index() < maxToasts || this.toasts().length <= maxToasts;
  });

  /**
   * Determine the height of the front toast.
   * This is used to determine the height of the toast when it is not expanded.
   */
  protected readonly frontToastHeight = computed(() => {
    // get the first toast in the list with height - as when a new toast is added, it may not initially have dimensions
    return (
      this.toasts()
        .find(toast => toast.instance.dimensions().height)
        ?.instance.dimensions().height || 0
    );
  });

  /**
   * Determine the z-index of the toast. This is the inverse of the index.
   * The first toast will have the highest z-index, and the last toast will have the lowest z-index.
   * This is used to ensure that the first toast is always on top of the others.
   */
  protected readonly zIndex = computed(() => this.toasts().length - this.index());

  /**
   * The height of the toast in pixels.
   */
  protected readonly dimensions = injectDimensions();

  /**
   * The x position of the toast.
   */
  readonly x = this.options.placement.split('-')[1] || 'end';

  /**
   * The y position of the toast.
   */
  readonly y = this.options.placement.split('-')[0] || 'top';

  /**
   * The toast timer instance.
   */
  private readonly timer = toastTimer(this.options.duration, () => this.manager.dismiss(this));

  constructor() {
    this.options.register(this);

    // Start the timer when the toast is created
    this.timer.start();

    // Pause the timer when the toast is expanded or when the user is interacting with it
    explicitEffect([this.options.expanded, this.isInteracting], ([expanded, interacting]) => {
      // If the toast is expanded, or if the user is interacting with it, reset the timer
      if (expanded || interacting) {
        this.timer.pause();
      } else {
        this.timer.start();
      }
    });
  }

  @HostListener('pointerdown', ['$event'])
  protected onPointerDown(event: PointerEvent): void {
    // right click should not trigger swipe and we check if the toast is dismissible
    if (event.button === 2 || !this.options.dismissible) {
      return;
    }

    this.isInteracting.set(true);

    // we need to check if the pointer is on an interactive element, if so, we should not start swiping
    if (this.interactivityChecker.isFocusable(event.target as HTMLElement)) {
      return;
    }

    this.dragStartTime = new Date();
    // Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.swiping.set(true);
    this.pointerStartRef = { x: event.clientX, y: event.clientY };
  }

  @HostListener('pointermove', ['$event'])
  protected onPointerMove(event: PointerEvent): void {
    if (!this.pointerStartRef || !this.options.dismissible) {
      return;
    }

    const isHighlighted = window.getSelection()?.toString().length ?? 0 > 0;

    if (isHighlighted) {
      return;
    }

    const yDelta = event.clientY - this.pointerStartRef.y;
    const xDelta = event.clientX - this.pointerStartRef.x;

    const swipeDirections = this.options.swipeDirections;

    // Determine swipe direction if not already locked
    if (!this.swipeDirection() && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
      this.swipeDirection.set(Math.abs(xDelta) > Math.abs(yDelta) ? 'x' : 'y');
    }

    const swipeAmount = { x: 0, y: 0 };

    const getDampening = (delta: number) => {
      const factor = Math.abs(delta) / 20;

      return 1 / (1.5 + factor);
    };

    // Only apply swipe in the locked direction
    if (this.swipeDirection() === 'y') {
      // Handle vertical swipes
      if (swipeDirections.includes('top') || swipeDirections.includes('bottom')) {
        if (
          (swipeDirections.includes('top') && yDelta < 0) ||
          (swipeDirections.includes('bottom') && yDelta > 0)
        ) {
          swipeAmount.y = yDelta;
        } else {
          // Smoothly transition to dampened movement
          const dampenedDelta = yDelta * getDampening(yDelta);
          // Ensure we don't jump when transitioning to dampened movement
          swipeAmount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
        }
      }
    } else if (this.swipeDirection() === 'x') {
      // Handle horizontal swipes
      if (swipeDirections.includes('left') || swipeDirections.includes('right')) {
        if (
          (swipeDirections.includes('left') && xDelta < 0) ||
          (swipeDirections.includes('right') && xDelta > 0)
        ) {
          swipeAmount.x = xDelta;
        } else {
          // Smoothly transition to dampened movement
          const dampenedDelta = xDelta * getDampening(xDelta);
          // Ensure we don't jump when transitioning to dampened movement
          swipeAmount.x = Math.abs(dampenedDelta) < Math.abs(xDelta) ? dampenedDelta : xDelta;
        }
      }
    }

    this.swipeAmount.set({ x: swipeAmount.x, y: swipeAmount.y });

    if (Math.abs(swipeAmount.x) > 0 || Math.abs(swipeAmount.y) > 0) {
      this.swiping.set(true);
    }
  }

  @HostListener('pointerup')
  protected onPointerUp(): void {
    this.isInteracting.set(false);

    if (
      !this.config.dismissible ||
      !this.pointerStartRef ||
      !this.swiping() ||
      !this.dragStartTime
    ) {
      return;
    }

    this.pointerStartRef = null;

    const swipeAmountX = this.swipeAmount().x;
    const swipeAmountY = this.swipeAmount().y;
    const timeTaken = new Date().getTime() - this.dragStartTime.getTime();

    const swipeAmount = this.swipeDirection() === 'x' ? swipeAmountX : swipeAmountY;
    const velocity = Math.abs(swipeAmount) / timeTaken;

    if (Math.abs(swipeAmount) >= this.config.swipeThreshold || velocity > 0.11) {
      afterNextRender({ write: () => this.manager.dismiss(this) }, { injector: this.injector });
      return;
    } else {
      this.swipeAmount.set({ x: 0, y: 0 });
    }

    // Reset swipe state
    this.swipeDirection.set(null);
    this.swiping.set(false);
  }
}

export type NgpToastSwipeDirection = 'top' | 'right' | 'bottom' | 'left';

export type NgpToastPlacement =
  | 'top-start'
  | 'top-end'
  | 'top-center'
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom-center';
