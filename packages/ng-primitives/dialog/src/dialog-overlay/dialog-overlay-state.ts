import { inject, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpDismissGuard, NgpOverlayRegistry } from 'ng-primitives/portal';
import { createPrimitive, listener } from 'ng-primitives/state';
import { injectDialogRef } from '../dialog/dialog-ref';

/** Overlays opened on hover or focus, not on a press: they leave a backdrop click to the dialog. */
const PASSIVE_OVERLAY_TYPES = new Set(['tooltip', 'preview-card']);

export interface NgpDialogOverlayState {
  /**
   * Whether the dialog should close on backdrop click. A backdrop click that closes a popover,
   * menu, select or other overlay opened from the dialog leaves the dialog open; tooltips and
   * preview cards don't count.
   * @default `true`
   */
  readonly closeOnClick: Signal<NgpDismissGuard<Element> | undefined>;
}

export interface NgpDialogOverlayProps {
  /**
   * Whether the dialog should close on backdrop click. A backdrop click that closes a popover,
   * menu, select or other overlay opened from the dialog leaves the dialog open; tooltips and
   * preview cards don't count.
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
    const registry = inject(NgpOverlayRegistry);

    const startedPointerDownOnOverlay = signal(false);
    // Snapshot at press time: by the click, the registry has already started closing the child
    const pressClosesChildOverlay = signal(false);

    // Listener
    listener(elementRef, 'pointerdown', handleOnPointerDown);
    listener(elementRef, 'pointercancel', handleOnPointerCancel);
    listener(elementRef, 'click', handleOnClick);

    function handleOnPointerDown(event: Event): void {
      const isOnOverlay = event.target === event.currentTarget;
      startedPointerDownOnOverlay.set(isOnOverlay);
      pressClosesChildOverlay.set(isOnOverlay && hasChildOverlayClosingOnOutsidePress());
    }

    function hasChildOverlayClosingOnOutsidePress(): boolean {
      return registry
        .getDescendants(dialogRef.id)
        .some(
          entry =>
            entry.dismissPolicy.outsidePress !== false &&
            !PASSIVE_OVERLAY_TYPES.has(entry.overlayType ?? ''),
        );
    }

    function handleOnPointerCancel(): void {
      startedPointerDownOnOverlay.set(false);
      pressClosesChildOverlay.set(false);
    }

    function handleOnClick(event: Event): void {
      const isOverlayClick = startedPointerDownOnOverlay() && event.target === event.currentTarget;
      const closesChildOverlay = pressClosesChildOverlay();

      handleOnPointerCancel();

      if (!isOverlayClick || closesChildOverlay || dialogRef.disableClose) {
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
      closeOnClick,
    } satisfies NgpDialogOverlayState;
  },
);
