import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  computed,
  DestroyRef,
  inject,
  Injectable,
  Injector,
  NgZone,
  RendererFactory2,
  signal,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { createPortal, NgpPortal } from 'ng-primitives/portal';
import { injectToastConfig } from '../config/toast-config';
import { NgpToast, NgpToastPlacement, NgpToastSwipeDirection } from './toast';
import { provideToastContext } from './toast-context';
import { provideToastOptions } from './toast-options';

@Injectable({
  providedIn: 'root',
})
export class NgpToastManager {
  private readonly config = injectToastConfig();
  private readonly applicationRef = inject(ApplicationRef);
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer = this.rendererFactory.createRenderer(null, null);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  // Map to store containers by placement
  private readonly containers = new Map<string, HTMLElement>();

  /** The element focused before focus entered the toasts, where it returns once they are gone. */
  private focusBeforeToasts: HTMLElement | null = null;
  /** Whether F6 moved focus to the toasts, so that F6 again or Escape takes it back. */
  private enteredWithF6 = false;
  private listeningForKeys = false;

  readonly toasts = signal<NgpToastRecord[]>([]);

  /** The toasts playing their exit animation, which can no longer take focus. */
  private readonly dismissing = new Set<NgpToastRecord>();

  /** Signal that tracks which placements are expanded */
  private readonly expanded = signal<NgpToastPlacement[]>([]);

  /** Show a toast notification */
  show(toast: TemplateRef<void> | Type<unknown>, options: NgpToastOptions = {}): NgpToastRef {
    // services can't access the view container directly, so this is a workaround.
    // Fall back to the caller's injector when no root component is available.
    const rootComponent = this.applicationRef.components[0];
    const viewContainerRef =
      rootComponent?.injector.get(ViewContainerRef) ??
      options.injector?.get(ViewContainerRef, null) ??
      null;

    let instance: NgpToast | null = null;
    const placement = options.placement ?? this.config.placement;
    const duration = options.duration ?? this.config.duration;
    const container = this.getOrCreateContainer(placement);

    const portal = createPortal(
      toast,
      viewContainerRef,
      Injector.create({
        // Scope toast content to the caller's injector when provided, so its DI
        // resolves from their subtree rather than the root injector. See #823.
        parent: options.injector ?? this.injector,
        providers: [
          provideToastContext(options.context),
          provideToastOptions({
            placement,
            duration,
            register: (toast: NgpToast) => (instance = toast),
            expanded: computed(() => this.expanded().includes(placement)),
            dismissible: options.dismissible ?? this.config.dismissible,
            swipeDirections: options.swipeDirections ?? this.config.swipeDirections,
            sequential: options.sequential ?? this.config.sequential,
            persistent: options.persistent ?? this.config.persistent,
          }),
        ],
      }),
      {
        // Hide the toast when the dismiss method is called
        dismiss: () => this.dismiss(instance!),
        context: options.context,
      },
    );

    portal.attach(container);

    // Add the toast to the list of toasts
    if (!instance) {
      throw new Error('A toast must have the NgpToast directive applied.');
    }

    this.toasts.update(toasts => [{ instance: instance!, portal }, ...toasts]);

    return {
      dismiss: () => this.dismiss(instance!),
    };
  }

  /** Hide a toast notification */
  dismiss(toast: NgpToast): Promise<void> {
    return this.hide(toast, false);
  }

  /** @internal */
  dismissBySwipe(toast: NgpToast): Promise<void> {
    // a swipe is a pointer close: focus goes back to the page
    return this.hide(toast, true);
  }

  private async hide(toast: NgpToast, bySwipe: boolean): Promise<void> {
    const ref = this.toasts().find(t => t.instance === toast);

    if (ref) {
      this.dismissing.add(ref);
      this.moveFocusOutOf(ref, bySwipe);

      try {
        // Detach the portal from the container
        await ref.portal.detach();
      } finally {
        this.dismissing.delete(ref);
      }

      // Remove the toast from the list of toasts
      this.toasts.update(toasts => toasts.filter(t => t !== ref));

      // if there are no more toasts, ensure the container is no longer considered expanded
      if (this.toasts().length === 0) {
        this.expanded.update(expanded => expanded.filter(p => p !== toast.options.placement));
      }
    }
  }

  /**
   * A toast that holds focus as it starts to close hands focus on before its exit animation:
   * to the next toast for a keyboard user, otherwise back to where focus was before it
   * entered the toasts. Waiting for the removal would depend on how the toast animates out.
   */
  private moveFocusOutOf(ref: NgpToastRecord, bySwipe: boolean): void {
    const active = this.document.activeElement;

    if (!active) {
      return;
    }

    // Focus on a region itself (after F6, or a click on a toast's text) stays while toasts
    // remain, so F6 can go on to them, and goes back to the page with the last one.
    if ([...this.containers.values()].includes(active as HTMLElement)) {
      if (!this.toasts().some(t => t !== ref && !this.dismissing.has(t))) {
        this.returnFocus();
      }
      return;
    }

    if (!ref.instance.element.contains(active)) {
      return;
    }

    // After a pointer close, focus goes back to the page rather than to a toast the user
    // never moved to.
    const neighbour = !bySwipe && active.matches(':focus-visible') ? this.neighbourOf(ref) : null;

    if (neighbour) {
      focusToast(neighbour);
    } else {
      this.returnFocus();
    }
  }

  /**
   * The toast that takes focus when the given one leaves: the next older toast at the same
   * placement, or the next newer one when it was the oldest.
   */
  private neighbourOf(ref: NgpToastRecord): HTMLElement | null {
    const placement = ref.instance.options.placement;
    const siblings = this.toasts().filter(t => t.instance.options.placement === placement);
    const index = siblings.indexOf(ref);
    // `toasts` lists the newest first: walk to the older toasts, then back to the newer ones
    const candidates = [...siblings.slice(index + 1), ...siblings.slice(0, index).reverse()];
    return candidates.find(t => !this.dismissing.has(t))?.instance.element ?? null;
  }

  /**
   * Lazily create or get a container for a given placement.
   */
  private getOrCreateContainer(placement: string): HTMLElement {
    if (this.containers.has(placement)) {
      return this.containers.get(placement)!;
    }
    const container = this.createContainer(placement);
    this.containers.set(placement, container);
    this.listenForKeys();
    return container;
  }

  /**
   * F6 moves focus to the newest toast's region and back, so toasts stay reachable from the
   * keyboard even while a dialog traps focus.
   */
  private listenForKeys(): void {
    const view = this.document.defaultView;

    if (this.listeningForKeys || !view) {
      return;
    }

    this.listeningForKeys = true;

    const onF6 = (event: KeyboardEvent) => {
      if (event.key !== 'F6' || event.defaultPrevented) {
        return;
      }

      const focused = this.containerOf(this.document.activeElement);

      // Back out only from a region that still shows toasts, and only after an F6 entry.
      // After a Tab entry, F6 is left to the browser.
      if (focused && this.hasToasts(focused)) {
        if (this.enteredWithF6) {
          event.preventDefault();
          this.returnFocus();
        }
        return;
      }

      const newest = this.toasts()[0];
      const container = newest && this.containers.get(newest.instance.options.placement);

      if (!container?.isConnected) {
        return;
      }

      event.preventDefault();
      container.focus({ preventScroll: true });
      // after focus(): its focusin records an entry that is not an F6 one. From nothing focused it
      // has no related target to record, so keep the body: F6 again then leaves the toasts.
      if (!focused) {
        this.focusBeforeToasts ??= this.document.body;
      }
      this.enteredWithF6 = this.focusBeforeToasts !== null;
    };

    // Capture on the window runs before the overlay registry's capture listener on the
    // document, so an open dialog never sees the Escape that leaves the toasts.
    const onEscape = (event: KeyboardEvent) => {
      if (
        event.key !== 'Escape' ||
        event.isComposing ||
        !this.enteredWithF6 ||
        !this.containerOf(this.document.activeElement)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      this.returnFocus();
    };

    // Focus entering the toasts by any way (Tab, a click, F6) records where it came from. Focus
    // coming back from another window has no related target and keeps what was recorded.
    const onFocusIn = (event: FocusEvent) => {
      // Focus anywhere else ends the round trip, even when the matching focusout was skipped
      // because the window was in the background.
      if (!this.containerOf(event.target as Node | null)) {
        this.focusBeforeToasts = null;
        this.enteredWithF6 = false;
        return;
      }

      if (
        event.relatedTarget &&
        this.containerOf(event.target as Node | null) &&
        !this.containerOf(event.relatedTarget as Node | null)
      ) {
        this.focusBeforeToasts =
          event.relatedTarget instanceof HTMLElement ? event.relatedTarget : null;
        this.enteredWithF6 = false;
      }
    };

    // Focus leaving the toasts forgets where it came from. Switching to another window does not:
    // focus comes back to the toasts.
    const onFocusOut = (event: FocusEvent) => {
      if (
        this.document.hasFocus() &&
        this.containerOf(event.target as Node | null) &&
        !this.containerOf(event.relatedTarget as Node | null)
      ) {
        this.focusBeforeToasts = null;
        this.enteredWithF6 = false;
      }
    };

    this.ngZone.runOutsideAngular(() => {
      view.addEventListener('keydown', onF6);
      view.addEventListener('keydown', onEscape, { capture: true });
      view.addEventListener('focusin', onFocusIn);
      view.addEventListener('focusout', onFocusOut);
    });

    this.destroyRef.onDestroy(() => {
      view.removeEventListener('keydown', onF6);
      view.removeEventListener('keydown', onEscape, { capture: true });
      view.removeEventListener('focusin', onFocusIn);
      view.removeEventListener('focusout', onFocusOut);
    });
  }

  private containerOf(node: Node | null): HTMLElement | undefined {
    return [...this.containers.values()].find(container => container.contains(node));
  }

  private hasToasts(container: HTMLElement): boolean {
    return this.toasts().some(
      toast => this.containers.get(toast.instance.options.placement) === container,
    );
  }

  private returnFocus(): void {
    const target = this.focusBeforeToasts;
    this.focusBeforeToasts = null;
    this.enteredWithF6 = false;

    // Nothing had focus before: `body.focus()` would leave focus where it is, so blur instead.
    if (target === this.document.body) {
      (this.document.activeElement as HTMLElement | null)?.blur();
    } else if (target?.isConnected) {
      target.focus({ preventScroll: true });
    }
  }

  /**
   * Create a section in which toasts will be rendered for a specific placement.
   */
  private createContainer(placement: string): HTMLElement {
    const container = this.renderer.createElement('section') as HTMLElement;
    this.renderer.setAttribute(container, 'aria-live', this.config.ariaLive);
    // pair the live region with the role matching its politeness so assistive tech
    // reliably announces additions (status = polite, alert = assertive)
    this.renderer.setAttribute(
      container,
      'role',
      this.config.ariaLive === 'assertive' ? 'alert' : 'status',
    );
    this.renderer.setAttribute(container, 'aria-atomic', 'false');
    this.renderer.setAttribute(container, 'tabindex', '-1');
    this.renderer.setAttribute(container, 'data-ngp-toast-container', placement);
    container.style.setProperty('position', 'fixed');
    container.style.setProperty('z-index', `${this.config.zIndex}`);
    container.style.setProperty('--ngp-toast-offset-top', `${this.config.offsetTop}px`);
    container.style.setProperty('--ngp-toast-offset-bottom', `${this.config.offsetBottom}px`);
    container.style.setProperty('--ngp-toast-offset-left', `${this.config.offsetLeft}px`);
    container.style.setProperty('--ngp-toast-offset-right', `${this.config.offsetRight}px`);
    container.style.setProperty('--ngp-toast-gap', `${this.config.gap}px`);

    // mark the container as expanded
    this.renderer.listen(container, 'mouseenter', () =>
      this.expanded.update(expanded => [...expanded, placement as NgpToastPlacement]),
    );

    this.renderer.listen(container, 'mouseleave', () => {
      this.expanded.update(expanded =>
        expanded.filter(p => p !== (placement as NgpToastPlacement)),
      );
    });

    // Set placement styles
    switch (placement) {
      case 'top-start':
        container.style.setProperty('top', `${this.config.offsetTop}px`);
        container.style.setProperty('left', `${this.config.offsetLeft}px`);
        break;
      case 'top-center':
        container.style.setProperty('top', `${this.config.offsetTop}px`);
        container.style.setProperty('left', '50%');
        container.style.setProperty('transform', 'translateX(-50%)');
        break;
      case 'top-end':
        container.style.setProperty('top', `${this.config.offsetTop}px`);
        container.style.setProperty('right', `${this.config.offsetRight}px`);
        break;
      case 'bottom-start':
        container.style.setProperty('bottom', `${this.config.offsetBottom}px`);
        container.style.setProperty('left', `${this.config.offsetLeft}px`);
        break;
      case 'bottom-center':
        container.style.setProperty('bottom', `${this.config.offsetBottom}px`);
        container.style.setProperty('left', '50%');
        container.style.setProperty('transform', 'translateX(-50%)');
        break;
      case 'bottom-end':
        container.style.setProperty('bottom', `${this.config.offsetBottom}px`);
        container.style.setProperty('right', `${this.config.offsetRight}px`);
        break;
      default:
        throw new Error(`Unknown toast placement: ${placement}`);
    }

    this.renderer.appendChild(document.body, container);
    return container;
  }
}

export interface NgpToastOptions<T = unknown> {
  /** The position of the toast */
  placement?: NgpToastPlacement;

  /** The duration of the toast in milliseconds */
  duration?: number;

  /** Whether the toast is dismissible */
  dismissible?: boolean;

  /** The swipe directions supported by the toast */
  swipeDirections?: NgpToastSwipeDirection[];

  /** The context to make available to the toast */
  context?: T;

  /** When enabled, only the front toast's timer will run */
  sequential?: boolean;

  /** When true, the toast will not auto-dismiss and must be dismissed explicitly */
  persistent?: boolean;

  /**
   * The injector used to render the toast content. Provide the calling component's
   * injector when the toast depends on component-scoped providers. Defaults to root.
   */
  injector?: Injector;
}

interface NgpToastRecord {
  instance: NgpToast;
  portal: NgpPortal;
}

export interface NgpToastRef {
  dismiss(): Promise<void>;
}

/**
 * Focus a toast, which is not focusable by itself. It holds a tabindex only while focused, so
 * a click on a toast never focuses it.
 */
function focusToast(element: HTMLElement): void {
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');

    const onBlur = () => {
      // The window losing focus blurs the toast but keeps it active, to refocus on return.
      if (element.ownerDocument.activeElement === element) {
        return;
      }
      element.removeAttribute('tabindex');
      element.removeEventListener('blur', onBlur);
    };

    element.addEventListener('blur', onBlur);
  }
  element.focus({ preventScroll: true });
}
