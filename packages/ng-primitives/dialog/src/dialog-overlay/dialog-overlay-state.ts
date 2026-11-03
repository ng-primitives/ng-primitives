import { inject, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpDismissGuard, NgpOverlayEntry, NgpOverlayRegistry } from 'ng-primitives/portal';
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
    // The backdrop is not focusable, so a press on it blurs the focused control to the body. The
    // blur is let through so values that commit on blur are up to date when a dismiss guard runs,
    // and focus is returned only once the press is known not to close the dialog.
    let focusedBeforePress: HTMLElement | null = null;

    // Listener
    listener(elementRef, 'pointerdown', handleOnPointerDown);
    listener(elementRef, 'pointercancel', handleOnPointerCancel);
    listener(elementRef, 'click', handleOnClick);

    function handleOnPointerDown(event: Event): void {
      const isOnOverlay = event.target === event.currentTarget;
      const closingOverlays = isOnOverlay ? childOverlaysClosedByPress() : [];
      startedPointerDownOnOverlay.set(isOnOverlay);
      pressClosesChildOverlay.set(closingOverlays.length > 0);
      // A press while an async guard is pending keeps the target saved by the first press, since
      // focus is already on the body by then.
      focusedBeforePress = isOnOverlay
        ? (focusedBeforePress ?? outsideOf(closingOverlays, getActiveElement()))
        : null;
    }

    /**
     * The overlays opened from the dialog that a backdrop press closes: those that close on an
     * outside press, and those that close along with such a parent.
     */
    function childOverlaysClosedByPress(): NgpOverlayEntry[] {
      // Listed parent before child, so a parent is decided before its children.
      const descendants = registry.getDescendants(dialogRef.id);
      const closing = new Set<string>();

      for (const entry of descendants) {
        const closesOnPress =
          entry.dismissPolicy.outsidePress !== false &&
          !PASSIVE_OVERLAY_TYPES.has(entry.overlayType ?? '');
        const closesWithParent =
          entry.parentId !== null && closing.has(entry.parentId) && entry.cascadeClose !== false;

        if (closesOnPress || closesWithParent) {
          closing.add(entry.id);
        }
      }

      return descendants.filter(entry => closing.has(entry.id));
    }

    /**
     * Focus inside an overlay the press closes would go with it, so it is returned to the trigger
     * of that overlay instead, walking out through nested ones such as a submenu.
     */
    function outsideOf(
      overlays: NgpOverlayEntry[],
      element: HTMLElement | null,
    ): HTMLElement | null {
      const ownerOf = (node: HTMLElement | null) =>
        node
          ? overlays.find(entry =>
              entry.getElements().some(overlayElement => containsComposed(overlayElement, node)),
            )
          : undefined;

      let target = element;
      let owner = ownerOf(target);
      // Bounded by the number of overlays, in case a trigger sits inside its own overlay.
      for (let depth = 0; owner && depth < overlays.length; depth++) {
        target = owner.triggerElement;
        owner = ownerOf(target);
      }
      return target;
    }

    function handleOnPointerCancel(): void {
      startedPointerDownOnOverlay.set(false);
      pressClosesChildOverlay.set(false);
      restoreFocus();
    }

    function handleOnClick(event: Event): void {
      const isOverlayClick = startedPointerDownOnOverlay() && event.target === event.currentTarget;
      const closesChildOverlay = pressClosesChildOverlay();
      startedPointerDownOnOverlay.set(false);
      pressClosesChildOverlay.set(false);

      if (!isOverlayClick || closesChildOverlay || dialogRef.disableClose) {
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

/** Whether `node` is `ancestor` or inside it, crossing shadow root boundaries. */
function containsComposed(ancestor: Node, node: Node): boolean {
  for (let current: Node | null = node; current; ) {
    if (current === ancestor) {
      return true;
    }
    current = current instanceof ShadowRoot ? current.host : current.parentNode;
  }
  return false;
}
