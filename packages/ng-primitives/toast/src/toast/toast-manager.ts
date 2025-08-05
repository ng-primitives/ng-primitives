import {
  ApplicationRef,
  computed,
  inject,
  Injectable,
  Injector,
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
  // Map to store containers by placement
  private readonly containers = new Map<string, HTMLElement>();

  readonly toasts = signal<NgpToastRecord[]>([]);

  /** Signal that tracks which placements are expanded */
  private readonly expanded = signal<NgpToastPlacement[]>([]);

  /** Show a toast notification */
  show(toast: TemplateRef<void> | Type<unknown>, options: NgpToastOptions = {}): NgpToastRef {
    // services can't access the view container directly, so this is a workaround
    const viewContainerRef = this.applicationRef.components[0].injector.get(ViewContainerRef);

    let instance: NgpToast | null = null;
    const placement = options.placement ?? this.config.placement;
    const duration = options.duration ?? this.config.duration;
    const container = this.getOrCreateContainer(placement);

    const portal = createPortal(
      toast,
      viewContainerRef,
      Injector.create({
        parent: this.injector,
        providers: [
          provideToastContext(options.context),
          provideToastOptions({
            placement,
            duration,
            register: (toast: NgpToast) => (instance = toast),
            expanded: computed(() => this.expanded().includes(placement)),
            dismissible: options.dismissible ?? this.config.dismissible,
            swipeDirections: options.swipeDirections ?? this.config.swipeDirections,
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
  async dismiss(toast: NgpToast): Promise<void> {
    const ref = this.toasts().find(t => t.instance === toast);

    if (ref) {
      // Detach the portal from the container
      await ref.portal.detach();

      // Remove the toast from the list of toasts
      this.toasts.update(toasts => toasts.filter(t => t !== ref));

      // if there are no more toasts, ensure the container is no longer considered expanded
      if (this.toasts().length === 0) {
        this.expanded.update(expanded => expanded.filter(p => p !== toast.options.placement));
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
    return container;
  }

  /**
   * Create a section in which toasts will be rendered for a specific placement.
   */
  private createContainer(placement: string): HTMLElement {
    const container = this.renderer.createElement('section') as HTMLElement;
    this.renderer.setAttribute(container, 'aria-live', this.config.ariaLive);
    this.renderer.setAttribute(container, 'aria-atomic', 'false');
    this.renderer.setAttribute(container, 'tabindex', '-1');
    this.renderer.setAttribute(container, 'data-ngp-toast-container', placement);

    container.style.setProperty('position', 'fixed');
    container.style.setProperty('z-index', `${this.config.zIndex}`);

    // Only set width if it's specified in the config

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
}

interface NgpToastRecord {
  instance: NgpToast;
  portal: NgpPortal;
}

interface NgpToastRef {
  dismiss(): Promise<void>;
}
