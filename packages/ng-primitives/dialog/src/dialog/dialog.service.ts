import { FocusMonitor } from '@angular/cdk/a11y';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  Injectable,
  Injector,
  OnDestroy,
  StaticProvider,
  TemplateRef,
  Type,
  ViewContainerRef,
  inject,
  isDevMode,
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NgpExitAnimationManager } from 'ng-primitives/internal';
import {
  BlockScrollStrategy,
  NgpOverlayRegistry,
  ScrollStrategy,
  createPortal,
} from 'ng-primitives/portal';
import { uniqueId } from 'ng-primitives/utils';
import { Observable, Subject, Subscription, defer } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { NgpDialogConfig, NgpDialogConfigToken, injectDialogConfig } from '../config/dialog-config';
import { NgpDialogRef } from './dialog-ref';

/**
 * Originally based on Angular CDK Dialog service.
 * Re-implemented to use ng-primitives/portal instead of @angular/cdk/overlay.
 */

@Injectable({
  providedIn: 'root',
})
export class NgpDialogManager implements OnDestroy {
  private readonly applicationRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly document = inject<Document>(DOCUMENT);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly viewportRuler = inject(ViewportRuler);
  private readonly registry = inject(NgpOverlayRegistry);
  private readonly defaultOptions = injectDialogConfig();
  private readonly parentDialogManager = inject(NgpDialogManager, {
    optional: true,
    skipSelf: true,
  });
  private readonly router = inject(Router, { optional: true });

  private openDialogsAtThisLevel: NgpDialogRef[] = [];
  private readonly afterAllClosedAtThisLevel = new Subject<void>();
  private readonly afterOpenedAtThisLevel = new Subject<NgpDialogRef>();
  private ariaHiddenElements = new Map<Element, string | null>();
  private routerSubscription: Subscription | undefined;

  /** Scroll blocking strategy — shared across all dialogs. */
  private scrollStrategy: ScrollStrategy | null = null;

  /** Keeps track of the currently-open dialogs. */
  get openDialogs(): readonly NgpDialogRef[] {
    return this.parentDialogManager
      ? this.parentDialogManager.openDialogs
      : this.openDialogsAtThisLevel;
  }

  /**
   * The `aria-hidden` bookkeeping, shared with the parent so nested managers don't overwrite each
   * other's saved values, they act on the same list of open dialogs.
   */
  private get hiddenElements(): Map<Element, string | null> {
    return this.parentDialogManager
      ? this.parentDialogManager.hiddenElements
      : this.ariaHiddenElements;
  }

  /** Stream that emits when a dialog has been opened. */
  get afterOpened(): Subject<NgpDialogRef> {
    return this.parentDialogManager
      ? this.parentDialogManager.afterOpened
      : this.afterOpenedAtThisLevel;
  }

  /**
   * Stream that emits when all open dialog have finished closing.
   * Will emit on subscribe if there are no open dialogs to begin with.
   */
  readonly afterAllClosed: Observable<void> = defer(() =>
    this.openDialogs.length
      ? this.getAfterAllClosed()
      : this.getAfterAllClosed().pipe(startWith(undefined)),
  );

  /**
   * Opens a modal dialog containing the given template or component.
   */
  open(
    templateRefOrComponentType: TemplateRef<NgpDialogContext> | Type<unknown>,
    config?: NgpDialogConfig,
  ): NgpDialogRef;

  /**
   * Opens a modal dialog containing the given template or component with typed data.
   */
  open<T, R = unknown>(
    templateRefOrComponentType: TemplateRef<NgpDialogContext<T, R>> | Type<unknown>,
    config: NgpDialogConfig<T> & { data: T },
  ): NgpDialogRef<T, R>;

  /**
   * Opens a modal dialog with typed result but no data (explicit void for data type).
   */
  open<T extends void, R>(
    templateRefOrComponentType: TemplateRef<NgpDialogContext<T, R>> | Type<unknown>,
    config?: NgpDialogConfig,
  ): NgpDialogRef<T, R>;

  open(
    templateRefOrComponentType: TemplateRef<any> | Type<unknown>,
    config?: NgpDialogConfig<any>,
  ): NgpDialogRef<any, any> {
    // store the current active element so we can focus it after the dialog is closed
    const activeElement = this.document.activeElement;

    // this is not ideal, but there is a case where a dialog trigger is within an overlay (e.g. menu),
    // which may be removed before the dialog is closed. This is not desired, so we need to access a view container ref
    // that is not within the overlay. To solve this we use the view container ref of the root component.
    // Could this have any unintended side effects? For example, the dialog would not be closed during route changes?
    const viewContainerRef =
      this.applicationRef.components[0]?.injector.get(ViewContainerRef) ??
      config?.viewContainerRef ??
      config?.injector?.get(ViewContainerRef);

    const defaults = this.defaultOptions;
    config = { ...defaults, viewContainerRef, ...config };
    config.id = config.id ?? uniqueId('ngp-dialog');

    if (config.id && this.getDialogById(config.id) && isDevMode()) {
      throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
    }

    const dialogRef = new NgpDialogRef(config, this.document);
    const injector = this.createInjector(config, dialogRef);

    // store the injector in the dialog ref - this is so we can access the exit animation manager
    dialogRef.injector = injector;

    const context: NgpDialogContext = {
      $implicit: dialogRef,
      close: dialogRef.close.bind(dialogRef),
    };

    // Create the portal using our portal system
    const portal = createPortal(
      templateRefOrComponentType,
      config.viewContainerRef!,
      injector,
      context,
    );

    portal.attach(this.resolveContainer(config.container));

    // Store the portal reference on the dialog ref for element access and cleanup
    dialogRef.portal = portal;

    // If this is the first dialog that we're opening, enable scroll blocking.
    if (!this.openDialogs.length) {
      this.enableScrollBlocking(config);
    }

    // Auto-detect parent overlay: if the trigger element lives inside an existing overlay
    // (e.g. a dialog opened from a popover), register as its child so that clicks inside
    // the dialog don't dismiss the parent overlay.
    // Only inherit parentId from other dialogs — non-dialog overlays (menus, popovers)
    // may close after triggering the dialog open, which would cascade-close the dialog.
    let parentId =
      activeElement instanceof HTMLElement
        ? this.registry.findContainingOverlay(activeElement)
        : null;

    if (parentId !== null && !this.openDialogs.some(d => d.id === parentId)) {
      parentId = null;
    }

    // Register with the overlay registry for centralized escape-key routing.
    // outsidePress is false because the NgpDialogOverlay directive handles its own backdrop clicks.
    this.registry.register({
      id: dialogRef.id,
      parentId,
      overlay: dialogRef,
      getElements: () => dialogRef.getElements(),
      triggerElement: (activeElement as HTMLElement) ?? this.document.body,
      dismissPolicy: {
        outsidePress: false,
        escapeKey: config.closeOnEscape ?? true,
      },
      outsidePointerEvents$: dialogRef.outsidePointerEvents$,
    });

    (this.openDialogs as NgpDialogRef[]).push(dialogRef as NgpDialogRef<any, any>);
    this.refreshAssistiveTechnologyHiding();
    this.afterOpened.next(dialogRef as NgpDialogRef<any, any>);
    this.subscribeToRouterEvents();

    dialogRef.closed.subscribe(() => {
      // Deregister from the overlay registry immediately so stacking order is updated.
      this.registry.deregister(dialogRef.id);
      this.removeOpenDialog(dialogRef as NgpDialogRef<any, any>, true);
    });

    dialogRef.afterClosed$.subscribe(({ focusOrigin }) => {
      // Focus the trigger element after exit animations complete.
      if (activeElement instanceof HTMLElement && this.document.body.contains(activeElement)) {
        // Its not great that we are relying on an internal API here, but we need to in order to
        // try and best determine the focus origin when it is programmatically closed by the user.
        this.focusMonitor.focusVia(
          activeElement,
          focusOrigin ?? (this.focusMonitor as any)._lastFocusOrigin,
        );
      }
    });

    return dialogRef;
  }

  /**
   * Closes all of the currently-open dialogs.
   */
  closeAll(): void {
    reverseForEach(this.openDialogs, dialog => dialog.close());
  }

  /**
   * Finds an open dialog by its id.
   * @param id ID to use when looking up the dialog.
   */
  getDialogById(id: string): NgpDialogRef | undefined {
    return this.openDialogs.find(dialog => dialog.id === id);
  }

  /**
   * Subscribe to router navigation events so that dialogs with `closeOnNavigation`
   * are closed when the user navigates. This handles both browser popstate events
   * and programmatic route changes (e.g. router.navigate()).
   */
  private subscribeToRouterEvents(): void {
    if (this.routerSubscription || !this.router) {
      return;
    }

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart && this.openDialogs.length) {
        // Close dialogs that have closeOnNavigation enabled (iterate in reverse as closing modifies the array)
        let i = this.openDialogs.length;
        while (i--) {
          const dialog = this.openDialogs[i];
          if (dialog.config.closeOnNavigation !== false) {
            dialog.close();
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Make one pass over all the dialogs that need to be untracked, but should not be closed. We
    // want to stop tracking the open dialog even if it hasn't been closed, because the tracking
    // determines when `aria-hidden` is removed from elements outside the dialog.
    reverseForEach(this.openDialogsAtThisLevel, dialog => {
      // Check for `false` specifically since we want `undefined` to be interpreted as `true`.
      this.removeOpenDialog(dialog, false);
    });

    // Make a second pass and close the remaining dialogs. We do this second pass in order to
    // correctly dispatch the `afterAllClosed` event in case we have a mixed array of dialogs
    // that should be closed and dialogs that should not.
    reverseForEach(this.openDialogsAtThisLevel, dialog => dialog.close());

    this.afterAllClosedAtThisLevel.complete();
    this.afterOpenedAtThisLevel.complete();
    this.openDialogsAtThisLevel = [];
    this.routerSubscription?.unsubscribe();
  }

  /**
   * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
   * of a dialog to close itself and, optionally, to return a value.
   */
  private createInjector<T, R>(
    config: NgpDialogConfig<T>,
    dialogRef: NgpDialogRef<T, R>,
  ): Injector {
    const userInjector = config.injector || config.viewContainerRef?.injector;
    const providers: StaticProvider[] = [
      { provide: NgpDialogRef, useValue: dialogRef },
      // expose the merged per-dialog config so NgpDialog honours role/modal/closeOn*
      // passed to open(), not just the global config
      { provide: NgpDialogConfigToken, useValue: config },
      { provide: NgpExitAnimationManager, useClass: NgpExitAnimationManager },
    ];

    // Fall back to the service's own injector (root injector) to ensure
    // ApplicationRef and other platform providers are available.
    return Injector.create({ parent: userInjector || this.injector, providers });
  }

  /**
   * Removes a dialog from the array of open dialogs.
   */
  private removeOpenDialog(dialogRef: NgpDialogRef, emitEvent: boolean) {
    const index = this.openDialogs.indexOf(dialogRef);

    if (index > -1) {
      (this.openDialogs as NgpDialogRef[]).splice(index, 1);

      // Recompute for the dialogs that remain — this restores the `aria-hidden` of the siblings
      // when the last one closes.
      this.refreshAssistiveTechnologyHiding();

      // If all the dialogs were closed, release the scroll block and emit to the
      // `afterAllClosed` stream.
      if (!this.openDialogs.length) {
        this.disableScrollBlocking();

        if (emitEvent) {
          this.getAfterAllClosed().next();
        }
      }
    }
  }

  /**
   * Enable scroll blocking when the first dialog opens.
   */
  private enableScrollBlocking(config?: NgpDialogConfig): void {
    if (!this.scrollStrategy) {
      this.scrollStrategy =
        config?.scrollStrategy ?? new BlockScrollStrategy(this.viewportRuler, this.document);
    }
    this.scrollStrategy.enable();
  }

  /**
   * Disable scroll blocking when the last dialog closes.
   */
  private disableScrollBlocking(): void {
    this.scrollStrategy?.disable();
    this.scrollStrategy = null;
  }

  /**
   * Resolve the container element the dialog should be rendered into.
   */
  private resolveContainer(container: NgpDialogConfig['container']): HTMLElement {
    if (!container) {
      return this.document.body;
    }

    if (typeof container === 'string') {
      const element = this.document.querySelector<HTMLElement>(container);

      if (!element) {
        console.warn(
          `NgPrimitives: Container element with selector "${container}" not found. Falling back to document.body.`,
        );
        return this.document.body;
      }

      return element;
    }

    return container;
  }

  /**
   * Recompute what is hidden from assistive technology for the currently open dialogs.
   *
   * Runs on every open and close rather than for the first dialog only: dialogs can render into
   * different containers, so a container hidden on behalf of one dialog may be the very container
   * the next one opens into.
   */
  private refreshAssistiveTechnologyHiding(): void {
    this.restoreAssistiveTechnologyHiding();

    const portalElements = this.openDialogs.flatMap(dialog => dialog.getElements());

    if (portalElements.length) {
      this.hideNonDialogContentFromAssistiveTechnology(portalElements);
    }
  }

  /**
   * Restore the `aria-hidden` values this manager overwrote.
   */
  private restoreAssistiveTechnologyHiding(): void {
    const hiddenElements = this.hiddenElements;

    hiddenElements.forEach((previousValue, element) => {
      if (previousValue) {
        element.setAttribute('aria-hidden', previousValue);
      } else {
        element.removeAttribute('aria-hidden');
      }
    });

    hiddenElements.clear();
  }

  /**
   * Hides all of the content that isn't a dialog portal from assistive technology.
   */
  private hideNonDialogContentFromAssistiveTechnology(portalElements: HTMLElement[]) {
    const body = this.document.body;

    // Collect every element on a path from the body down to a portal element. Hiding only the body
    // children would hide the dialog itself when it renders into a nested container, and the paths
    // must all be known up front — with two dialogs in different containers, one dialog's ancestors
    // are the other's siblings.
    const dialogPaths = new Set<Element>();

    for (const portalElement of portalElements) {
      // A portal's root nodes can include comments (an `<ng-container>` root), so anchor the walk
      // on the nearest element.
      let current: Element | null =
        portalElement instanceof Element ? portalElement : (portalElement as Node).parentElement;

      while (current && current !== body) {
        dialogPaths.add(current);
        current = current.parentElement;
      }
    }

    // Hide everything sitting beside those paths.
    for (const element of dialogPaths) {
      const parent = element.parentElement;

      if (!parent) {
        continue;
      }

      for (const sibling of Array.from(parent.children)) {
        if (!dialogPaths.has(sibling)) {
          this.hideFromAssistiveTechnology(sibling);
        }
      }
    }
  }

  /**
   * Hide a single element from assistive technology, remembering its previous value.
   */
  private hideFromAssistiveTechnology(element: Element): void {
    if (
      this.hiddenElements.has(element) ||
      element.nodeName === 'SCRIPT' ||
      element.nodeName === 'STYLE' ||
      element.hasAttribute('aria-live')
    ) {
      return;
    }

    this.hiddenElements.set(element, element.getAttribute('aria-hidden'));
    element.setAttribute('aria-hidden', 'true');
  }

  private getAfterAllClosed(): Subject<void> {
    const parent = this.parentDialogManager;
    return parent ? parent.getAfterAllClosed() : this.afterAllClosedAtThisLevel;
  }
}

/**
 * Executes a callback against all elements in an array while iterating in reverse.
 * Useful if the array is being modified as it is being iterated.
 */
function reverseForEach<T>(items: T[] | readonly T[], callback: (current: T) => void) {
  let i = items.length;

  while (i--) {
    callback(items[i]);
  }
}

export interface NgpDialogContext<T = unknown, R = unknown> {
  $implicit: NgpDialogRef<T, R>;
  close: (result?: R) => void;
}

export function injectDialogManager(): NgpDialogManager {
  return inject(NgpDialogManager);
}
