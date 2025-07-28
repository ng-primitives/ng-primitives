import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { ViewportRuler } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  Injector,
  Provider,
  Signal,
  TemplateRef,
  Type,
  ViewContainerRef,
  computed,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import {
  Middleware,
  Placement,
  Strategy,
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from '@floating-ui/dom';
import { fromResizeEvent } from 'ng-primitives/internal';
import { injectDisposables, safeTakeUntilDestroyed, uniqueId } from 'ng-primitives/utils';
import { Subject, fromEvent } from 'rxjs';
import { provideOverlayContext } from './overlay-token';
import { NgpPortal, createPortal } from './portal';
import { BlockScrollStrategy, NoopScrollStrategy } from './scroll-strategy';

/**
 * Configuration options for creating an overlay
 * @internal
 */
export interface NgpOverlayConfig<T = unknown> {
  /** Content to display in the overlay (component or template) */
  content: NgpOverlayContent<T>;

  /** The element that triggers the overlay */
  triggerElement: HTMLElement;

  /** The injector to use for creating the portal */
  injector: Injector;
  /** ViewContainerRef to use for creating the portal */
  viewContainerRef: ViewContainerRef;

  /** Context data to pass to the overlay content */
  context?: Signal<T | undefined>;

  /** Container element to attach the overlay to (defaults to document.body) */
  container?: HTMLElement | null;

  /** Preferred placement of the overlay relative to the trigger */
  placement?: Placement;

  /** Offset distance between the overlay and trigger in pixels */
  offset?: number;

  /** Whether to enable flip behavior when space is limited */
  flip?: boolean;

  /** Delay before showing the overlay in milliseconds */
  showDelay?: number;

  /** Delay before hiding the overlay in milliseconds */
  hideDelay?: number;

  /** Whether the overlay should be positioned with fixed or absolute strategy */
  strategy?: Strategy;

  /** The scroll strategy to use for the overlay */
  scrollBehaviour?: 'reposition' | 'block';
  /** Whether to close the overlay when clicking outside */
  closeOnOutsideClick?: boolean;
  /** Whether to close the overlay when pressing escape */
  closeOnEscape?: boolean;
  /** Whether to restore focus to the trigger element when hiding the overlay */
  restoreFocus?: boolean;
  /** Additional middleware for floating UI positioning */
  additionalMiddleware?: Middleware[];

  /** Additional providers */
  providers?: Provider[];
}

/** Type for overlay content which can be either a template or component */
export type NgpOverlayContent<T> = TemplateRef<NgpOverlayTemplateContext<T>> | Type<unknown>;

/** Context for template-based overlays */
export type NgpOverlayTemplateContext<T> = {
  $implicit: T;
};

/**
 * NgpOverlay manages the lifecycle and positioning of overlay UI elements.
 * It abstracts the common behavior shared by tooltips, popovers, menus, etc.
 * @internal
 */
export class NgpOverlay<T = unknown> {
  private readonly disposables = injectDisposables();
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly viewContainerRef: ViewContainerRef;
  private readonly viewportRuler = inject(ViewportRuler);
  private readonly focusMonitor = inject(FocusMonitor);
  /** Access any parent overlays */
  private readonly parentOverlay = inject(NgpOverlay, { optional: true });
  /** Signal tracking the portal instance */
  private readonly portal = signal<NgpPortal | null>(null);

  /** Signal tracking the overlay position */
  readonly position = signal<{ x: number | undefined; y: number | undefined }>({
    x: undefined,
    y: undefined,
  });

  /**
   * Determine if the overlay has been positioned
   * @internal
   */
  readonly isPositioned = computed(
    () => this.position().x !== undefined && this.position().y !== undefined,
  );

  /** Signal tracking the trigger element width */
  readonly triggerWidth = signal<number | null>(null);

  /** The transform origin for the overlay */
  readonly transformOrigin = signal<string>('center center');

  /** Signal tracking the final placement of the overlay */
  readonly finalPlacement = signal<Placement | undefined>(undefined);

  /** Function to dispose the positioning auto-update */
  private disposePositioning?: () => void;

  /** Timeout handle for showing the overlay */
  private openTimeout?: () => void;

  /** Timeout handle for hiding the overlay */
  private closeTimeout?: () => void;

  /** Signal tracking whether the overlay is open */
  readonly isOpen = signal(false);

  /** A unique id for the overlay */
  readonly id = signal<string>(uniqueId('ngp-overlay'));

  /** The aria-describedby attribute for accessibility */
  readonly ariaDescribedBy = computed(() => (this.isOpen() ? this.id() : undefined));

  /** The scroll strategy */
  private scrollStrategy = new NoopScrollStrategy();

  /** An observable that emits when the overlay is closing */
  readonly closing = new Subject<void>();

  /** Store the arrow element */
  private arrowElement: HTMLElement | null = null;

  /** @internal The position of the arrow */
  readonly arrowPosition = signal<{ x: number | undefined; y: number | undefined }>({
    x: undefined,
    y: undefined,
  });

  /**
   * Creates a new overlay instance
   * @param config Initial configuration for the overlay
   * @param destroyRef Reference for automatic cleanup
   */
  constructor(private config: NgpOverlayConfig<T>) {
    // we cannot inject the viewContainerRef as this can throw an error during hydration in SSR
    this.viewContainerRef = config.viewContainerRef;

    // this must be done after the config is set
    this.transformOrigin.set(this.getTransformOrigin());

    // Monitor trigger element resize
    fromResizeEvent(this.config.triggerElement)
      .pipe(safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.triggerWidth.set(this.config.triggerElement.offsetWidth);
      });

    // if there is a parent overlay and it is closed, close this overlay
    this.parentOverlay?.closing.pipe(safeTakeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.isOpen()) {
        this.hideImmediate();
      }
    });

    // If closeOnOutsideClick is enabled, set up a click listener
    fromEvent<MouseEvent>(this.document, 'mouseup', { capture: true })
      .pipe(safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (!this.config.closeOnOutsideClick) {
          return;
        }

        const overlay = this.portal();

        if (!overlay || !this.isOpen()) {
          return;
        }

        const path = event.composedPath();
        const isInsideOverlay = overlay.getElements().some(el => path.includes(el));
        const isInsideTrigger = path.includes(this.config.triggerElement);

        if (!isInsideOverlay && !isInsideTrigger) {
          this.hide();
        }
      });

    // If closeOnEscape is enabled, set up a keydown listener
    fromEvent<KeyboardEvent>(this.document, 'keydown', { capture: true })
      .pipe(safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (!this.config.closeOnEscape) return;
        if (event.key === 'Escape' && this.isOpen()) {
          this.hide({ origin: 'keyboard', immediate: true });
        }
      });

    // Ensure cleanup on destroy
    this.destroyRef.onDestroy(() => this.destroy());
  }

  /**
   * Show the overlay with the specified delay
   * @param showDelay Optional delay to override the configured showDelay
   */
  show(): Promise<void> {
    return new Promise<void>(resolve => {
      // If closing is in progress, cancel it
      if (this.closeTimeout) {
        this.closeTimeout();
        this.closeTimeout = undefined;
      }

      // Don't proceed if already opening or open
      if (this.openTimeout || this.isOpen()) {
        return;
      }

      // Use the provided delay or fall back to config
      const delay = this.config.showDelay ?? 0;

      this.openTimeout = this.disposables.setTimeout(() => {
        this.openTimeout = undefined;
        this.createOverlay();
        resolve();
      }, delay);
    });
  }

  /**
   * Stop any pending close operation. This is useful for example, if we move the mouse from the tooltip trigger to the tooltip itself.
   * This will prevent the tooltip from closing immediately when the mouse leaves the trigger.
   * @internal
   */
  cancelPendingClose(): void {
    if (this.closeTimeout) {
      this.closeTimeout();
      this.closeTimeout = undefined;
    }
  }

  /**
   * Hide the overlay with the specified delay
   * @param options Optional options for hiding the overlay
   */
  hide(options?: OverlayTriggerOptions): void {
    // If opening is in progress, cancel it
    if (this.openTimeout) {
      this.openTimeout();
      this.openTimeout = undefined;
    }

    // Don't proceed if already closing or closed unless immediate is true
    if ((this.closeTimeout && !options?.immediate) || !this.isOpen()) {
      return;
    }

    this.closing.next();

    const dispose = async () => {
      this.closeTimeout = undefined;

      if (this.config.restoreFocus) {
        this.focusMonitor.focusVia(this.config.triggerElement, options?.origin ?? 'program', {
          preventScroll: true,
        });
      }

      await this.destroyOverlay();
    };

    if (options?.immediate) {
      // If immediate, dispose right away
      dispose();
    } else {
      this.closeTimeout = this.disposables.setTimeout(dispose, this.config.hideDelay ?? 0);
    }
  }

  /**
   * Update the configuration of this overlay
   * @param config New configuration (partial)
   */
  updateConfig(config: Partial<NgpOverlayConfig<T>>): void {
    this.config = { ...this.config, ...config };

    // If the overlay is already open, update its position
    if (this.isOpen()) {
      this.updatePosition();
    }
  }

  /**
   * Immediately hide the overlay without any delay
   */
  hideImmediate(): void {
    this.hide({ immediate: true });
  }

  /**
   * Toggle the overlay open/closed state
   */
  toggle(): void {
    if (this.isOpen()) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Force update the position of the overlay
   */
  updatePosition(): void {
    const portal = this.portal();

    if (!portal) {
      return;
    }

    const elements = portal.getElements();

    if (elements.length === 0) {
      return;
    }

    const overlayElement = elements[0] as HTMLElement;

    // Compute new position
    this.computePosition(overlayElement);
  }

  /**
   * Completely destroy this overlay instance
   */
  destroy(): void {
    this.hideImmediate();
    this.disposePositioning?.();
    this.scrollStrategy.disable();
  }

  /**
   * Get the elements of the overlay
   */
  getElements(): HTMLElement[] {
    return this.portal()?.getElements() ?? [];
  }

  /**
   * Internal method to create the overlay
   */
  private createOverlay(): void {
    if (!this.config.content) {
      throw new Error('Overlay content must be provided');
    }

    // Create a new portal with context
    const portal = createPortal(
      this.config.content,
      this.viewContainerRef,
      Injector.create({
        parent: this.config.injector,
        providers: [
          ...(this.config.providers || []),
          { provide: NgpOverlay, useValue: this },
          provideOverlayContext<T>(this.config.context),
        ],
      }),
      { $implicit: this.config.context } as NgpOverlayTemplateContext<T>,
    );

    // Attach portal to container
    const container = this.config.container || this.document.body;
    portal.attach(container);

    // Update portal signal
    this.portal.set(portal);

    // Ensure view is up to date
    portal.detectChanges();

    // find a dedicated outlet element
    // this is the element that has the `data-overlay` attribute
    // if no such element exists, we use the first element in the portal
    const outletElement =
      portal.getElements().find(el => el.hasAttribute('data-overlay')) ?? portal.getElements()[0];

    if (!outletElement) {
      throw new Error('Overlay element is not available.');
    }

    // Set up positioning
    this.setupPositioning(outletElement);

    // Mark as open
    this.isOpen.set(true);

    this.scrollStrategy =
      this.config.scrollBehaviour === 'block'
        ? new BlockScrollStrategy(this.viewportRuler, this.document)
        : new NoopScrollStrategy();

    this.scrollStrategy.enable();
  }

  /**
   * Internal method to setup positioning of the overlay
   */
  private setupPositioning(overlayElement: HTMLElement): void {
    // Determine positioning strategy based on overlay element's CSS
    const strategy =
      getComputedStyle(overlayElement).position === 'fixed'
        ? 'fixed'
        : this.config.strategy || 'absolute';

    // Setup auto-update for positioning
    this.disposePositioning = autoUpdate(this.config.triggerElement, overlayElement, () =>
      this.computePosition(overlayElement, strategy),
    );
  }

  /**
   * Compute the overlay position using floating-ui
   */
  private async computePosition(
    overlayElement: HTMLElement,
    strategy: Strategy = 'absolute',
  ): Promise<void> {
    // Create middleware array
    const middleware: Middleware[] = [offset(this.config.offset || 0), shift()];

    // Add flip middleware if requested
    if (this.config.flip !== false) {
      middleware.push(flip());
    }

    // Add any additional middleware
    if (this.config.additionalMiddleware) {
      middleware.push(...this.config.additionalMiddleware);
    }

    // If the arrow element is registered, add arrow middleware
    if (this.arrowElement) {
      middleware.push(arrow({ element: this.arrowElement }));
    }

    // Compute the position
    const position = await computePosition(this.config.triggerElement, overlayElement, {
      placement: this.config.placement || 'top',
      middleware,
      strategy,
    });

    // Update position signal
    this.position.set({ x: position.x, y: position.y });

    // Update final placement signal
    this.finalPlacement.set(position.placement);

    // Update arrow position if available
    if (this.arrowElement) {
      this.arrowPosition.set({
        x: position.middlewareData.arrow?.x,
        y: position.middlewareData.arrow?.y,
      });
    }

    // Ensure view is updated
    this.portal()?.detectChanges();
  }

  /**
   * Internal method to destroy the overlay portal
   */
  private async destroyOverlay(): Promise<void> {
    const portal = this.portal();

    if (!portal) {
      return;
    }

    // Clear portal reference to prevent double destruction
    this.portal.set(null);

    // Clean up positioning
    this.disposePositioning?.();
    this.disposePositioning = undefined;

    // Detach the portal
    await portal.detach();

    // Mark as closed
    this.isOpen.set(false);

    // Reset final placement
    this.finalPlacement.set(undefined);

    // disable scroll strategy
    this.scrollStrategy.disable();
    this.scrollStrategy = new NoopScrollStrategy();
  }

  /**
   * Get the transform origin for the overlay
   */
  private getTransformOrigin(): string {
    const placement = this.config.placement ?? 'top';

    const basePlacement = placement.split('-')[0]; // Extract "top", "bottom", etc.
    const alignment = placement.split('-')[1]; // Extract "start" or "end"

    const map: Record<string, string> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    };

    let x = 'center';
    let y = 'center';

    if (basePlacement === 'top' || basePlacement === 'bottom') {
      y = map[basePlacement];
      if (alignment === 'start') x = 'left';
      else if (alignment === 'end') x = 'right';
    } else {
      x = map[basePlacement];
      if (alignment === 'start') y = 'top';
      else if (alignment === 'end') y = 'bottom';
    }

    return `${y} ${x}`;
  }

  /**
   * Register the arrow element for positioning
   * @internal
   */
  registerArrow(arrowElement: HTMLElement | null): void {
    this.arrowElement = arrowElement;
  }

  /**
   * Remove the registered arrow element
   * @internal
   */
  unregisterArrow(): void {
    this.arrowElement = null;
  }
}

/**
 * Helper function to create an overlay in a single call
 * @internal
 */
export function createOverlay<T>(config: NgpOverlayConfig<T>): NgpOverlay<T> {
  // we run the overlay creation in the injector context to ensure that it can call the inject function
  return runInInjectionContext(config.injector, () => new NgpOverlay<T>(config));
}

/**
 * Helper function to inject the NgpOverlay instance
 * @internal
 */
export function injectOverlay<T>(): NgpOverlay<T> {
  return inject(NgpOverlay);
}

export interface OverlayTriggerOptions {
  /**
   * Whether the visibility change should be immediate.
   */
  immediate?: boolean;
  /**
   * The origin of the focus event that triggered the visibility change.
   */
  origin?: FocusOrigin;
}
