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

  /** The element focused before F6 moved focus to the toasts, restored by F6 again or Escape. */
  private focusBeforeToasts: HTMLElement | null = null;
  /** The element focused before focus entered the toasts by any means, such as a click. */
  private focusBeforeEntry: HTMLElement | null = null;
  private listeningForKeys = false;

  readonly toasts = signal<NgpToastRecord[]>([]);

  /** Signal that tracks which placements are expanded */
  private readonly expanded = signal<NgpToastPlacement[]>([]);

  /** Show a toast notification */
  show<T = unknown>(
    toast: TemplateRef<void> | Type<unknown>,
    options: NgpToastOptions<T> = {},
  ): NgpToastRef<T> {
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
    const context = signal(options.context as T);

    const portal = createPortal(
      toast,
      viewContainerRef,
      Injector.create({
        // Scope toast content to the caller's injector when provided, so its DI
        // resolves from their subtree rather than the root injector. See #823.
        parent: options.injector ?? this.injector,
        providers: [
          provideToastContext(context.asReadonly()),
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
        // A getter, so a template that reads `context` follows the signal
        get context() {
          return context();
        },
      },
    );

    portal.attach(container);

    // Add the toast to the list of toasts
    if (!instance) {
      throw new Error('A toast must have the NgpToast directive applied.');
    }

    const record: NgpToastRecord = { instance: instance!, portal, leaving: false };
    this.toasts.update(toasts => [record, ...toasts]);

    return {
      dismiss: () => this.dismiss(instance!),
      update: changes => {
        if (record.leaving || !this.toasts().includes(record)) {
          return;
        }

        if ('context' in changes) {
          context.set(changes.context as T);
        }

        record.instance.restart(changes);
      },
    };
  }

  /** Hide a toast notification */
  async dismiss(toast: NgpToast): Promise<void> {
    const ref = this.toasts().find(t => t.instance === toast);

    if (ref) {
      ref.leaving = true;

      // Read before the detach: removing the focused toast fires focusout in some browsers
      // only, and that clears the saved element.
      const returnTo = this.containerOf(this.document.activeElement)
        ? (this.focusBeforeToasts ?? this.focusBeforeEntry)
        : null;

      // Detach the portal from the container
      await ref.portal.detach();

      // Remove the toast from the list of toasts
      this.toasts.update(toasts => toasts.filter(t => t !== ref));

      // if there are no more toasts, ensure the container is no longer considered expanded
      if (this.toasts().length === 0) {
        this.expanded.update(expanded => expanded.filter(p => p !== toast.options.placement));
      }

      // A focused toast that leaves takes focus with it, so land where F6 came from. So does
      // the last toast leaving a focused region: F6 has no toast left to go back from.
      const active = this.document.activeElement;
      const focusLost =
        !active ||
        active === this.document.body ||
        (this.toasts().length === 0 && !!this.containerOf(active));
      if (returnTo && focusLost) {
        this.focusBeforeToasts = null;
        this.focusBeforeEntry = null;
        this.moveFocusTo(returnTo);
      }
    }
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

      // Back out only from a region that still shows toasts. Reached with Tab, there is
      // nowhere to go back to, so F6 is left to the browser.
      if (focused && this.hasToasts(focused)) {
        if (this.focusBeforeToasts) {
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

      // From an emptied region, keep the element saved when F6 first moved here.
      if (!focused) {
        this.focusBeforeToasts = this.document.activeElement as HTMLElement | null;
      }

      container.focus({ preventScroll: true });
    };

    // Capture on the window runs before the overlay registry's capture listener on the
    // document, so an open dialog never sees the Escape that leaves the toasts.
    const onEscape = (event: KeyboardEvent) => {
      if (
        event.key !== 'Escape' ||
        event.isComposing ||
        !this.focusBeforeToasts ||
        !this.containerOf(this.document.activeElement)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      this.returnFocus();
    };

    // Leaving the toasts by any other way (a click, Tab) ends the F6 round trip. Switching to
    // another window does not: focus comes back to the toasts.
    const onFocusOut = (event: FocusEvent) => {
      if (
        this.document.hasFocus() &&
        this.containerOf(event.target as Node | null) &&
        !this.containerOf(event.relatedTarget as Node | null)
      ) {
        this.focusBeforeToasts = null;
        this.focusBeforeEntry = null;
      }
    };

    // A toast removed while focused takes focus with it, so remember where focus came from
    // even when it did not arrive with F6 (a click in Chrome focuses the toast's button).
    const onFocusIn = (event: FocusEvent) => {
      const from = event.relatedTarget as HTMLElement | null;

      if (this.containerOf(event.target as Node | null) && from && !this.containerOf(from)) {
        this.focusBeforeEntry = from;
      }
    };

    this.ngZone.runOutsideAngular(() => {
      view.addEventListener('keydown', onF6);
      view.addEventListener('keydown', onEscape, { capture: true });
      view.addEventListener('focusout', onFocusOut);
      view.addEventListener('focusin', onFocusIn);
    });

    this.destroyRef.onDestroy(() => {
      view.removeEventListener('keydown', onF6);
      view.removeEventListener('keydown', onEscape, { capture: true });
      view.removeEventListener('focusout', onFocusOut);
      view.removeEventListener('focusin', onFocusIn);
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

    if (target) {
      this.moveFocusTo(target);
    }
  }

  private moveFocusTo(target: HTMLElement): void {
    // Nothing had focus before: `body.focus()` would leave focus where it is, so blur instead.
    if (target === this.document.body) {
      (this.document.activeElement as HTMLElement | null)?.blur();
    } else if (target.isConnected) {
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
  /** Whether the toast is being dismissed. */
  leaving: boolean;
}

export interface NgpToastRef<T = unknown> {
  /** Dismiss the toast. */
  dismiss(): Promise<void>;

  /**
   * Change the toast in place: it keeps its position and does not replay its enter animation.
   * The timer restarts with the new duration, or the current one, unless the toast is persistent.
   * Does nothing once the toast is being dismissed.
   */
  update(changes: NgpToastUpdate<T>): void;
}

export interface NgpToastUpdate<T = unknown> {
  /** The new context of the toast. */
  context?: T;

  /** The new duration of the toast in milliseconds. */
  duration?: number;

  /** When true, the toast stops its timer; when false, it starts it again. */
  persistent?: boolean;
}
