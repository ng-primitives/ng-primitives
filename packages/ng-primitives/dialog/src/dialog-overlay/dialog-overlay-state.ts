import { inject, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  NgpDismissGuard,
  NgpOverlay,
  NgpOverlayEntry,
  NgpOverlayRegistry,
} from 'ng-primitives/portal';
import { createPrimitive, listener, onDestroy } from 'ng-primitives/state';
import { Subscription } from 'rxjs';
import { injectDialogRef } from '../dialog/dialog-ref';

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
    // The child overlays the press may close, and those whose close has started since: a dismiss
    // guard can keep a child open, and focus inside it then stays where it is.
    let pressedOverlays: NgpOverlayEntry[] = [];
    const startedClosing = new Set<string>();
    // Set while a child the press may close is still deciding on its guard: its close returns
    // focus to `target`, which the press saved before it went to the body.
    let pendingFocus: { target: HTMLElement | null } | null = null;
    let closingSubscription = new Subscription();
    onDestroy(() => closingSubscription.unsubscribe());

    // Listener
    listener(elementRef, 'pointerdown', handleOnPointerDown);
    listener(elementRef, 'pointercancel', handleOnPointerCancel);
    listener(elementRef, 'click', handleOnClick);

    function handleOnPointerDown(event: Event): void {
      const isOnOverlay = event.target === event.currentTarget;
      const overlaysPressMayClose = isOnOverlay ? childOverlaysPressMayClose() : [];
      startedPointerDownOnOverlay.set(isOnOverlay);
      pressClosesChildOverlay.set(overlaysPressMayClose.length > 0);
      watchClosing(overlaysPressMayClose);
      // A press while an async guard is pending keeps the target saved by the first press, since
      // focus is already on the body by then.
      focusedBeforePress = isOnOverlay ? (focusedBeforePress ?? getActiveElement()) : null;
    }

    function watchClosing(overlays: NgpOverlayEntry[]): void {
      closingSubscription.unsubscribe();
      closingSubscription = new Subscription();
      startedClosing.clear();
      pendingFocus = null;
      pressedOverlays = overlays;

      for (const entry of overlays) {
        // Another kind of overlay, such as a nested dialog, is taken to close as the press asks.
        if (!(entry.overlay instanceof NgpOverlay)) {
          startedClosing.add(entry.id);
          continue;
        }
        const overlay = entry.overlay;
        closingSubscription.add(overlay.closing.subscribe(() => onOverlayClosing(entry, overlay)));
      }
    }

    function onOverlayClosing(entry: NgpOverlayEntry, overlay: NgpOverlay): void {
      startedClosing.add(entry.id);
      // A child that kept itself open and closes later for another reason, such as Escape,
      // returns focus as that close does.
      if (!pendingFocus || !answersBackdropPress(overlay)) {
        return;
      }
      const { target } = pendingFocus;
      pendingFocus = null;
      // Focus still inside the child is about to go with it, so it counts as lost too.
      const active = getActiveElement();
      const focusLost =
        !active ||
        active === active.ownerDocument.body ||
        entry.getElements().some(overlayElement => containsComposed(overlayElement, active));
      const element = outsideOf([entry], target);
      if (focusLost && element?.isConnected) {
        element.focus();
      }
    }

    function answersBackdropPress(overlay: NgpOverlay): boolean {
      const press = overlay.closingPressTarget();
      return press !== null && containsComposed(elementRef.nativeElement, press);
    }

    /**
     * The overlays opened from the dialog that a backdrop press may close: those that close on an
     * outside press, and those that close along with such a parent.
     */
    function childOverlaysPressMayClose(): NgpOverlayEntry[] {
      // Listed parent before child, so a parent is decided before its children.
      const descendants = registry.getDescendants(dialogRef.id);
      const closing = new Set<string>();

      for (const entry of descendants) {
        const closesOnPress = entry.dismissPolicy.outsidePress !== false && !entry.passive;
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
      const ownerOf = (node: HTMLElement) =>
        overlays.find(entry =>
          entry.getElements().some(overlayElement => containsComposed(overlayElement, node)),
        );

      let target = element;
      let owner = target ? ownerOf(target) : undefined;
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
        restoreFocus(closesChildOverlay);
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
      watchClosing([]);
      dialogRef.close(undefined, 'mouse');
    }

    /**
     * `awaitingClose` is set on a click that may still close a child whose guard has not decided:
     * the child's close then returns focus, so the watch is kept until it starts.
     */
    function restoreFocus(awaitingClose = false): void {
      const closing = pressedOverlays.filter(entry => startedClosing.has(entry.id));
      const element = outsideOf(closing, focusedBeforePress);
      const awaiting = awaitingClose && closing.length < pressedOverlays.length;

      if (awaiting) {
        pendingFocus = { target: focusedBeforePress };
      } else {
        watchClosing([]);
      }
      focusedBeforePress = null;
      returnFocus(element);
    }

    // Leave focus alone if something else (e.g. the guard) has moved it since the press.
    function returnFocus(element: HTMLElement | null): void {
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
