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
import { createPortal } from 'ng-primitives/portal';
import { NgpToast } from './toast';

@Injectable({
  providedIn: 'root',
})
export class NgpToastManager {
  private readonly applicationRef = inject(ApplicationRef);
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer = this.rendererFactory.createRenderer(null, null);
  private readonly injector = inject(Injector);
  private readonly positionContainers: Record<string, HTMLElement> = {};
  private readonly container = this.createContainer();

  /** Store the active toasts */
  readonly toasts = signal<NgpToast[]>([]);

  /** Show a toast notification */
  show(toast: TemplateRef<void> | Type<unknown>) {
    // services can't access the view container directly, so this is a workaround
    const viewContainerRef = this.applicationRef.components[0].injector.get(ViewContainerRef);

    const portal = createPortal(toast, viewContainerRef, this.injector);
    portal.attach()

    debugger;
    // this.toasts.update(current => [...current, toast]);
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

    // create lists within the container for each position
    const positions = [
      'top-start',
      'top-end',
      'top-center',
      'bottom-start',
      'bottom-end',
      'bottom-center',
    ];

    for (const position of positions) {
      const [x, y] = position.split('-');

      const positionContainer = this.renderer.createElement('ol');
      this.renderer.setAttribute(positionContainer, 'tabindex', '-1');
      this.renderer.setAttribute(positionContainer, 'data-position-x', x);
      this.renderer.setAttribute(positionContainer, 'data-position-y', y);

      this.positionContainers[position] = positionContainer;
      this.renderer.appendChild(container, positionContainer);
    }

    return container;
  }
}
