import { FocusOrigin } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { OverlayRef } from '@angular/cdk/overlay';
import { inject, Injector } from '@angular/core';
import { NgpExitAnimationManager } from 'ng-primitives/internal';
import { Observable, Subject, Subscription } from 'rxjs';
import { NgpDialogConfig } from '../config/dialog-config';

/**
 * Reference to a dialog opened via the Dialog service.
 */
export class NgpDialogRef<T = unknown, R = unknown> {
  /** Whether the user is allowed to close the dialog. */
  disableClose: boolean | undefined;

  /** Whether the escape key is allowed to close the dialog. */
  closeOnEscape: boolean | undefined;

  /** Emits when the dialog has been closed. */
  readonly closed = new Subject<{ focusOrigin?: FocusOrigin; result?: R }>();

  /** Emits when on keyboard events within the dialog. */
  readonly keydownEvents: Observable<KeyboardEvent>;

  /** Emits on pointer events that happen outside of the dialog. */
  readonly outsidePointerEvents: Observable<MouseEvent>;

  /** Data passed from the dialog opener. */
  readonly data?: T;

  /** Unique ID for the dialog. */
  readonly id: string;

  /** Subscription to external detachments of the dialog. */
  private detachSubscription: Subscription;

  /** @internal Store the injector */
  injector: Injector | undefined;

  /** Whether the dialog is closing. */
  private closing = false;

  constructor(
    readonly overlayRef: OverlayRef,
    readonly config: NgpDialogConfig<T>,
  ) {
    this.data = config.data;
    this.keydownEvents = overlayRef.keydownEvents();
    this.outsidePointerEvents = overlayRef.outsidePointerEvents();
    this.id = config.id!; // By the time the dialog is created we are guaranteed to have an ID.
    this.closeOnEscape = config.closeOnEscape ?? true;

    this.keydownEvents.subscribe(event => {
      if (
        event.key === 'Escape' &&
        !this.disableClose &&
        this.closeOnEscape !== false &&
        !hasModifierKey(event)
      ) {
        event.preventDefault();
        this.close(undefined, 'keyboard');
      }
    });

    this.detachSubscription = overlayRef.detachments().subscribe(() => this.close());
  }

  /**
   * Close the dialog.
   * @param result Optional result to return to the dialog opener.
   * @param options Additional options to customize the closing behavior.
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

    this.overlayRef.dispose();
    this.detachSubscription.unsubscribe();
    this.closed.next({ focusOrigin, result });
    this.closed.complete();
  }

  /** Updates the position of the dialog based on the current position strategy. */
  updatePosition(): this {
    this.overlayRef.updatePosition();
    return this;
  }
}

export function injectDialogRef<T = unknown, R = unknown>(): NgpDialogRef<T, R> {
  return inject<NgpDialogRef<T, R>>(NgpDialogRef);
}
