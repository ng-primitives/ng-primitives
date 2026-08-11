import { VERSION } from '@angular/cdk';
import { ComponentPortal, DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import {
  ApplicationRef,
  ComponentRef,
  EmbeddedViewRef,
  Injector,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { NgpExitAnimationRef, setupExitAnimation } from 'ng-primitives/internal';

export interface NgpPortalAttachOptions {
  /** If true, skip enter animation delay and set enter state immediately. */
  immediate?: boolean;
}

export interface NgpPortalDetachOptions {
  /** If true, skip exit animations and remove immediately. */
  immediate?: boolean;
  /**
   * If true, remove the root nodes from the DOM but keep the underlying view/component
   * instance alive instead of destroying it, so `reattach()` can cheaply re-insert it
   * later without the content being re-created.
   */
  keepMounted?: boolean;
}

/**
 * Clear the animation state a previous attach cycle left on a node. Re-inserting an element
 * restarts its CSS animations, so a kept-mounted node still marked `data-exit` would replay
 * its exit animation; a fresh attach starts with neither attribute set.
 */
function clearAnimationState(node: Node): void {
  if (node instanceof HTMLElement) {
    node.removeAttribute('data-enter');
    node.removeAttribute('data-exit');
  }
}

export abstract class NgpPortal {
  constructor(
    protected readonly viewContainerRef: ViewContainerRef | null,
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
   * @param options Optional attach configuration
   */
  abstract attach(container: HTMLElement, options?: NgpPortalAttachOptions): this;

  /**
   * Detach the portal from the DOM.
   * @param options Optional detach configuration
   */
  abstract detach(options?: NgpPortalDetachOptions): Promise<void>;

  /**
   * Cancel an in-progress detach operation. If exit animations are running,
   * they are cancelled and the portal transitions back to the enter state.
   */
  abstract cancelDetach(): void;

  /**
   * End an in-progress detach now, skipping the rest of any exit animation, so
   * the pending `detach()` resolves and tears the view down.
   *
   * Concrete rather than abstract: `NgpPortal` is exported, so an abstract
   * member added here would stop any subclass outside this repo compiling.
   * Doing nothing is the honest default for a portal that doesn't animate.
   */
  finishDetach(): void {
    // no-op
  }

  /**
   * Re-insert a previously detached-but-kept-mounted portal's root nodes into a container.
   * Only valid after a `detach({ keepMounted: true })` call that left the underlying view alive.
   * @param container The DOM element to reattach the portal to.
   * @param options Optional attach configuration
   */
  abstract reattach(container: HTMLElement, options?: NgpPortalAttachOptions): void;

  /**
   * Destroy the underlying view, releasing the content instance. Safe to call more than
   * once, and the only way to release a portal left alive by `detach({ keepMounted: true })`.
   */
  abstract destroyView(): void;

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
  private detachCancelled = false;
  private exitAnimationRef: NgpExitAnimationRef | null = null;

  constructor(component: Type<T>, viewContainerRef: ViewContainerRef | null, injector: Injector) {
    super(viewContainerRef, injector);
    this.componentPortal = new ComponentPortal(component, viewContainerRef, injector);
  }

  /**
   * Attach the portal to a DOM element.
   * @param container The DOM element to attach the portal to.
   * @param options Optional attach configuration
   */
  attach(container: HTMLElement, options?: NgpPortalAttachOptions): this {
    const appRef = this.injector.get(ApplicationRef);
    const domOutlet =
      Number(VERSION.major) >= 20
        ? new DomPortalOutlet(container, appRef, this.injector)
        : // @ts-expect-error: Compatibility for Angular versions < 20
          new DomPortalOutlet(container, undefined, appRef, this.injector);

    this.viewRef = domOutlet.attach(this.componentPortal);

    const element = this.viewRef.location.nativeElement as HTMLElement;

    this.exitAnimationRef = setupExitAnimation({ element, immediate: options?.immediate });

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
   * Cancel an in-progress detach operation.
   */
  cancelDetach(): void {
    if (this.isDestroying) {
      this.detachCancelled = true;
      this.exitAnimationRef?.cancel();
      this.isDestroying = false;
    }
  }

  /**
   * End an in-progress detach now, skipping the rest of any exit animation.
   */
  override finishDetach(): void {
    if (this.isDestroying) {
      this.exitAnimationRef?.finish();
    }
  }

  /**
   * Detach the portal from the DOM.
   * @param options Optional detach configuration
   */
  async detach({ immediate, keepMounted }: NgpPortalDetachOptions = {}): Promise<void> {
    if (this.isDestroying) {
      return;
    }
    this.isDestroying = true;
    this.detachCancelled = false;

    // Only wait for exit animation if not immediate
    if (!immediate) {
      await this.exitAnimationRef?.exit();
    }

    // If cancelled during exit animation, don't destroy
    if (this.detachCancelled) {
      this.detachCancelled = false;
      return;
    }

    if (!keepMounted) {
      this.destroyView();
      return;
    }

    if (this.viewRef) {
      (this.viewRef.location.nativeElement as HTMLElement).remove();
      // Reusable for a future detach() cycle once reattach() is called.
      this.isDestroying = false;
    }
  }

  /**
   * Re-insert a previously detached-but-kept-mounted component's root element into a container.
   */
  reattach(container: HTMLElement, options?: NgpPortalAttachOptions): void {
    if (!this.viewRef) {
      throw new Error('Cannot reattach a component portal that has been destroyed.');
    }

    const element = this.viewRef.location.nativeElement as HTMLElement;
    clearAnimationState(element);
    container.appendChild(element);
    this.exitAnimationRef = setupExitAnimation({ element, immediate: options?.immediate });
  }

  /**
   * Destroy the underlying view. Safe to call more than once.
   */
  destroyView(): void {
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
  private detachCancelled = false;

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
   * @param options Optional attach configuration
   */
  attach(container: HTMLElement, options?: NgpPortalAttachOptions): this {
    const domOutlet = new DomPortalOutlet(
      container,
      undefined,
      ...this._getDomPortalOutletCtorParamsCompat(),
    );
    this.viewRef = domOutlet.attach(this.templatePortal);

    for (const rootNode of this.viewRef.rootNodes) {
      if (rootNode instanceof HTMLElement) {
        // Setup exit animation for each root node
        const exitAnimationRef = setupExitAnimation({
          element: rootNode,
          immediate: options?.immediate,
        });
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
    // A kept-mounted view still has its root nodes, so being in the document is what counts.
    return !!this.viewRef && this.viewRef.rootNodes.some((node: Node) => node.isConnected);
  }

  /**
   * Cancel an in-progress detach operation.
   */
  cancelDetach(): void {
    if (this.isDestroying) {
      this.detachCancelled = true;
      for (const ref of this.exitAnimationRefs) {
        ref.cancel();
      }
      this.isDestroying = false;
    }
  }

  /**
   * End an in-progress detach now, skipping the rest of any exit animation.
   */
  override finishDetach(): void {
    if (this.isDestroying) {
      for (const ref of this.exitAnimationRefs) {
        ref.finish();
      }
    }
  }

  /**
   * Detach the portal from the DOM.
   * @param options Optional detach configuration
   */
  async detach({ immediate, keepMounted }: NgpPortalDetachOptions = {}): Promise<void> {
    if (this.isDestroying) {
      return;
    }

    this.isDestroying = true;
    this.detachCancelled = false;

    // Only wait for exit animations if not immediate
    if (!immediate) {
      await Promise.all(this.exitAnimationRefs.map(ref => ref.exit()));
    }

    // If cancelled during exit animation, don't destroy
    if (this.detachCancelled) {
      this.detachCancelled = false;
      return;
    }

    if (!keepMounted) {
      this.destroyView();
      return;
    }

    if (this.viewRef) {
      for (const node of this.viewRef.rootNodes) {
        node.parentNode?.removeChild(node);
      }
      // Reusable for a future detach() cycle once reattach() is called.
      this.isDestroying = false;
    }
  }

  /**
   * Re-insert a previously detached-but-kept-mounted embedded view's root nodes into a container.
   */
  reattach(container: HTMLElement, options?: NgpPortalAttachOptions): void {
    if (!this.viewRef) {
      throw new Error('Cannot reattach a template portal that has been destroyed.');
    }

    for (const node of this.viewRef.rootNodes) {
      clearAnimationState(node);
      container.appendChild(node);
    }

    this.exitAnimationRefs = this.viewRef.rootNodes
      .filter((node): node is HTMLElement => node instanceof HTMLElement)
      .map(element => setupExitAnimation({ element, immediate: options?.immediate }));
  }

  /**
   * Destroy the underlying view. Safe to call more than once.
   */
  destroyView(): void {
    if (this.viewRef) {
      this.viewRef.destroy();
      this.viewRef = null;
    }
  }
}

export function createPortal<T>(
  componentOrTemplate: Type<T> | TemplateRef<T>,
  viewContainerRef: ViewContainerRef | null,
  injector: Injector,
  context?: T,
): NgpPortal {
  if (componentOrTemplate instanceof TemplateRef) {
    if (!viewContainerRef) {
      throw new Error('A ViewContainerRef is required to create a TemplatePortal.');
    }

    return new NgpTemplatePortal(componentOrTemplate, viewContainerRef, injector, context);
  } else {
    return new NgpComponentPortal(componentOrTemplate, viewContainerRef, injector);
  }
}
