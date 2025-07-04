import {
  ApplicationRef,
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
import { NgpToast } from './toast';
import { provideToastContext } from './toast-context';

@Injectable({
  providedIn: 'root',
})
export class NgpToastManager {
  private readonly config = injectToastConfig();
  private readonly applicationRef = inject(ApplicationRef);
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer = this.rendererFactory.createRenderer(null, null);
  private readonly injector = inject(Injector);
  private readonly container = this.createContainer();

  readonly toasts = signal<NgpToastRef[]>([]);

  /** Show a toast notification */
  show(toast: TemplateRef<void> | Type<unknown>, options: NgpToastOptions = {}) {
    // services can't access the view container directly, so this is a workaround
    const viewContainerRef = this.applicationRef.components[0].injector.get(ViewContainerRef);

    let instance: NgpToast | null = null;

    const portal = createPortal(
      toast,
      viewContainerRef,
      Injector.create({
        parent: this.injector,
        providers: [
          provideToastContext({
            position: options.position ?? 'top-end',
            duration: options.duration ?? 5000,
            register: (toast: NgpToast) => (instance = toast),
            hide: (toast: NgpToast) => this.hide(toast),
          }),
        ],
      }),
    );

    portal.attach(this.container);

    // Add the toast to the list of toasts
    if (!instance) {
      throw new Error('A toast must have the NgpToast directive applied.');
    }

    this.toasts.update(toasts => [...toasts, { instance: instance!, portal }]);
  }

  /** Hide a toast notification */
  async hide(toast: NgpToast): Promise<void> {
    const ref = this.toasts().find(t => t.instance === toast);

    if (ref) {
      // Detach the portal from the container
      await ref.portal.detach();

      // Remove the toast from the list of toasts
      this.toasts.update(toasts => toasts.filter(t => t !== ref));
    }
  }

  /**
   * Create a section in which toasts will be rendered.
   */
  private createContainer(): HTMLElement {
    const container = this.renderer.createElement('section') as HTMLElement;
    this.renderer.setAttribute(container, 'aria-live', 'polite');
    this.renderer.setAttribute(container, 'aria-atomic', 'false');
    this.renderer.setAttribute(container, 'tabindex', '-1');

    container.style.setProperty('--ngp-toast-offset-top', `${this.config.offsetTop}px`);
    container.style.setProperty('--ngp-toast-offset-bottom', `${this.config.offsetBottom}px`);
    container.style.setProperty('--ngp-toast-offset-left', `${this.config.offsetLeft}px`);
    container.style.setProperty('--ngp-toast-offset-right', `${this.config.offsetRight}px`);
    container.style.setProperty('--ngp-toast-gap', `${this.config.gap}px`);
    container.style.setProperty('--ngp-toast-width', `${this.config.width}px`);

    // add the container to the body
    this.renderer.appendChild(document.body, container);

    return container;
  }
}

export interface NgpToastOptions {
  /** The position of the toast */
  position?:
    | 'top-start'
    | 'top-end'
    | 'top-center'
    | 'bottom-start'
    | 'bottom-end'
    | 'bottom-center';

  /** The duration of the toast in milliseconds */
  duration?: number;
}

interface NgpToastRef {
  instance: NgpToast;
  portal: NgpPortal;
}
