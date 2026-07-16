import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { ApplicationRef, Injector, TemplateRef, ViewContainerRef } from '@angular/core';
import type { Subscription } from 'rxjs';

export class DrawerPortalAdapter {
  private readonly portal: TemplatePortal<unknown>;
  private overlayRef: OverlayRef | null = null;
  private overlayDetachSubscription: Subscription | null = null;
  private domOutlet: DomPortalOutlet | null = null;
  private ownedHost: HTMLElement | null = null;

  constructor(
    private readonly overlay: Overlay,
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly applicationRef: ApplicationRef,
    private readonly injector: Injector,
    private readonly document: Document,
    private readonly container: HTMLElement | null,
    private readonly onExternalDetach: () => void,
  ) {
    this.portal = new TemplatePortal(this.templateRef, this.viewContainerRef);
  }

  attach(): void {
    if (this.hasAttached()) {
      this.show();
      return;
    }

    if (this.container) {
      const host = this.document.createElement('div');
      host.setAttribute('data-ngp-drawer-custom-host', '');
      this.container.append(host);
      this.ownedHost = host;
      this.domOutlet = new DomPortalOutlet(host, this.applicationRef, this.injector);
      this.domOutlet.attach(this.portal);
      return;
    }

    const overlayRef = this.overlay.create({
      disposeOnNavigation: true,
      hasBackdrop: false,
      height: '100%',
      positionStrategy: this.overlay.position().global().top('0').left('0'),
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      width: '100%',
    });
    this.overlayRef = overlayRef;
    overlayRef.overlayElement.setAttribute('data-ngp-drawer-overlay-host', '');
    this.overlayDetachSubscription = overlayRef.detachments().subscribe(() => {
      if (this.overlayRef !== overlayRef) {
        return;
      }
      this.overlayDetachSubscription?.unsubscribe();
      this.overlayDetachSubscription = null;
      this.overlayRef = null;
      this.onExternalDetach();
    });
    overlayRef.attach(this.portal);
  }

  hasAttached(): boolean {
    return this.overlayRef?.hasAttached() === true || this.domOutlet?.hasAttached() === true;
  }

  get hostElement(): HTMLElement | null {
    return this.ownedHost ?? this.overlayRef?.overlayElement ?? null;
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
    this.domOutlet?.dispose();
    this.domOutlet = null;
    this.overlayDetachSubscription?.unsubscribe();
    this.overlayDetachSubscription = null;
    const overlayRef = this.overlayRef;
    this.overlayRef = null;
    overlayRef?.dispose();
    this.ownedHost?.remove();
    this.ownedHost = null;
  }
}
