import { FocusOrigin } from '@angular/cdk/a11y';
import { inject, Injector } from '@angular/core';
import { NgpExitAnimationManager } from 'ng-primitives/internal';
import { NgpDismissGuard, NgpOverlayRef } from 'ng-primitives/portal';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
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

  /** Emits when the dialog has been closed. */
  readonly closed = new Subject<{ focusOrigin?: FocusOrigin; result?: R }>();

  /**
   * Observable that emits the dialog result when closed.
   * This is a convenience wrapper around `closed` that extracts only the result value.
   */
  readonly afterClosed: Observable<R | undefined> = this.closed.pipe(map(event => event.result));

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

  constructor(readonly config: NgpDialogConfig<T>) {
    this.data = config.data as T;
    this.id = config.id!; // By the time the dialog is created we are guaranteed to have an ID.
    this.closeOnEscape = config.closeOnEscape ?? true;
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
    if (this.disableClose || this.closing) {
      return;
    }

    this.closing = true;

    // Detach the portal immediately — no exit animation
    if (this.portal) {
      await this.portal.detach(true);
      this.portal = null;
    }

    this.closed.next({});
    this.closed.complete();
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

    this.closed.next({ focusOrigin, result });
    this.closed.complete();
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
