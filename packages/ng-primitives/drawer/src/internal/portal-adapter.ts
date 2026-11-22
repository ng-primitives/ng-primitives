import { Injector, TemplateRef, ViewContainerRef } from '@angular/core';
import { StyleInjector } from 'ng-primitives/internal';
import { createPortal, NgpPortal } from 'ng-primitives/portal';
import { releaseDrawerIsolation } from './modal-isolation';

// `:where()` keeps this at zero specificity, so any `pointer-events` the consumer sets on a part
// (a pass-through non-modal viewport, say) still wins over the restored default.
const OVERLAY_HOST_STYLES = `:where([data-ngp-drawer-overlay-host]) > * { pointer-events: auto; }`;

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
    if (this.portal && this.ownedHost) {
      // The view is reused for as long as this adapter owns one. A host that left the document
      // with its container goes back in, rather than a second host and view being created.
      if (!this.ownedHost.isConnected) {
        (this.container ?? this.document.body).append(this.ownedHost);
      }
      this.bringDefaultHostToFront();
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
      // The host only positions and stacks the parts: it must not take the hit itself, or it
      // swallows clicks outside a non-modal drawer. Its direct children get `auto` back.
      host.style.pointerEvents = 'none';
      this.injector.get(StyleInjector).add('ngp-drawer-overlay-host', OVERLAY_HOST_STYLES);
      this.document.body.append(host);
    }

    this.ownedHost = host;
    this.portal = createPortal(this.templateRef, this.viewContainerRef, this.injector);
    // The drawer drives its own enter/exit transitions through `data-starting-style` and
    // `data-ending-style`, so the portal must not defer the enter state by a frame.
    this.portal.attach(host, { immediate: true });
  }

  get hostElement(): HTMLElement | null {
    return this.ownedHost;
  }

  show(): void {
    const host = this.hostElement;
    if (host) {
      releaseDrawerIsolation(host);
      host.hidden = false;
      host.inert = false;
      host.removeAttribute('aria-hidden');
    }
  }

  hide(): void {
    const host = this.hostElement;
    if (host) {
      releaseDrawerIsolation(host);
      host.hidden = true;
      host.inert = true;
      host.setAttribute('aria-hidden', 'true');
    }
  }

  private bringDefaultHostToFront(): void {
    const host = this.ownedHost;
    // Every default host shares one z-index, so DOM order decides which drawer paints on top: a
    // reopened kept-mounted host must move past whatever the body gained since it first opened.
    if (!this.container && host && host !== this.document.body.lastElementChild) {
      this.document.body.append(host);
    }
  }

  destroy(): void {
    // The exit transition has already been awaited by the portal directive, so detach
    // immediately - this destroys the embedded view synchronously.
    void this.portal?.detach({ immediate: true });
    this.portal = null;
    this.ownedHost?.remove();
    this.ownedHost = null;
  }
}
