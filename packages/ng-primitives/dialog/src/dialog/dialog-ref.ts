/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusOrigin } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { OverlayRef } from '@angular/cdk/overlay';
import { inject } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { NgpDialogConfig } from '../config/dialog.config';

/**
 * Reference to a dialog opened via the Dialog service.
 */
export class NgpDialogRef<T = any> {
  /** Whether the user is allowed to close the dialog. */
  disableClose: boolean | undefined;

  /** Emits when the dialog has been closed. */
  readonly closed = new Subject<FocusOrigin | null>();

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

  constructor(
    readonly overlayRef: OverlayRef,
    readonly config: NgpDialogConfig<T>,
  ) {
    this.data = config.data;
    this.keydownEvents = overlayRef.keydownEvents();
    this.outsidePointerEvents = overlayRef.outsidePointerEvents();
    this.id = config.id!; // By the time the dialog is created we are guaranteed to have an ID.

    this.keydownEvents.subscribe(event => {
      if (event.key === 'Escape' && !this.disableClose && !hasModifierKey(event)) {
        event.preventDefault();
        this.close('keyboard');
      }
    });

    this.detachSubscription = overlayRef.detachments().subscribe(() => this.close());
  }

  /**
   * Close the dialog.
   * @param result Optional result to return to the dialog opener.
   * @param options Additional options to customize the closing behavior.
   */
  close(focusOrigin?: FocusOrigin): void {
    this.overlayRef.dispose();
    this.detachSubscription.unsubscribe();
    this.closed.next(focusOrigin ?? null);
    this.closed.complete();
  }

  /** Updates the position of the dialog based on the current position strategy. */
  updatePosition(): this {
    this.overlayRef.updatePosition();
    return this;
  }
}

export function injectDialogRef<T>(): NgpDialogRef<T> {
  return inject(NgpDialogRef<T>);
}
