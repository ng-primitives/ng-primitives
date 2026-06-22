import { ElementRef, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpDismissGuard } from 'ng-primitives/portal';
import { createPrimitive, listener } from 'ng-primitives/state';
import { injectDialogRef } from '../dialog/dialog-ref';

export interface NgpDialogOverlayState {
  /** Access component's reference. */
  readonly elementRef: ElementRef;
  /**
   * Whether the dialog should close on backdrop click.
   * @default `true`
   */
  readonly closeOnClick: Signal<NgpDismissGuard<Element> | undefined>;
}

export interface NgpDialogOverlayProps {
  /**
   * Whether the dialog should close on backdrop click.
   * @default `true`
   */
  readonly closeOnClick?: Signal<NgpDismissGuard<Element> | undefined>;
}

export const [
  NgpDialogOverlayStateToken,
  ngpDialogOverlay,
  injectDialogOverlayState,
  provideDialogOverlayState,
] = createPrimitive(
  'NgpDialogOverlay',
  ({
    closeOnClick = signal<NgpDismissGuard<Element> | undefined>(true),
  }: NgpDialogOverlayProps) => {
    const elementRef = injectElementRef();
    const dialogRef = injectDialogRef();

    const startedPointerDownOnOverlay = signal(false);

    // Listener
    listener(elementRef, 'pointerdown', handleOnPointerDown);
    listener(elementRef, 'pointercancel', handleOnPointerCancel);
    listener(elementRef, 'click', handleOnClick);

    function handleOnPointerDown(event: Event): void {
      startedPointerDownOnOverlay.set(event.target === event.currentTarget);
    }

    function handleOnPointerCancel(): void {
      startedPointerDownOnOverlay.set(false);
    }

    function handleOnClick(event: Event): void {
      const isOverlayClick = startedPointerDownOnOverlay() && event.target === event.currentTarget;

      handleOnPointerCancel();

      if (!isOverlayClick || dialogRef.disableClose) {
        return;
      }

      const guard: NgpDismissGuard<Element> =
        dialogRef.closeOnOutsideClick ?? closeOnClick() ?? true;
      evaluateGuard(guard, event.target as Element);
    }

    function evaluateGuard(guard: NgpDismissGuard<Element>, target: Element): void {
      if (guard === true) {
        dialogRef.close(undefined, 'mouse');
        return;
      }

      if (guard === false) {
        return;
      }

      // Function guard — evaluate sync or async
      let result: boolean | Promise<boolean>;
      try {
        result = guard(target);
      } catch (error) {
        console.error('NgpDialogOverlay: dismiss guard threw', error);
        return;
      }

      if (typeof result === 'boolean') {
        if (result) {
          dialogRef.close(undefined, 'mouse');
        }
      } else {
        result
          .then(shouldClose => {
            if (shouldClose) {
              dialogRef.close(undefined, 'mouse');
            }
          })
          .catch(error => {
            console.error('NgpDialogOverlay: dismiss guard rejected', error);
          });
      }
    }

    return {
      elementRef,
      closeOnClick,
    } satisfies NgpDialogOverlayState;
  },
);
