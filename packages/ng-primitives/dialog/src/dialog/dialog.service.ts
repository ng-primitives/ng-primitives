/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Overlay, OverlayConfig, OverlayContainer, ScrollStrategy } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import {
  Injectable,
  Injector,
  OnDestroy,
  StaticProvider,
  TemplateRef,
  inject,
  isDevMode,
} from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { Observable, Subject, defer } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { NgpDialogConfig, injectDialogConfig } from '../config/dialog.config';
import { NgpDialogRef } from './dialog-ref';

/**
 * This is based on the Angular CDK Dialog service.
 * https://github.com/angular/components/blob/main/src/cdk/dialog/dialog.ts
 */

@Injectable({
  providedIn: 'root',
})
export class NgpDialogManager implements OnDestroy {
  private readonly overlay = inject(Overlay);
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
  open(
    templateRefOrComponentType: TemplateRef<NgpDialogContext> | ComponentType<any>,
    config?: NgpDialogConfig,
  ): NgpDialogRef {
    const defaults = this.defaultOptions;
    config = { ...defaults, ...config };
    config.id = config.id ?? uniqueId('ngp-dialog');

    if (config.id && this.getDialogById(config.id) && isDevMode()) {
      throw Error(`Dialog with id "${config.id}" exists already. The dialog id must be unique.`);
    }

    const overlayConfig = this.getOverlayConfig(config);
    const overlayRef = this.overlay.create(overlayConfig);
    const dialogRef = new NgpDialogRef(overlayRef, config);
    const injector = this.createInjector(config, dialogRef, undefined);
    const context: NgpDialogContext = {
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

    (this.openDialogs as NgpDialogRef[]).push(dialogRef);
    dialogRef.closed.subscribe(() => this.removeOpenDialog(dialogRef, true));
    this.afterOpened.next(dialogRef);

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
    });

    return state;
  }

  /**
   * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
   * of a dialog to close itself and, optionally, to return a value.
   */
  private createInjector(
    config: NgpDialogConfig,
    dialogRef: NgpDialogRef,
    fallbackInjector: Injector | undefined,
  ): Injector {
    const userInjector = config.injector || config.viewContainerRef?.injector;
    const providers: StaticProvider[] = [{ provide: NgpDialogRef, useValue: dialogRef }];

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

export interface NgpDialogContext {
  $implicit: NgpDialogRef;
  close: () => void;
}

export function injectDialogManager(): NgpDialogManager {
  return inject(NgpDialogManager);
}
