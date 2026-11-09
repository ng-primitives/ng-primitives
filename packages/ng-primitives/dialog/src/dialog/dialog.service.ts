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
import { NgpExitAnimationManager, NgpFocusRestoration } from 'ng-primitives/internal';
import {
  BlockScrollStrategy,
  NgpHidingLayer,
  NgpOutsideHiding,
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
  private readonly focusRestoration = inject(NgpFocusRestoration);
  private readonly viewportRuler = inject(ViewportRuler);
  private readonly registry = inject(NgpOverlayRegistry);
  private readonly outsideHiding = inject(NgpOutsideHiding);
  private readonly defaultOptions = injectDialogConfig();
  private readonly parentDialogManager = inject(NgpDialogManager, {
    optional: true,
    skipSelf: true,
  });
  private readonly router = inject(Router, { optional: true });

  private openDialogsAtThisLevel: NgpDialogRef[] = [];
  private readonly afterAllClosedAtThisLevel = new Subject<void>();
  private readonly afterOpenedAtThisLevel = new Subject<NgpDialogRef>();
  private readonly hidingLayerAtThisLevel: NgpHidingLayer = {
    attribute: 'aria-hidden',
    // A closing dialog keeps focus until it detaches, so it stays exposed alongside the open ones.
    getElements: () =>
      [...this.exposedOpenDialogs(), ...this.closingDialogs].flatMap(dialog =>
        dialog.getElements(),
      ),
  };
  private readonly closingDialogsAtThisLevel = new Set<NgpDialogRef>();
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
   * One hiding layer for all the open dialogs, shared with the parent since nested managers act on
   * the same list of open dialogs.
   */
  private get hidingLayer(): NgpHidingLayer {
    return this.parentDialogManager
      ? this.parentDialogManager.hidingLayer
      : this.hidingLayerAtThisLevel;
  }

  /**
   * Dialogs that were exposed when they closed and are still in the DOM, running their exit
   * animation.
   */
  private get closingDialogs(): Set<NgpDialogRef> {
    return this.parentDialogManager
      ? this.parentDialogManager.closingDialogs
      : this.closingDialogsAtThisLevel;
  }

  /** Stacked modal dialogs all stay exposed, a non-modal one only above the top modal dialog. */
  private exposedOpenDialogs(): NgpDialogRef[] {
    let topModalIndex = -1;
    this.openDialogs.forEach((dialog, index) => {
      if (isModal(dialog.config)) {
        topModalIndex = index;
      }
    });
    return this.openDialogs.filter(
      (dialog, index) => isModal(dialog.config) || index > topModalIndex,
    );
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

    // A spread `undefined` would override the global container; `null` still means the body.
    if (config.container === undefined) {
      config.container = defaults.container;
    }

    if (config.modal === undefined) {
      config.modal = defaults.modal;
    }

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

    // If this is the first modal dialog that we're opening, enable scroll blocking.
    if (isModal(config) && !this.hasModalDialog()) {
      this.enableScrollBlocking(config);
    }

    // A programmatic open() has no trigger and falls back to whatever held focus.
    const originElement =
      config.triggerElement ?? (activeElement instanceof HTMLElement ? activeElement : null);

    // Register under the overlay the dialog was opened from, so clicks inside it don't read
    // as an outside press on that parent. `cascadeClose: false` below stops the inverse: a
    // menu that closes on select must not take the dialog with it.
    const parentId = originElement ? this.registry.findContainingOverlay(originElement) : null;

    // Register with the overlay registry for centralized escape-key routing.
    // outsidePress is false because the NgpDialogOverlay directive handles its own backdrop clicks.
    this.registry.register({
      id: dialogRef.id,
      parentId,
      cascadeClose: false,
      overlay: dialogRef,
      getElements: () => dialogRef.getElements(),
      triggerElement: originElement ?? this.document.body,
      dismissPolicy: {
        outsidePress: false,
        escapeKey: config.closeOnEscape ?? true,
      },
      // A non-modal dialog leaves the page usable, so an Escape pressed on the page is not for it.
      escapeKeyInsideOnly: !isModal(config),
      outsidePointerEvents$: dialogRef.outsidePointerEvents$,
    });

    (this.openDialogs as NgpDialogRef[]).push(dialogRef as NgpDialogRef<any, any>);
    this.refreshAssistiveTechnologyHiding();
    this.afterOpened.next(dialogRef as NgpDialogRef<any, any>);
    this.subscribeToRouterEvents();

    // Beside a non-modal dialog the page stays usable: focus the user moved there stays put.
    let restoreFocus = true;

    dialogRef.closed.subscribe(() => {
      restoreFocus = isModal(config) || this.isFocusInDialog(dialogRef);
      // Deregister from the overlay registry immediately so stacking order is updated.
      this.registry.deregister(dialogRef.id);
      if (this.exposedOpenDialogs().includes(dialogRef as NgpDialogRef)) {
        this.closingDialogs.add(dialogRef);
        // A modal overlay below must not make the dialog `inert` while it still holds focus.
        this.outsideHiding.keepExposed(dialogRef);
      }
      this.removeOpenDialog(dialogRef as NgpDialogRef<any, any>);
    });

    dialogRef.afterClosed$.subscribe(({ focusOrigin }) => {
      // Recompute only now: until its exit animation ends the closing dialog is still in the DOM
      // and holds focus, and hiding it would put focus inside an `aria-hidden` subtree.
      this.closingDialogs.delete(dialogRef);
      this.outsideHiding.releaseExposed(dialogRef);
      this.refreshAssistiveTechnologyHiding();

      // Focus the trigger element after exit animations complete.
      if (restoreFocus && originElement && this.document.body.contains(originElement)) {
        // Its not great that we are relying on an internal API here, but we need to in order to
        // try and best determine the focus origin when it is programmatically closed by the user.
        this.focusRestoration.restore(originElement, () =>
          this.focusMonitor.focusVia(
            originElement,
            focusOrigin ?? (this.focusMonitor as any)._lastFocusOrigin,
          ),
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
      // expose the merged per-dialog config so NgpDialog honours role/closeOn* passed to open(),
      // not just the global config. `modal` belongs to this dialog only: a trigger inside it
      // starts from the configuration where this dialog was opened.
      {
        provide: NgpDialogConfigToken,
        useValue: {
          ...config,
          modal: (userInjector?.get(NgpDialogConfigToken, null) ?? this.defaultOptions).modal,
        },
      },
      { provide: NgpExitAnimationManager, useClass: NgpExitAnimationManager },
    ];

    // Fall back to the service's own injector (root injector) to ensure
    // ApplicationRef and other platform providers are available.
    return Injector.create({ parent: userInjector || this.injector, providers });
  }

  /**
   * Removes a dialog from the array of open dialogs.
   */
  private removeOpenDialog(dialogRef: NgpDialogRef) {
    const index = this.openDialogs.indexOf(dialogRef);

    if (index > -1) {
      (this.openDialogs as NgpDialogRef[]).splice(index, 1);

      // If all the modal dialogs were closed, restore the `aria-hidden` of the siblings and
      // release the scroll block. Otherwise the hidden set is recomputed once the dialog has left
      // the DOM.
      if (!this.hasModalDialog()) {
        this.outsideHiding.remove(this.hidingLayer);
        this.disableScrollBlocking();
      }

      if (!this.openDialogs.length) {
        this.getAfterAllClosed().next();
      }
    }
  }

  /**
   * Enable scroll blocking when the first dialog opens.
   */
  private enableScrollBlocking(config?: NgpDialogConfig): void {
    // Nested managers share the open dialogs, so the root one owns the scroll block.
    if (this.parentDialogManager) {
      this.parentDialogManager.enableScrollBlocking(config);
      return;
    }

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
    if (this.parentDialogManager) {
      this.parentDialogManager.disableScrollBlocking();
      return;
    }

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
   */
  private refreshAssistiveTechnologyHiding(): void {
    if (this.hasModalDialog()) {
      this.outsideHiding.update(this.hidingLayer);
    } else {
      this.outsideHiding.remove(this.hidingLayer);
      // A non-modal dialog opened from inside a hiding layer must not stay hidden.
      this.outsideHiding.refresh();
    }
  }

  /** Whether focus is in the dialog, or in an overlay opened from it that closes along with it. */
  private isFocusInDialog(dialogRef: NgpDialogRef): boolean {
    const elements = [...dialogRef.getElements()];

    // Entries are in open order, so a submenu's parent is collected before the submenu. A nested
    // dialog does not close with this one, so focus in it stays where it is.
    for (const entry of this.registry.getEntries()) {
      if (
        entry.cascadeClose !== false &&
        elements.some(element => element.contains(entry.triggerElement))
      ) {
        elements.push(...entry.getElements());
      }
    }

    const focused = this.document.activeElement;
    return elements.some(element => element.contains(focused));
  }

  private hasModalDialog(): boolean {
    return this.openDialogs.some(dialog => isModal(dialog.config));
  }

  private getAfterAllClosed(): Subject<void> {
    const parent = this.parentDialogManager;
    return parent ? parent.getAfterAllClosed() : this.afterAllClosedAtThisLevel;
  }
}

function isModal(config: NgpDialogConfig): boolean {
  return config.modal !== false;
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
