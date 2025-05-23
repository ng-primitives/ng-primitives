import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  Injector,
  Provider,
  Signal,
  TemplateRef,
  Type,
  ViewContainerRef,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Middleware,
  Placement,
  Strategy,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from '@floating-ui/dom';
import { fromResizeEvent } from 'ng-primitives/resize';
import { injectDisposables } from 'ng-primitives/utils';
import { NgpPortal, createPortal } from './portal';

/**
 * Configuration options for creating an overlay
 */
export interface NgpOverlayConfig<T = unknown> {
  /** Content to display in the overlay (component or template) */
  content: NgpOverlayContent<T>;

  /** The element that triggers the overlay */
  triggerElement: HTMLElement;

  /** The injector to use for creating the portal */
  injector: Injector;

  /** Context data to pass to the overlay content */
  context?: T | null;

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
 */
export class NgpOverlay<T = unknown> {
  private readonly disposables = injectDisposables();
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  /** Signal tracking the portal instance */
  private readonly portal = signal<NgpPortal | null>(null);

  /** Signal tracking the overlay position */
  readonly position = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  /** Signal tracking the trigger element width */
  readonly triggerWidth = signal<number | null>(null);

  /** Function to dispose the positioning auto-update */
  private disposePositioning?: () => void;

  /** Timeout handle for showing the overlay */
  private openTimeout?: () => void;

  /** Timeout handle for hiding the overlay */
  private closeTimeout?: () => void;

  /** Signal tracking whether the overlay is open */
  readonly isOpen = signal(false);

  /**
   * Creates a new overlay instance
   * @param config Initial configuration for the overlay
   * @param destroyRef Reference for automatic cleanup
   */
  constructor(private config: NgpOverlayConfig<T>) {
    // Monitor trigger element resize
    fromResizeEvent(this.config.triggerElement)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.triggerWidth.set(this.config.triggerElement.offsetWidth);
      });

    // Ensure cleanup on destroy
    this.destroyRef.onDestroy(() => this.destroy());
  }

  /**
   * Show the overlay with the specified delay
   * @param showDelay Optional delay to override the configured showDelay
   */
  show(showDelay?: number): void {
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
    const delay = showDelay ?? this.config.showDelay ?? 0;

    this.openTimeout = this.disposables.setTimeout(() => {
      this.openTimeout = undefined;
      this.createOverlay();
    }, delay);
  }

  /**
   * Hide the overlay with the specified delay
   * @param hideDelay Optional delay to override the configured hideDelay
   */
  hide(hideDelay?: number): void {
    // If opening is in progress, cancel it
    if (this.openTimeout) {
      this.openTimeout();
      this.openTimeout = undefined;
    }

    // Don't proceed if already closing or closed
    if (this.closeTimeout || !this.isOpen()) {
      return;
    }

    // Use the provided delay or fall back to config
    const delay = hideDelay ?? this.config.hideDelay ?? 0;

    this.closeTimeout = this.disposables.setTimeout(async () => {
      this.closeTimeout = undefined;
      await this.destroyOverlay();
    }, delay);
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
   * Immediately show the overlay without any delay
   */
  showImmediate(): void {
    this.show(0);
  }

  /**
   * Immediately hide the overlay without any delay
   */
  hideImmediate(): void {
    this.hide(0);
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
    if (!portal) return;

    const elements = portal.getElements();
    if (elements.length === 0) return;

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
  }

  /**
   * Get the elements of the overlay
   */
  getElements(): HTMLElement[] {
    return this.portal()?.getElements() || [];
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
        providers: [...(this.config.providers || []), { provide: NgpOverlay, useValue: this }],
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

    const outletElement = portal.getElements()[0] as HTMLElement | null;

    if (!outletElement) {
      throw new Error('Overlay element is not available.');
    }

    if (portal.getElements().length > 1) {
      throw new Error('Overlay must have only one root element.');
    }

    // Set up positioning
    this.setupPositioning(outletElement);

    // Mark as open
    this.isOpen.set(true);
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

    // Compute the position
    const position = await computePosition(this.config.triggerElement, overlayElement, {
      placement: this.config.placement || 'top',
      middleware,
      strategy,
    });

    // Update position signal
    this.position.set({ x: position.x, y: position.y });

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
  }
}

/**
 * Helper function to create an overlay in a single call
 */
export function createOverlay<T>(config: NgpOverlayConfig<T>): NgpOverlay<T> {
  // we run the overlay creation in the injector context to ensure that it can call the inject function
  return runInInjectionContext(config.injector, () => new NgpOverlay<T>(config));
}

export function injectOverlay<T>(): NgpOverlay<T> {
  return inject(NgpOverlay);
}

export function injectOverlayPosition(): Signal<{ x: number; y: number }> {
  return inject(NgpOverlay).position;
}

export function injectOverlayTriggerWidth(): Signal<number | null> {
  return inject(NgpOverlay).triggerWidth;
}
