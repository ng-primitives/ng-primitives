import { FocusOrigin } from '@angular/cdk/a11y';
import { inject, Injector } from '@angular/core';
import { NgpExitAnimationManager } from 'ng-primitives/internal';
import { NgpDismissGuard, NgpOverlayRef } from 'ng-primitives/portal';
import { defer, EMPTY, fromEvent, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { NgpDialogConfig } from '../config/dialog-config';

/** Minimal portal interface needed by the dialog ref. */
export interface NgpDialogPortalRef {
  getElements(): HTMLElement[];
  detach(immediate?: boolean): Promise<void>;
}

/**
 * Reference to a dialog opened via the Dialog service.
 */
export class NgpDialogRef<T = unknown, R = unknown> implements NgpOverlayRef {
  /** Whether the user is allowed to close the dialog. */
  disableClose: boolean | undefined;

  /** Whether the escape key is allowed to close the dialog, or a guard function. */
  closeOnEscape: NgpDismissGuard<KeyboardEvent> | undefined;

  /** Whether clicking outside (on the overlay) is allowed to close the dialog, or a guard function. */
  closeOnOutsideClick: NgpDismissGuard<Element> | undefined;

  /** Emits when the dialog has been closed. */
  readonly closed = new Subject<{ focusOrigin?: FocusOrigin; result?: R }>();

  /** @internal */
  readonly afterClosed$ = new Subject<{ focusOrigin?: FocusOrigin; result?: R }>();

  /**
   * Observable that emits the dialog result after exit animations have completed.
   */
  readonly afterClosed: Observable<R | undefined> = this.afterClosed$.pipe(
    map(event => event.result),
  );

  /** Data passed from the dialog opener. */
  readonly data: T;

  /** Unique ID for the dialog. */
  readonly id: string;

  /** @internal Store the injector */
  injector: Injector | undefined;

  /** Whether the dialog is closing. */
  private closing = false;

  /** @internal Portal reference for element access and detach. */
  portal: NgpDialogPortalRef | null = null;

  /** Emits on keyboard events within the dialog. */
  readonly keydownEvents: Observable<KeyboardEvent>;

  /**
   * Emits pointer events (click, auxclick, contextmenu) that happen outside of the dialog.
   * Fed by the NgpOverlayRegistry with CDK-compatible stacking awareness.
   * @internal
   */
  readonly outsidePointerEvents$ = new Subject<MouseEvent>();

  /** Emits on pointer events that happen outside of the dialog. */
  readonly outsidePointerEvents: Observable<MouseEvent> = this.outsidePointerEvents$.asObservable();

  constructor(
    readonly config: NgpDialogConfig<T>,
    private readonly document: Document,
  ) {
    this.data = config.data as T;
    this.id = config.id!; // By the time the dialog is created we are guaranteed to have an ID.
    this.closeOnEscape = config.closeOnEscape ?? true;
    this.closeOnOutsideClick = config.closeOnOutsideClick;

    // Use defer() so the observable is created on subscribe — by then the portal will be set.
    this.keydownEvents = defer(() => {
      const elements = this.getElements();
      if (!elements.length) return EMPTY;
      return fromEvent<KeyboardEvent>(this.document, 'keydown').pipe(
        filter(event => elements.some(el => el.contains(event.target as Node))),
        takeUntil(this.closed),
      );
    });
  }

  /**
   * Updates the position of the dialog. No-op since dialogs are CSS-centered.
   */
  updatePosition(): this {
    return this;
  }

  /**
   * NgpOverlayRef implementation — called by the registry for escape-key dismiss.
   */
  hide(options?: { immediate?: boolean; origin?: FocusOrigin }): void {
    if (this.disableClose) {
      return;
    }
    this.close(undefined, options?.origin);
  }

  /**
   * NgpOverlayRef implementation — called by the registry for descendant cascade.
   * Skips exit animations and tears down immediately.
   */
  async hideImmediate(): Promise<void> {
    if (this.closing) {
      return;
    }

    this.closing = true;

    this.closed.next({});
    this.closed.complete();

    // Detach the portal immediately — no exit animation
    if (this.portal) {
      await this.portal.detach(true);
      this.portal = null;
    }

    this.afterClosed$.next({});
    this.afterClosed$.complete();
  }

  /**
   * Close the dialog.
   * @param result Optional result to return to the dialog opener.
   * @param focusOrigin The origin of the focus event that triggered the close.
   */
  async close(result?: R, focusOrigin?: FocusOrigin): Promise<void> {
    // If the dialog is already closed, do nothing.
    if (this.closing) {
      return;
    }

    this.closing = true;

    // Emit immediately so consumers can react before exit animations run.
    this.closed.next({ focusOrigin, result });
    this.closed.complete();

    const exitAnimationManager = this.injector?.get(NgpExitAnimationManager, undefined, {
      optional: true,
    });
    if (exitAnimationManager) {
      await exitAnimationManager.exit();
    }

    // Detach the portal (immediate since exit animation already ran)
    if (this.portal) {
      await this.portal.detach(true);
      this.portal = null;
    }

    this.afterClosed$.next({ focusOrigin, result });
    this.afterClosed$.complete();
  }

  /**
   * @deprecated Access dialog methods directly instead (keydownEvents, outsidePointerEvents,
   * updatePosition, close). This shim will be removed in the next major version.
   */
  get overlayRef(): {
    keydownEvents: () => Observable<KeyboardEvent>;
    outsidePointerEvents: () => Observable<MouseEvent>;
    updatePosition: () => NgpDialogRef<T, R>;
    dispose: () => Promise<void>;
    detachments: () => Observable<{ focusOrigin?: FocusOrigin; result?: R }>;
    overlayElement: HTMLElement | undefined;
  } {
    return {
      keydownEvents: () => this.keydownEvents,
      outsidePointerEvents: () => this.outsidePointerEvents,
      updatePosition: () => this.updatePosition(),
      dispose: () => this.close(),
      detachments: () => this.closed.asObservable(),
      overlayElement: this.getElements()[0] as HTMLElement | undefined,
    };
  }

  /**
   * Get the portal elements.
   * @internal
   */
  getElements(): HTMLElement[] {
    return this.portal?.getElements() ?? [];
  }
}

export function injectDialogRef<T = unknown, R = unknown>(): NgpDialogRef<T, R> {
  return inject<NgpDialogRef<T, R>>(NgpDialogRef);
}
