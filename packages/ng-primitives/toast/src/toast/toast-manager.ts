import {
  ApplicationRef,
  inject,
  Injectable,
  Injector,
  RendererFactory2,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { createPortal } from 'ng-primitives/portal';
import { NgpToast } from './toast';
import { provideToastContext } from './toast-context';

@Injectable({
  providedIn: 'root',
})
export class NgpToastManager {
  private readonly applicationRef = inject(ApplicationRef);
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer = this.rendererFactory.createRenderer(null, null);
  private readonly injector = inject(Injector);
  private readonly container = this.createContainer();
  private readonly toasts: NgpToast[] = [];

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
          }),
        ],
      }),
    );

    portal.attach(this.container);

    // Add the toast to the list of toasts
    if (!instance) {
      throw new Error('A toast must have the NgpToast directive applied.');
    }

    this.toasts.push(instance);
  }

  /** Hide a toast notification */
  hide(toast: TemplateRef<void> | Type<unknown>) {
    // this.toasts.update(current => current.filter(t => t.id !== toast.id));
  }

  /**
   * Create a section in which toasts will be rendered.
   */
  private createContainer(): HTMLElement {
    const container = this.renderer.createElement('section');
    this.renderer.setAttribute(container, 'aria-live', 'polite');
    this.renderer.setAttribute(container, 'aria-atomic', 'false');
    this.renderer.setAttribute(container, 'tabindex', '-1');

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
