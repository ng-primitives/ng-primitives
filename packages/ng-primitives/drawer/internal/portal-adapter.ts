import { Injector, TemplateRef, ViewContainerRef } from '@angular/core';
import { createPortal, NgpPortal } from 'ng-primitives/portal';

export class DrawerPortalAdapter {
  private portal: NgpPortal | null = null;
  private ownedHost: HTMLElement | null = null;

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly injector: Injector,
    private readonly document: Document,
    private readonly container: HTMLElement | null,
  ) {}

  attach(): void {
    if (this.hasAttached()) {
      this.show();
      return;
    }

    const host = this.document.createElement('div');

    if (this.container) {
      host.setAttribute('data-ngp-drawer-custom-host', '');
      this.container.append(host);
    } else {
      host.setAttribute('data-ngp-drawer-overlay-host', '');
      // A fullscreen, fixed host so the drawer parts position against the viewport
      // regardless of where the consumer placed the trigger in the document.
      host.style.position = 'fixed';
      host.style.top = '0';
      host.style.left = '0';
      host.style.width = '100%';
      host.style.height = '100%';
      host.style.zIndex = '1000';
      this.document.body.append(host);
    }

    this.ownedHost = host;
    this.portal = createPortal(this.templateRef, this.viewContainerRef, this.injector);
    // The drawer drives its own enter/exit transitions through `data-starting-style` and
    // `data-ending-style`, so the portal must not defer the enter state by a frame.
    this.portal.attach(host, { immediate: true });
  }

  hasAttached(): boolean {
    return this.portal?.getAttached() === true;
  }

  get hostElement(): HTMLElement | null {
    return this.ownedHost;
  }

  show(): void {
    const host = this.hostElement;
    if (host) {
      host.hidden = false;
      host.inert = false;
      host.removeAttribute('aria-hidden');
    }
  }

  hide(): void {
    const host = this.hostElement;
    if (host) {
      host.hidden = true;
      host.inert = true;
      host.setAttribute('aria-hidden', 'true');
    }
  }

  destroy(): void {
    // The exit transition has already been awaited by the portal directive, so detach
    // immediately - this destroys the embedded view synchronously.
    void this.portal?.detach(true);
    this.portal = null;
    this.ownedHost?.remove();
    this.ownedHost = null;
  }
}
