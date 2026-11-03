import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpDismissGuard } from 'ng-primitives/portal';
import { createPrimitive, listener } from 'ng-primitives/state';
import { injectDialogRef } from '../dialog/dialog-ref';

export interface NgpDialogOverlayState {
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
    // The backdrop is not focusable, so a press on it blurs the focused control to the body. The
    // blur is let through so values that commit on blur are up to date when a dismiss guard runs,
    // and focus is returned only once the press is known not to close the dialog.
    let focusedBeforePress: HTMLElement | null = null;

    // Listener
    listener(elementRef, 'pointerdown', handleOnPointerDown);
    listener(elementRef, 'pointercancel', handleOnPointerCancel);
    listener(elementRef, 'click', handleOnClick);

    function handleOnPointerDown(event: Event): void {
      const onOverlay = event.target === event.currentTarget;
      startedPointerDownOnOverlay.set(onOverlay);
      // A press while an async guard is pending keeps the target saved by the first press, since
      // focus is already on the body by then.
      focusedBeforePress = onOverlay ? (focusedBeforePress ?? getActiveElement()) : null;
    }

    function handleOnPointerCancel(): void {
      startedPointerDownOnOverlay.set(false);
      restoreFocus();
    }

    function handleOnClick(event: Event): void {
      const isOverlayClick = startedPointerDownOnOverlay() && event.target === event.currentTarget;
      startedPointerDownOnOverlay.set(false);

      if (!isOverlayClick || dialogRef.disableClose) {
        restoreFocus();
        return;
      }

      const guard: NgpDismissGuard<Element> =
        dialogRef.closeOnOutsideClick ?? closeOnClick() ?? true;
      evaluateGuard(guard, event.target as Element);
    }

    function evaluateGuard(guard: NgpDismissGuard<Element>, target: Element): void {
      if (guard === true) {
        close();
        return;
      }

      if (guard === false) {
        restoreFocus();
        return;
      }

      // Function guard — evaluate sync or async
      let result: boolean | Promise<boolean>;
      try {
        result = guard(target);
      } catch (error) {
        console.error('NgpDialogOverlay: dismiss guard threw', error);
        restoreFocus();
        return;
      }

      if (typeof result === 'boolean') {
        closeOrRestoreFocus(result);
      } else {
        result.then(closeOrRestoreFocus).catch(error => {
          console.error('NgpDialogOverlay: dismiss guard rejected', error);
          restoreFocus();
        });
      }
    }

    function closeOrRestoreFocus(shouldClose: boolean): void {
      if (shouldClose) {
        close();
      } else {
        restoreFocus();
      }
    }

    function close(): void {
      focusedBeforePress = null;
      dialogRef.close(undefined, 'mouse');
    }

    function restoreFocus(): void {
      const element = focusedBeforePress;
      focusedBeforePress = null;

      // Leave focus alone if something else (e.g. the guard) has moved it since the press.
      if (element?.isConnected && getActiveElement() === element.ownerDocument.body) {
        element.focus();
      }
    }

    // `document.activeElement` stops at a shadow host, which `focus()` can't send focus back into.
    function getActiveElement(): HTMLElement | null {
      let element = elementRef.nativeElement.ownerDocument.activeElement as HTMLElement | null;
      while (element?.shadowRoot?.activeElement) {
        element = element.shadowRoot.activeElement as HTMLElement;
      }
      return element;
    }

    return {
      closeOnClick,
    } satisfies NgpDialogOverlayState;
  },
);
