import { FocusMonitor } from '@angular/cdk/a11y';
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
import { BlockScrollStrategy, NgpOverlayRegistry, createPortal } from 'ng-primitives/portal';
import { uniqueId } from 'ng-primitives/utils';
import { Observable, Subject, Subscription, defer } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { NgpDialogConfig, injectDialogConfig } from '../config/dialog-config';
import { NgpDialogRef } from './dialog-ref';

/**
 * This is based on the Angular CDK Dialog service.
 * https://github.com/angular/components/blob/main/src/cdk/dialog/dialog.ts
 */

@Injectable({
  providedIn: 'root',
})
export class NgpDialogManager implements OnDestroy {
  private readonly applicationRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly document = inject<Document>(DOCUMENT);
  private readonly focusMonitor = inject(FocusMonitor);
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
  private scrollStrategy: BlockScrollStrategy | null = null;

  /** Keeps track of the currently-open dialogs. */
  get openDialogs(): readonly NgpDialogRef[] {
    return this.parentDialogManager
      ? this.parentDialogManager.openDialogs
      : this.openDialogsAtThisLevel;
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

    const dialogRef = new NgpDialogRef(config);
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

    // Attach the portal to the document body
    portal.attach(this.document.body);

    // Store the portal reference on the dialog ref for element access and cleanup
    dialogRef.portal = portal;

    // If this is the first dialog that we're opening, hide all the non-overlay content
    // and enable scroll blocking.
    if (!this.openDialogs.length) {
      this.hideNonDialogContentFromAssistiveTechnology(portal.getElements());
      this.enableScrollBlocking();
    }

    // Auto-detect parent overlay: if the trigger element lives inside an existing overlay
    // (e.g. a dialog opened from a popover), register as its child so that clicks inside
    // the dialog don't dismiss the parent overlay.
    const parentId =
      activeElement instanceof HTMLElement
        ? this.registry.findContainingOverlay(activeElement)
        : null;

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
    });

    (this.openDialogs as NgpDialogRef[]).push(dialogRef as NgpDialogRef<any, any>);
    this.afterOpened.next(dialogRef as NgpDialogRef<any, any>);
    this.subscribeToRouterEvents();

    dialogRef.closed.subscribe(closeResult => {
      // Deregister from the overlay registry
      this.registry.deregister(dialogRef.id);
      this.removeOpenDialog(dialogRef as NgpDialogRef<any, any>, true);
      // Focus the trigger element after the dialog closes.
      if (activeElement instanceof HTMLElement && this.document.body.contains(activeElement)) {
        // Its not great that we are relying on an internal API here, but we need to in order to
        // try and best determine the focus origin when it is programmatically closed by the user.
        this.focusMonitor.focusVia(
          activeElement,
          closeResult.focusOrigin ?? (this.focusMonitor as any)._lastFocusOrigin,
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
   * are closed when the user navigates programmatically (e.g. router.navigate()).
   * CDK's `disposeOnNavigation` only handles browser popstate events.
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

      // If all the dialogs were closed, remove/restore the `aria-hidden`
      // to a the siblings and emit to the `afterAllClosed` stream.
      if (!this.openDialogs.length) {
        this.ariaHiddenElements.forEach((previousValue, element) => {
          if (previousValue) {
            element.setAttribute('aria-hidden', previousValue);
          } else {
            element.removeAttribute('aria-hidden');
          }
        });

        this.ariaHiddenElements.clear();
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
  private enableScrollBlocking(): void {
    if (!this.scrollStrategy) {
      this.scrollStrategy = new BlockScrollStrategy(this.document);
    }
    this.scrollStrategy.enable();
  }

  /**
   * Disable scroll blocking when the last dialog closes.
   */
  private disableScrollBlocking(): void {
    this.scrollStrategy?.disable();
  }

  /**
   * Hides all of the content that isn't a dialog portal from assistive technology.
   * Dialog portals are rendered directly to document.body.
   */
  private hideNonDialogContentFromAssistiveTechnology(portalElements: HTMLElement[]) {
    const bodyChildren = this.document.body.children;

    for (let i = bodyChildren.length - 1; i > -1; i--) {
      const sibling = bodyChildren[i];

      if (
        !portalElements.includes(sibling as HTMLElement) &&
        sibling.nodeName !== 'SCRIPT' &&
        sibling.nodeName !== 'STYLE' &&
        !sibling.hasAttribute('aria-live')
      ) {
        this.ariaHiddenElements.set(sibling, sibling.getAttribute('aria-hidden'));
        sibling.setAttribute('aria-hidden', 'true');
      }
    }
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
