import { FocusMonitor } from '@angular/cdk/a11y';
import { Overlay, OverlayConfig, OverlayContainer, ScrollStrategy } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import {
  ApplicationRef,
  DOCUMENT,
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
import { NgpExitAnimationManager } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { Observable, Subject, defer } from 'rxjs';
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
  private readonly document = inject<Document>(DOCUMENT);
  private readonly overlay = inject(Overlay);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly defaultOptions = injectDialogConfig();
  private readonly parentDialogManager = inject(NgpDialogManager, {
    optional: true,
    skipSelf: true,
  });
  private readonly overlayContainer = inject(OverlayContainer);
  private readonly scrollStrategy: ScrollStrategy =
    this.defaultOptions.scrollStrategy ?? this.overlay.scrollStrategies.block();

  private openDialogsAtThisLevel: NgpDialogRef[] = [];
  private readonly afterAllClosedAtThisLevel = new Subject<void>();
  private readonly afterOpenedAtThisLevel = new Subject<NgpDialogRef>();
  private ariaHiddenElements = new Map<Element, string | null>();

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
   * Opens a modal dialog containing the given template.
   */
  open<T, R>(
    templateRefOrComponentType: TemplateRef<NgpDialogContext<T, R>> | Type<unknown>,
    config?: NgpDialogConfig<T>,
  ): NgpDialogRef<T, R> {
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

    const overlayConfig = this.getOverlayConfig(config);
    const overlayRef = this.overlay.create(overlayConfig);
    const dialogRef = new NgpDialogRef<T, R>(overlayRef, config);
    const injector = this.createInjector(config, dialogRef, undefined);

    // store the injector in the dialog ref - this is so we can access the exit animation manager
    dialogRef.injector = injector;

    const context: NgpDialogContext<T, R> = {
      $implicit: dialogRef,
      close: dialogRef.close.bind(dialogRef),
    };

    if (templateRefOrComponentType instanceof TemplateRef) {
      overlayRef.attach(
        new TemplatePortal(templateRefOrComponentType, config.viewContainerRef!, context, injector),
      );
    } else {
      overlayRef.attach(
        new ComponentPortal(templateRefOrComponentType, config.viewContainerRef!, injector),
      );
    }

    // If this is the first dialog that we're opening, hide all the non-overlay content.
    if (!this.openDialogs.length) {
      this.hideNonDialogContentFromAssistiveTechnology();
    }

    (this.openDialogs as NgpDialogRef[]).push(dialogRef as NgpDialogRef<any, any>);
    this.afterOpened.next(dialogRef as NgpDialogRef<any, any>);

    dialogRef.closed.subscribe(closeResult => {
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
  }

  /**
   * Creates an overlay config from a dialog config.
   */
  private getOverlayConfig(config: NgpDialogConfig): OverlayConfig {
    const state = new OverlayConfig({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: config.scrollStrategy || this.scrollStrategy,
      hasBackdrop: false,
      disposeOnNavigation: config.closeOnNavigation,
      // required for v21 - the CDK launches overlays using the popover api which means any other overlays
      // such as select dropdowns, or tooltips will appear behind the dialog, regardless of z-index
      // this disables the use of popovers
      usePopover: false,
    } as any);

    return state;
  }

  /**
   * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
   * of a dialog to close itself and, optionally, to return a value.
   */
  private createInjector<T, R>(
    config: NgpDialogConfig<T>,
    dialogRef: NgpDialogRef<T, R>,
    fallbackInjector: Injector | undefined,
  ): Injector {
    const userInjector = config.injector || config.viewContainerRef?.injector;
    const providers: StaticProvider[] = [
      { provide: NgpDialogRef, useValue: dialogRef },
      { provide: NgpExitAnimationManager, useClass: NgpExitAnimationManager },
    ];

    return Injector.create({ parent: userInjector || fallbackInjector, providers });
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

        if (emitEvent) {
          this.getAfterAllClosed().next();
        }
      }
    }
  }

  /** Hides all of the content that isn't an overlay from assistive technology. */
  private hideNonDialogContentFromAssistiveTechnology() {
    const overlayContainer = this.overlayContainer.getContainerElement();

    // Ensure that the overlay container is attached to the DOM.
    if (overlayContainer.parentElement) {
      const siblings = overlayContainer.parentElement.children;

      for (let i = siblings.length - 1; i > -1; i--) {
        const sibling = siblings[i];

        if (
          sibling !== overlayContainer &&
          sibling.nodeName !== 'SCRIPT' &&
          sibling.nodeName !== 'STYLE' &&
          !sibling.hasAttribute('aria-live')
        ) {
          this.ariaHiddenElements.set(sibling, sibling.getAttribute('aria-hidden'));
          sibling.setAttribute('aria-hidden', 'true');
        }
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
