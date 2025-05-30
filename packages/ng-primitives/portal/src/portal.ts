import { ComponentPortal, DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import {
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
    const domOutlet = new DomPortalOutlet(container, undefined, undefined, this.injector);
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
    const domOutlet = new DomPortalOutlet(container, undefined, undefined, this.injector);
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
