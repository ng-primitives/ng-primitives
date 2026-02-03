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
  VirtualElement,
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from '@floating-ui/dom';
import { explicitEffect, fromResizeEvent } from 'ng-primitives/internal';
import { injectDisposables, safeTakeUntilDestroyed, uniqueId } from 'ng-primitives/utils';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgpOffset } from './offset';
import { CooldownOverlay, NgpOverlayCooldownManager } from './overlay-cooldown';
import { provideOverlayContext } from './overlay-token';
import { NgpPortal, createPortal } from './portal';
import { NgpPosition } from './position';
import { BlockScrollStrategy, NoopScrollStrategy } from './scroll-strategy';
import { NgpShift } from './shift';

/**
 * Configuration options for creating an overlay
 * @internal
 */
export interface NgpOverlayConfig<T = unknown> {
  /** Content to display in the overlay (component or template) */
  content: NgpOverlayContent<T>;

  /** The element that triggers the overlay */
  triggerElement: HTMLElement;

  /** The element to use for positioning the overlay (if different from trigger) */
  anchorElement?: HTMLElement | null;

  /** The injector to use for creating the portal */
  injector: Injector;
  /** ViewContainerRef to use for creating the portal */
  viewContainerRef: ViewContainerRef;

  /** Context data to pass to the overlay content */
  context?: Signal<T | undefined>;

  /** Container element or selector to attach the overlay to (defaults to document.body) */
  container?: HTMLElement | string | null;

  /** Preferred placement of the overlay relative to the trigger. */
  placement?: Signal<Placement>;

  /** Offset distance between the overlay and trigger. Can be a number or an object with axis-specific offsets */
  offset?: NgpOffset;

  /** Shift configuration to keep the overlay in view. Can be a boolean, an object with options, or undefined */
  shift?: NgpShift;

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
  /**
   * Whether to restore focus to the trigger element when hiding the overlay.
   * Can be a boolean or a signal that returns a boolean.
   */
  restoreFocus?: boolean | Signal<boolean>;

  /**
   * Optional callback to update an external close origin signal.
   * Called when the overlay is hidden with the focus origin.
   * @internal
   */
  onClose?: (origin: FocusOrigin) => void;
  /** Additional middleware for floating UI positioning */
  additionalMiddleware?: Middleware[];

  /** Additional providers */
  providers?: Provider[];

  /** Whether to track the trigger element position on every animation frame. Useful for moving elements like slider thumbs. */
  trackPosition?: boolean;

  /**
   * Programmatic position for the overlay. When provided, the overlay will be positioned
   * at these coordinates instead of anchoring to the trigger element.
   * Use with trackPosition for smooth cursor following.
   */
  position?: Signal<NgpPosition | null>;

  /**
   * Overlay type identifier for cooldown grouping.
   * When set, overlays of the same type share a cooldown period.
   * For example, 'tooltip' ensures quickly moving between tooltips shows
   * the second one immediately without the showDelay.
   */
  overlayType?: string;

  /**
   * Cooldown duration in milliseconds.
   * When moving from one overlay of the same type to another within this duration,
   * the showDelay is skipped for the new overlay.
   * @default 300
   */
  cooldown?: number;
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
export class NgpOverlay<T = unknown> implements CooldownOverlay {
  private readonly disposables = injectDisposables();
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly viewContainerRef: ViewContainerRef;
  private readonly viewportRuler = inject(ViewportRuler);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly cooldownManager = inject(NgpOverlayCooldownManager);
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

  /**
   * Signal tracking the focus origin used to close the overlay.
   * Updated when hide() is called.
   * @internal
   */
  readonly closeOrigin = signal<FocusOrigin>('program');

  /** The aria-describedby attribute for accessibility */
  readonly ariaDescribedBy = computed(() => (this.isOpen() ? this.id() : undefined));

  /** The scroll strategy */
  private scrollStrategy = new NoopScrollStrategy();

  /** An observable that emits when the overlay is closing */
  readonly closing = new Subject<void>();

  /**
   * Signal tracking whether the current transition is instant due to cooldown.
   * When true, CSS can skip animations using the data-instant attribute.
   */
  readonly instantTransition = signal(false);

  /** Store the arrow element */
  private arrowElement: HTMLElement | null = null;

  /** Store the arrow padding signal */
  private arrowPadding: Signal<number | undefined> | undefined = undefined;

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

    // Listen for placement signal changes to update position
    if (config.placement) {
      explicitEffect([config.placement], () => this.updatePosition());
    }

    // Listen for position signal changes to update position
    if (config.position) {
      explicitEffect([config.position], () => this.updatePosition());
    }

    // this must be done after the config is set
    this.transformOrigin.set(this.getTransformOrigin());

    // Monitor trigger element resize
    const elementToMonitor = this.config.anchorElement || this.config.triggerElement;
    fromResizeEvent(elementToMonitor)
      .pipe(safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(({ width, height }) => {
        this.triggerWidth.set(width);

        // if the element has been hidden, hide immediately
        if (width === 0 || height === 0) {
          this.hideImmediate();
        }
      });

    // if there is a parent overlay and it is closed, close this overlay
    this.parentOverlay?.closing
      // we add a debounce here to ensure any dom events like clicks are processed first
      .pipe(debounceTime(0), safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
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
        const isInsideAnchor = this.config.anchorElement
          ? path.includes(this.config.anchorElement)
          : false;

        if (!isInsideOverlay && !isInsideTrigger && !isInsideAnchor) {
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
      let delay = this.config.showDelay ?? 0;
      let isInstantDueToCooldown = false;

      // Check cooldown regardless of delay value - we need to detect instant transitions
      // even when showDelay is 0, so CSS can skip animations via data-instant attribute.
      // However, if cooldown is explicitly set to 0, disable cooldown behavior entirely.
      if (this.config.overlayType) {
        const cooldownDuration = this.config.cooldown ?? 300;
        if (
          cooldownDuration > 0 &&
          (this.cooldownManager.isWithinCooldown(this.config.overlayType, cooldownDuration) ||
            this.cooldownManager.hasActiveOverlay(this.config.overlayType))
        ) {
          delay = 0; // Skip delay (no-op if already 0)
          isInstantDueToCooldown = true;
        }
      }

      // Set instant transition flag based on whether delay was skipped due to cooldown
      this.instantTransition.set(isInstantDueToCooldown);

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

    // If immediate and there's a pending close, cancel it first
    // (we'll dispose immediately instead of waiting for the old timeout)
    if (options?.immediate && this.closeTimeout) {
      this.closeTimeout();
      this.closeTimeout = undefined;
    }

    this.closing.next();

    // Check cooldown BEFORE recording, then record for the next overlay
    let delay = this.config.hideDelay ?? 0;
    if (this.config.overlayType) {
      // Skip delay if within cooldown period for this overlay type
      if (delay > 0) {
        const cooldownDuration = this.config.cooldown ?? 300;
        if (this.cooldownManager.isWithinCooldown(this.config.overlayType, cooldownDuration)) {
          delay = 0;
        }
      }
      // Record close timestamp so the next overlay of the same type can see it
      this.cooldownManager.recordClose(this.config.overlayType);
    }

    const dispose = async () => {
      this.closeTimeout = undefined;

      // If show() was called while we were waiting, abort the close
      if (this.openTimeout) {
        return;
      }

      const origin = options?.origin ?? 'program';

      // Update the close origin signal so computed signals can react
      this.closeOrigin.set(origin);

      // Call the onClose callback if provided (for external signal updates)
      this.config.onClose?.(origin);

      // Determine if focus should be restored
      const shouldRestoreFocus =
        typeof this.config.restoreFocus === 'function'
          ? this.config.restoreFocus()
          : this.config.restoreFocus ?? false;

      if (shouldRestoreFocus) {
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
      // Reset instant transition for normal closes so exit animations can play.
      // When being replaced by another overlay during cooldown, hideImmediate()
      // is called instead (which doesn't come through here), and registerActive
      // sets instantTransition to true before that call.
      this.instantTransition.set(false);
      // Remove data-instant attribute so CSS exit animations can play
      for (const element of this.getElements()) {
        element.removeAttribute('data-instant');
      }
      this.closeTimeout = this.disposables.setTimeout(dispose, delay);
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
   * Immediately hide the overlay without any delay.
   * When called during cooldown transitions, this destroys the overlay
   * immediately without exit animations.
   */
  hideImmediate(): void {
    // Cancel any pending operations
    if (this.openTimeout) {
      this.openTimeout();
      this.openTimeout = undefined;
    }
    if (this.closeTimeout) {
      this.closeTimeout();
      this.closeTimeout = undefined;
    }

    // Emit closing event
    this.closing.next();

    // Destroy immediately without animations
    this.destroyOverlay(true);
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

    // Attach portal to container (skip enter animation delay if instant transition)
    const container = this.resolveContainer();
    const isInstant = this.instantTransition();
    portal.attach(container, { immediate: isInstant });

    // Update portal signal
    this.portal.set(portal);

    // If instant transition is active, set data-instant attribute synchronously
    // so CSS can use it for styling purposes
    if (isInstant) {
      for (const element of portal.getElements()) {
        element.setAttribute('data-instant', '');
      }
    }

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

    // Register as active overlay for this type (will close any existing one if within cooldown)
    if (this.config.overlayType) {
      this.cooldownManager.registerActive(this.config.overlayType, this, this.config.cooldown ?? 0);
    }

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

    // Get the reference for auto-update - use trigger element for resize/scroll tracking
    // even when using programmatic position (the virtual element is created dynamically in computePosition)
    const referenceElement = this.config.anchorElement || this.config.triggerElement;

    // Setup auto-update for positioning
    this.disposePositioning = autoUpdate(
      referenceElement,
      overlayElement,
      () => this.computePosition(overlayElement, strategy),
      { animationFrame: this.config.trackPosition ?? false },
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
    const middleware: Middleware[] = [offset(this.config.offset ?? 0)];

    // Add shift middleware (enabled by default for backward compatibility)
    // Shift keeps the overlay in view by shifting it along its axis when it would otherwise overflow the viewport
    const shiftConfig = this.config.shift;
    if (shiftConfig !== false) {
      const shiftOptions = shiftConfig === undefined || shiftConfig === true ? {} : shiftConfig;
      middleware.push(shift(shiftOptions));
    }

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
      middleware.push(arrow({ element: this.arrowElement, padding: this.arrowPadding?.() }));
    }

    // Compute the position
    const placement = this.config.placement?.() ?? 'top';

    // Use programmatic position if provided, otherwise use anchor/trigger element
    const referenceElement = this.getPositionReference();

    const position = await computePosition(referenceElement, overlayElement, {
      placement,
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
   * Get the reference element for positioning. When a programmatic position is provided,
   * creates a virtual element at that position. Otherwise returns the anchor or trigger element.
   */
  private getPositionReference(): HTMLElement | VirtualElement {
    const pos = this.config.position?.();
    if (pos) {
      // Create virtual element that reads position fresh on each call
      return {
        getBoundingClientRect: () => {
          const currentPos = this.config.position?.() ?? pos;
          return new DOMRect(currentPos.x, currentPos.y, 0, 0);
        },
        contextElement: this.config.triggerElement,
      };
    }
    return this.config.anchorElement || this.config.triggerElement;
  }

  /**
   * Internal method to destroy the overlay portal
   * @param immediate If true, skip exit animations and remove immediately
   */
  private async destroyOverlay(immediate?: boolean): Promise<void> {
    const portal = this.portal();

    if (!portal) {
      return;
    }

    // Unregister from active overlays
    if (this.config.overlayType) {
      this.cooldownManager.unregisterActive(this.config.overlayType, this);
    }

    // Clear portal reference to prevent double destruction
    this.portal.set(null);

    // Clean up positioning
    this.disposePositioning?.();
    this.disposePositioning = undefined;

    // Detach the portal (skip animations if immediate)
    await portal.detach(immediate);

    // Mark as closed
    this.isOpen.set(false);

    // Reset final placement
    this.finalPlacement.set(undefined);

    // Reset instant transition flag
    this.instantTransition.set(false);

    // disable scroll strategy
    this.scrollStrategy.disable();
    this.scrollStrategy = new NoopScrollStrategy();
  }

  /**
   * Get the transform origin for the overlay
   */
  private getTransformOrigin(): string {
    const placement = this.config.placement?.() ?? 'top';
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
   * @param arrowElement The arrow element
   * @param padding Optional padding signal between the arrow and the edges of the floating element
   * @internal
   */
  registerArrow(arrowElement: HTMLElement | null, padding?: Signal<number | undefined>): void {
    this.arrowElement = arrowElement;
    this.arrowPadding = padding;
  }

  /**
   * Remove the registered arrow element
   * @internal
   */
  unregisterArrow(): void {
    this.arrowElement = null;
    this.arrowPadding = undefined;
  }

  /**
   * Resolve the container element from the configuration
   * @internal
   */
  private resolveContainer(): HTMLElement {
    if (!this.config.container) {
      return this.document.body;
    }

    if (typeof this.config.container === 'string') {
      const element = this.document.querySelector(this.config.container);
      if (!element) {
        // Fallback to document.body if the container is not found
        console.warn(
          `NgPrimitives: Container element with selector "${this.config.container}" not found. Falling back to document.body.`,
        );
        return this.document.body;
      }

      return element as HTMLElement;
    }

    return this.config.container;
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
