import { VERSION } from '@angular/cdk';
import { ComponentPortal, DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import {
  type ApplicationRef,
  ComponentRef,
  EmbeddedViewRef,
  Injector,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { NgpExitAnimationRef, setupExitAnimation } from 'ng-primitives/internal';

export abstract class NgpPortal {
  constructor(
    protected readonly viewContainerRef: ViewContainerRef,
    protected readonly injector: Injector,
  ) {}

  /**
   * Get the elements of the portal.
   */
  abstract getElements(): HTMLElement[];

  /**
   * Detect changes in the portal.
   */
  abstract detectChanges(): void;

  /**
   * Whether the portal is attached to a DOM element.
   */
  abstract getAttached(): boolean;

  /**
   * Attach the portal to a DOM element.
   * @param container The DOM element to attach the portal to.
   */
  abstract attach(container: HTMLElement): this;

  /**
   * Detach the portal from the DOM.
   */
  abstract detach(): Promise<void>;

  /**
   * Angular v20 removes `_unusedComponentFactoryResolver` and `_document` from DomPortalOutlet's
   * constructor signature as they have been deprecated since v18, and replaced with optional
   * `_appRef` and `_defaultInjector` params.
   * This temporary change ensures consistent behaviour for consumers using ng v20+.
   * @see {@link https://github.com/angular/components/pull/24504 The implementing PR} for the new implementation.
   * @see {@link https://github.com/angular/components/blob/732a0d7ab69ec25925cc06a0fb17b0fb16a4b0ae/src/cdk/portal/dom-portal-outlet.ts#L27 The latest v20 version comments}
   * describe the importance of passing the `_appRef` and `_defaultInjector` when it comes to component portals
   */
  // todo: remove this compat fix once support for v19 is dropped when v21 is released
  //  - should aim to add appRef also to prevent unforeseen issues in certain edge cases
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _getDomPortalOutletCtorParamsCompat(): (ApplicationRef | Injector | undefined | any)[] {
    return Number(VERSION.major) >= 20 ? [this.injector] : [undefined, this.injector];
  }
}

export class NgpComponentPortal<T> extends NgpPortal {
  private readonly componentPortal: ComponentPortal<T>;
  private viewRef: ComponentRef<T> | null = null;
  private isDestroying = false;
  private exitAnimationRef: NgpExitAnimationRef | null = null;

  constructor(component: Type<T>, viewContainerRef: ViewContainerRef, injector: Injector) {
    super(viewContainerRef, injector);
    this.componentPortal = new ComponentPortal(component, viewContainerRef, injector);
  }

  /**
   * Attach the portal to a DOM element.
   * @param container The DOM element to attach the portal to.
   */
  attach(container: HTMLElement): this {
    const domOutlet = new DomPortalOutlet(
      container,
      undefined,
      ...this._getDomPortalOutletCtorParamsCompat(),
    );
    this.viewRef = domOutlet.attach(this.componentPortal);

    const element = this.viewRef.location.nativeElement as HTMLElement;

    this.exitAnimationRef = setupExitAnimation({ element });

    return this;
  }

  /**
   * Get the root elements of the portal.
   */
  getElements(): HTMLElement[] {
    return this.viewRef ? [this.viewRef.location.nativeElement] : [];
  }

  /**
   * Detect changes in the portal.
   */
  detectChanges(): void {
    this.viewRef?.changeDetectorRef.detectChanges();
  }

  /**
   * Whether the portal is attached to a DOM element.
   */
  getAttached(): boolean {
    return !!this.viewRef && (this.viewRef.location.nativeElement as HTMLElement).isConnected;
  }

  /**
   * Detach the portal from the DOM.
   */
  async detach(): Promise<void> {
    if (this.isDestroying) {
      return;
    }
    this.isDestroying = true;

    // if there is an exit animation manager, wait for it to finish
    await this.exitAnimationRef?.exit();

    if (this.viewRef) {
      this.viewRef.destroy();
      this.viewRef = null;
    }
  }
}

export class NgpTemplatePortal<T> extends NgpPortal {
  private readonly templatePortal: TemplatePortal<T>;
  private viewRef: EmbeddedViewRef<T> | null = null;
  private exitAnimationRefs: NgpExitAnimationRef[] = [];
  private isDestroying = false;

  constructor(
    template: TemplateRef<T>,
    viewContainerRef: ViewContainerRef,
    injector: Injector,
    context?: T,
  ) {
    super(viewContainerRef, injector);
    this.templatePortal = new TemplatePortal(template, viewContainerRef, context, injector);
  }

  /**
   * Attach the portal to a DOM element.
   * @param container The DOM element to attach the portal to.
   */
  attach(container: HTMLElement): this {
    const domOutlet = new DomPortalOutlet(
      container,
      undefined,
      ...this._getDomPortalOutletCtorParamsCompat(),
    );
    this.viewRef = domOutlet.attach(this.templatePortal);

    for (const rootNode of this.viewRef.rootNodes) {
      if (rootNode instanceof HTMLElement) {
        // Setup exit animation for each root node
        const exitAnimationRef = setupExitAnimation({ element: rootNode });
        this.exitAnimationRefs.push(exitAnimationRef);
      }
    }

    return this;
  }

  /**
   * Get the root elements of the portal.
   */
  getElements(): HTMLElement[] {
    return this.viewRef ? this.viewRef.rootNodes : [];
  }

  /**
   * Detect changes in the portal.
   */
  detectChanges(): void {
    this.viewRef?.detectChanges();
  }

  /**
   * Whether the portal is attached to a DOM element.
   */
  getAttached(): boolean {
    return !!this.viewRef && this.viewRef.rootNodes.length > 0;
  }

  /**
   * Detach the portal from the DOM.
   */
  async detach(): Promise<void> {
    if (this.isDestroying) {
      return;
    }

    this.isDestroying = true;

    // if there is an exit animation manager, wait for it to finish
    await Promise.all(this.exitAnimationRefs.map(ref => ref.exit()));

    if (this.viewRef) {
      this.viewRef.destroy();
      this.viewRef = null;
    }
  }
}

export function createPortal<T>(
  componentOrTemplate: Type<T> | TemplateRef<T>,
  viewContainerRef: ViewContainerRef,
  injector: Injector,
  context?: T,
): NgpPortal {
  if (componentOrTemplate instanceof TemplateRef) {
    return new NgpTemplatePortal(componentOrTemplate, viewContainerRef, injector, context);
  } else {
    return new NgpComponentPortal(componentOrTemplate, viewContainerRef, injector);
  }
}
