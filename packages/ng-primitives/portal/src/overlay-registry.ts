import { FocusOrigin } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import { inject, Injectable, isSignal, NgZone, Signal } from '@angular/core';
import { NgpEscapeKeyClaims } from 'ng-primitives/internal';
import { Subject } from 'rxjs';

/**
 * A dismiss guard can be a boolean or a callback that returns a boolean (sync or async).
 * - `true` → always dismiss
 * - `false` → never dismiss
 * - `(target) => boolean | Promise<boolean>` → custom logic per interaction
 */
export type NgpDismissGuard<T = Element> = boolean | ((target: T) => boolean | Promise<boolean>);

/**
 * Input type for dismiss guard inputs, accepting booleans, string booleans, or guard functions.
 */
export type NgpDismissGuardInput<T = Element> = NgpDismissGuard<T> | string;

/**
 * Transform function for dismiss guard inputs.
 * Coerces string boolean values ('', 'true', 'false') while passing through
 * actual booleans and guard functions unchanged.
 */
export function dismissGuardAttribute<T>(value: NgpDismissGuardInput<T>): NgpDismissGuard<T> {
  if (typeof value === 'function') {
    return value;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  // String coercion: '' (attribute present) and 'true' → true, 'false' → false
  return value !== 'false';
}

/**
 * Marks an element that stays usable while a modal overlay or dialog is open, such as a toast
 * region or a third-party portal container.
 */
export const NGP_MODAL_EXEMPT_ATTRIBUTE = 'data-ngp-modal-exempt';

/**
 * Dismiss policy for an overlay entry.
 * Determines how the overlay responds to outside clicks and escape key presses.
 * @internal
 */
export interface NgpDismissPolicy {
  /** Whether clicking outside should close this overlay, or a guard function */
  outsidePress: NgpDismissGuard<Element>;
  /** Whether pressing Escape should close this overlay, or a guard function */
  escapeKey: NgpDismissGuard<KeyboardEvent>;
}

/**
 * An entry in the overlay registry representing a single visible overlay.
 * @internal
 */
export interface NgpOverlayEntry {
  /** Unique overlay ID */
  id: string;
  /** Parent overlay ID, null for root overlays */
  parentId: string | null;
  /** Reference to the overlay instance for calling hide()/hideImmediate() */
  overlay: NgpOverlayRef;
  /** Function that returns the portal DOM elements */
  getElements: () => HTMLElement[];
  /** The trigger element */
  triggerElement: HTMLElement;
  /**
   * Optional anchor element. Pass a signal when the anchor can change while the overlay
   * is open - an entry is registered once per open and is not re-registered on a change.
   */
  anchorElement?: HTMLElement | null | Signal<HTMLElement | null | undefined>;
  /** Per-instance dismiss configuration */
  dismissPolicy: NgpDismissPolicy;
  /** If true, clicks on the trigger element are treated as outside clicks */
  treatTriggerClickAsOutside?: boolean;
  /**
   * If true, the overlay takes Escape only when it is pressed inside it; otherwise Escape goes to
   * the overlay below. For an overlay that leaves the page usable, such as a non-modal dialog.
   */
  escapeKeyInsideOnly?: boolean;
  /**
   * If true, a press outside the overlay only closes it: the click is swallowed, so the topmost
   * modal overlay closes and nothing underneath reacts.
   */
  modal?: boolean;
  /** Optional subject that receives pointer events that occur outside the overlay */
  outsidePointerEvents$?: Subject<MouseEvent>;
  /**
   * Whether closing the parent overlay also closes this one. Defaults to true.
   * Set it false for an overlay that does not depend on its parent for position - a
   * dialog is positioned against the viewport, an anchored overlay loses its anchor.
   */
  cascadeClose?: boolean;
}

/**
 * Minimal overlay reference needed by the registry.
 * This avoids a circular dependency with NgpOverlay.
 * @internal
 */
export interface NgpOverlayRef {
  hide(options?: { immediate?: boolean; origin?: FocusOrigin; restoreFocus?: boolean }): void;
  hideImmediate(): void;
}

/**
 * Singleton registry that tracks all visible overlays in open order and
 * provides centralized dismiss routing (outside-click and escape-key).
 *
 * Document listeners are attached when the first overlay registers and
 * detached when the last deregisters, avoiding permanent global listeners.
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class NgpOverlayRegistry {
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private readonly escapeKeyClaims = inject(NgpEscapeKeyClaims);

  /** Ordered list of visible overlay entries (oldest first, newest/topmost last) */
  private readonly entries: NgpOverlayEntry[] = [];

  /** Set of overlay IDs currently evaluating an async dismiss guard */
  private readonly pendingGuardIds = new Set<string>();

  /** Cleanup functions for the centralized document listeners */
  private removeOutsideClickListener?: () => void;
  private removeEscapeKeyListener?: () => void;
  private removeOutsidePointerListeners?: () => void;

  /** Tracks the pointerdown target for CDK-compatible outside pointer event dispatch */
  private pointerDownTarget: EventTarget | null = null;

  /** Composed path of the last pointerdown, so a press that starts inside an overlay keeps it open */
  private pressPath: EventTarget[] | null = null;

  /**
   * Whether the current primary press started outside the topmost modal overlay, or null when
   * there is no press or no modal overlay. Consumed by the click that ends the press.
   */
  private pressOutsideModal: boolean | null = null;

  /** Open order of each entry, parallel to `entries`, which stays sorted by it. */
  private readonly orders = new Map<string, number>();

  /** The order the next freshly opened entry receives. */
  private nextOrder = 0;

  /**
   * Register an overlay as visible. Attaches document listeners if this is the first entry.
   * @param order The value a previous `register()` returned, to put the entry back where it
   * was in the stack. Omit it to register the entry as the topmost overlay.
   * @returns The entry's open order.
   */
  register(entry: NgpOverlayEntry, order?: number): number {
    // Avoid double-registration
    const existing = this.orders.get(entry.id);
    if (existing !== undefined) {
      return existing;
    }

    const entryOrder = order ?? this.nextOrder++;
    const index = this.entries.findIndex(e => this.orders.get(e.id)! > entryOrder);
    this.entries.splice(index === -1 ? this.entries.length : index, 0, entry);
    this.orders.set(entry.id, entryOrder);

    // Attach listeners when the first overlay registers
    if (this.entries.length === 1) {
      this.attachListeners();
    }

    return entryOrder;
  }

  /**
   * Remove an overlay from the registry.
   * Detaches document listeners if no entries remain.
   */
  deregister(id: string): void {
    const index = this.entries.findIndex(e => e.id === id);
    if (index !== -1) {
      this.entries.splice(index, 1);
      this.orders.delete(id);
      this.pendingGuardIds.delete(id);
    }

    // Detach listeners when the last overlay deregisters
    if (this.entries.length === 0) {
      this.detachListeners();
    }
  }

  /**
   * Close all descendants of the given overlay.
   * Called by NgpOverlay when it hides to cascade the close to children.
   */
  closeDescendants(id: string): void {
    const descendants = this.getCascadingDescendants(id);
    // Close deepest first to avoid re-entrant issues
    for (let i = descendants.length - 1; i >= 0; i--) {
      descendants[i].overlay.hideImmediate();
    }
  }

  /**
   * Descendants of `id` that close along with it. The walk stops at an entry that opted
   * out, leaving its own subtree open too.
   */
  private getCascadingDescendants(id: string): NgpOverlayEntry[] {
    return this.collectDescendants(id, entry => entry.cascadeClose !== false);
  }

  /**
   * Breadth-first walk of `id`'s subtree, so the result is parent-before-child whatever
   * order `entries` is in. `include` prunes an entry and its subtree.
   */
  private collectDescendants(
    id: string,
    include: (entry: NgpOverlayEntry) => boolean = () => true,
  ): NgpOverlayEntry[] {
    const childrenByParent = new Map<string, NgpOverlayEntry[]>();

    for (const entry of this.entries) {
      if (entry.parentId === null) {
        continue;
      }
      const siblings = childrenByParent.get(entry.parentId);
      if (siblings) {
        siblings.push(entry);
      } else {
        childrenByParent.set(entry.parentId, [entry]);
      }
    }

    const descendants: NgpOverlayEntry[] = [];
    const queue = [id];
    const seen = new Set<string>([id]);

    while (queue.length > 0) {
      for (const child of childrenByParent.get(queue.shift()!) ?? []) {
        if (seen.has(child.id) || !include(child)) {
          continue;
        }
        seen.add(child.id);
        descendants.push(child);
        queue.push(child.id);
      }
    }

    return descendants;
  }

  /**
   * Get all registered entries.
   */
  getEntries(): readonly NgpOverlayEntry[] {
    return this.entries;
  }

  /**
   * Get the topmost (most recently opened) overlay entry, or null if none.
   */
  getTopmost(): NgpOverlayEntry | null {
    return this.entries.length > 0 ? this.entries[this.entries.length - 1] : null;
  }

  /**
   * Find the overlay whose elements contain the given DOM element.
   * Returns the ID of the most recently opened (topmost) containing overlay, or null.
   */
  findContainingOverlay(element: HTMLElement): string | null {
    // Walk from topmost to oldest so we find the nearest containing overlay
    for (let i = this.entries.length - 1; i >= 0; i--) {
      const entry = this.entries[i];
      const elements = entry.getElements();
      if (elements.some(el => el.contains(element))) {
        return entry.id;
      }
    }
    return null;
  }

  /**
   * Check whether overlay `ancestorId` is an ancestor of overlay `descendantId`
   * by walking the parentId chain.
   */
  isAncestorOf(ancestorId: string, descendantId: string): boolean {
    let currentId: string | null = descendantId;

    while (currentId !== null) {
      const entry = this.entries.find(e => e.id === currentId);
      if (!entry) {
        return false;
      }
      if (entry.parentId === ancestorId) {
        return true;
      }
      currentId = entry.parentId;
    }

    return false;
  }

  /**
   * Get all descendants of the given overlay (children, grandchildren, etc.)
   * by walking parentId chains of all entries.
   */
  getDescendants(id: string): NgpOverlayEntry[] {
    return this.collectDescendants(id);
  }

  /**
   * Attach centralized document listeners for outside-click and escape-key.
   * Runs outside Angular zone to avoid unnecessary change detection on every
   * mouse/keyboard event.
   */
  private attachListeners(): void {
    this.ngZone.runOutsideAngular(() => {
      const onMouseUp = (event: MouseEvent) => this.handleOutsideClick(event);
      const onKeyDown = (event: KeyboardEvent) => this.handleEscapeKey(event);

      this.document.addEventListener('mouseup', onMouseUp, true);
      this.document.addEventListener('keydown', onKeyDown, true);

      this.removeOutsideClickListener = () =>
        this.document.removeEventListener('mouseup', onMouseUp, true);
      this.removeEscapeKeyListener = () =>
        this.document.removeEventListener('keydown', onKeyDown, true);

      // CDK-compatible outside pointer event dispatch:
      // Track pointerdown origin, then emit click/auxclick/contextmenu events
      // to entries that have an outsidePointerEvents$ subject.
      const onPointerDown = (event: PointerEvent) => {
        this.pointerDownTarget = this.getComposedTarget(event);
        this.pressPath = event.composedPath();
        this.handleModalPointerDown(event);
      };

      // A cancelled press (e.g. a touch that turns into a scroll) gets no mouseup to consume it
      const onPointerCancel = () => {
        this.pressPath = null;
        this.pressOutsideModal = null;
      };

      const onClick = (event: MouseEvent) => {
        if (!this.handleModalClick(event)) {
          this.handleOutsidePointerEvent(event);
        }
      };

      const onPointerEvent = (event: MouseEvent) => this.handleOutsidePointerEvent(event);

      // A press that opens a context menu (a macOS Ctrl+click) ends without a click
      const onContextMenu = (event: MouseEvent) => {
        this.pressOutsideModal = null;
        this.handleOutsidePointerEvent(event);
      };

      this.document.addEventListener('pointerdown', onPointerDown, true);
      this.document.addEventListener('pointercancel', onPointerCancel, true);
      this.document.addEventListener('click', onClick, true);
      this.document.addEventListener('auxclick', onPointerEvent, true);
      this.document.addEventListener('contextmenu', onContextMenu, true);

      this.removeOutsidePointerListeners = () => {
        this.document.removeEventListener('pointerdown', onPointerDown, true);
        this.document.removeEventListener('pointercancel', onPointerCancel, true);
        this.document.removeEventListener('click', onClick, true);
        this.document.removeEventListener('auxclick', onPointerEvent, true);
        this.document.removeEventListener('contextmenu', onContextMenu, true);
      };
    });
  }

  /**
   * Detach centralized document listeners.
   */
  private detachListeners(): void {
    this.removeOutsideClickListener?.();
    this.removeOutsideClickListener = undefined;
    this.removeEscapeKeyListener?.();
    this.removeEscapeKeyListener = undefined;
    this.removeOutsidePointerListeners?.();
    this.removeOutsidePointerListeners = undefined;
    this.pointerDownTarget = null;
    this.pressPath = null;
    this.pressOutsideModal = null;
  }

  /**
   * The topmost modal overlay when the event path is outside it, or null. Inside covers the
   * overlays opened above it, its trigger and anchor, and exempt elements.
   */
  private findBlockingModal(path: EventTarget[]): NgpOverlayEntry | null {
    const index = this.getTopmostModalIndex();

    if (index === -1) {
      return null;
    }

    const isInside =
      this.entries.slice(index).some(entry => !this.isClickOutsideEntry(entry, path)) ||
      path.some(node => node instanceof Element && node.hasAttribute(NGP_MODAL_EXEMPT_ATTRIBUTE));

    return isInside ? null : this.entries[index];
  }

  private getTopmostModalIndex(): number {
    for (let i = this.entries.length - 1; i >= 0; i--) {
      if (this.entries[i].modal) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Stop a primary press outside the topmost modal overlay from reaching the page. Cancelling
   * `pointerdown` also suppresses the `mousedown` and `mouseup` that follow it, so the modal
   * overlay closes on the `click` instead.
   */
  private handleModalPointerDown(event: PointerEvent): void {
    // A second finger on a touch screen does not end the press the first one started.
    if (!event.isPrimary) {
      return;
    }

    if (event.button !== 0 || this.getTopmostModalIndex() === -1 || this.isOnScrollbar(event)) {
      this.pressOutsideModal = null;
      return;
    }

    this.pressOutsideModal = this.findBlockingModal(event.composedPath()) !== null;

    if (this.pressOutsideModal) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Swallow the click that ends a press outside the topmost modal overlay, and close it. A click
   * with no such press - from the keyboard, or fired by code like a test's `fireEvent.click` or a
   * download link's `a.click()` - is left alone.
   * @returns Whether the click was swallowed.
   */
  private handleModalClick(event: MouseEvent): boolean {
    const pressOutsideModal = this.pressOutsideModal;
    this.pressOutsideModal = null;

    // A click from the keyboard or from code has a `detail` of 0: it does not end the press.
    if (!pressOutsideModal || event.detail === 0) {
      return false;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    this.pointerDownTarget = null;

    const path = event.composedPath();
    const modal = this.findBlockingModal(path);

    if (modal && !this.pendingGuardIds.has(modal.id)) {
      const target =
        (path.find((node): node is Element => node instanceof Element) as Element) ??
        this.document.documentElement;

      this.evaluateGuardAndDismiss(modal.id, modal.dismissPolicy.outsidePress, target, () =>
        // The swallowed press focused nothing, so focus would otherwise fall to the body
        this.ngZone.run(() => modal.overlay.hide({ origin: 'mouse', restoreFocus: true })),
      );
    }

    return true;
  }

  /** Whether the event landed on a scrollbar, outside the viewport's client area. */
  private isOnScrollbar(event: MouseEvent): boolean {
    const { clientWidth, clientHeight } = this.document.documentElement;
    return (
      clientWidth > 0 &&
      clientHeight > 0 &&
      (event.clientX >= clientWidth || event.clientY >= clientHeight)
    );
  }

  /**
   * Outside-click dismiss: checks all overlays (not just the topmost) and
   * dismisses every overlay tree where the click landed outside.
   *
   * This handles the case where a non-dismissable overlay (e.g. a tooltip) is
   * topmost but other overlays (e.g. a popover) should still be dismissed.
   */
  private handleOutsideClick(event: MouseEvent): void {
    const pressPath = this.pressPath;
    // While other buttons are still held (chording), the press that set the path is not over yet
    if (event.buttons === 0) {
      this.pressPath = null;
    }

    if (this.entries.length === 0) {
      return;
    }

    // Ignore right-click mouseup — right-clicks open context menus via the
    // `contextmenu` event, and the corresponding mouseup should never dismiss
    // an overlay. If the user right-clicks elsewhere, the new `contextmenu`
    // event on that target will handle repositioning or reopening.
    if (event.button === 2) {
      return;
    }

    // Ignore scrollbar clicks — the click lands outside the viewport's client area.
    if (this.isOnScrollbar(event)) {
      return;
    }

    // Overlays below a modal overlay can't be reached, and the modal overlay itself closes on the
    // click, so only the overlays above it are candidates.
    const lowestCandidate = this.getTopmostModalIndex() + 1;

    const path = event.composedPath();

    // Step 1: Build a set of overlay IDs where the press started or ended "inside",
    // so dragging out of an overlay (e.g. selecting text) does not dismiss it
    const insideIds = new Set<string>();
    for (const entry of this.entries) {
      if (
        !this.isClickOutsideEntry(entry, path) ||
        (pressPath && !this.isClickOutsideEntry(entry, pressPath))
      ) {
        insideIds.add(entry.id);
      }
    }

    // Step 2: Expand insideIds to include all ancestors of inside entries.
    // If a child contains the click, its entire parent chain is protected.
    for (const id of insideIds) {
      let currentId = this.entries.find(e => e.id === id)?.parentId ?? null;
      while (currentId !== null) {
        if (insideIds.has(currentId)) break; // already protected
        insideIds.add(currentId);
        currentId = this.entries.find(e => e.id === currentId)?.parentId ?? null;
      }
    }

    // Step 3: For each entry that is outside, find the highest dismissable ancestor
    // and collect unique roots to dismiss.
    const toDismiss = new Map<string, NgpOverlayEntry>();
    const coveredIds = new Set<string>(); // entries covered by an ancestor we'll dismiss

    // Walk from topmost to oldest
    for (let i = this.entries.length - 1; i >= lowestCandidate; i--) {
      const entry = this.entries[i];

      // Skip entries where the click was inside
      if (insideIds.has(entry.id)) continue;
      // Skip entries with pending guards
      if (this.pendingGuardIds.has(entry.id)) continue;
      // Skip entries already covered by an ancestor we're about to dismiss
      if (coveredIds.has(entry.id)) continue;

      // Walk up parent chain to find the highest dismissable ancestor
      let highest = entry;
      let currentId = entry.parentId;

      while (currentId !== null) {
        const parent = this.entries.find(e => e.id === currentId);
        if (!parent) break;
        if (this.entries.indexOf(parent) < lowestCandidate) break;
        if (insideIds.has(parent.id)) break;
        if (parent.dismissPolicy.outsidePress === false) break;
        if (this.pendingGuardIds.has(parent.id)) break;

        highest = parent;
        currentId = parent.parentId;
      }

      toDismiss.set(highest.id, highest);

      // Mark all descendants as covered
      for (const desc of this.getDescendants(highest.id)) {
        coveredIds.add(desc.id);
      }
    }

    // Derive a proper Element from the composed path for guard evaluation
    const target =
      (path.find((node): node is Element => node instanceof Element) as Element) ??
      this.document.documentElement;

    // Step 4: Dismiss each root
    for (const [id, entry] of toDismiss) {
      this.evaluateGuardAndDismiss(id, entry.dismissPolicy.outsidePress, target, () =>
        this.ngZone.run(() => entry.overlay.hide()),
      );
    }
  }

  /**
   * Check if a click (represented by its composedPath) is outside an entry's
   * elements, trigger, and anchor.
   */
  private isClickOutsideEntry(entry: NgpOverlayEntry, path: EventTarget[]): boolean {
    const isInsideElements = entry.getElements().some(el => path.includes(el));
    const isInsideTrigger =
      !entry.treatTriggerClickAsOutside && path.includes(entry.triggerElement);
    const anchorElement = isSignal(entry.anchorElement)
      ? entry.anchorElement()
      : entry.anchorElement;
    const isInsideAnchor = anchorElement ? path.includes(anchorElement) : false;
    return !(isInsideElements || isInsideTrigger || isInsideAnchor);
  }

  /**
   * Escape-key dismiss: only the topmost overlay that takes the Escape responds (see
   * `escapeKeyInsideOnly`).
   */
  private handleEscapeKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.isComposing) {
      return;
    }

    const path = event.composedPath();
    const topmost = this.findEscapeKeyTarget(path);
    if (!topmost || this.pendingGuardIds.has(topmost.id)) {
      return;
    }

    // a control inside the overlay will handle this Escape itself
    if (
      topmost.getElements().some(el => path.includes(el)) &&
      this.escapeKeyClaims.isClaimed(event)
    ) {
      return;
    }

    this.evaluateGuardAndDismiss(topmost.id, topmost.dismissPolicy.escapeKey, event, () =>
      this.ngZone.run(() => topmost.overlay.hide({ origin: 'keyboard', immediate: true })),
    );
  }

  /** The topmost overlay that takes an Escape pressed at the given path. */
  private findEscapeKeyTarget(path: EventTarget[]): NgpOverlayEntry | null {
    for (let i = this.entries.length - 1; i >= 0; i--) {
      const entry = this.entries[i];

      if (!entry.escapeKeyInsideOnly || entry.getElements().some(el => path.includes(el))) {
        return entry;
      }
    }

    return null;
  }

  /**
   * CDK-compatible outside pointer event dispatch.
   * Iterates overlays from topmost to oldest (like CDK's OverlayOutsideClickDispatcher).
   * For each overlay with an outsidePointerEvents$ subject, emits the event if the
   * click was outside its elements. Stops iterating when an overlay contains the click.
   */
  private handleOutsidePointerEvent(event: MouseEvent): void {
    const target = this.getComposedTarget(event);
    // For click events, use the pointerdown origin to handle drag scenarios
    const origin =
      event.type === 'click' && this.pointerDownTarget ? this.pointerDownTarget : target;
    this.pointerDownTarget = null;

    // Iterate from topmost to oldest (like CDK)
    const overlays = this.entries.slice();
    for (let i = overlays.length - 1; i >= 0; i--) {
      const entry = overlays[i];

      if (!entry.outsidePointerEvents$?.observers.length) {
        continue;
      }

      const elements = entry.getElements();
      if (this.containsElement(elements, target) || this.containsElement(elements, origin)) {
        break;
      }

      this.ngZone.run(() => entry.outsidePointerEvents$!.next(event));
    }
  }

  /**
   * Get the composed event target, piercing shadow DOM boundaries.
   */
  private getComposedTarget(event: Event): EventTarget | null {
    return event.composedPath?.()?.[0] ?? event.target;
  }

  /**
   * Check whether any of the given elements contain the target, piercing shadow DOM.
   */
  private containsElement(elements: HTMLElement[], target: EventTarget | null): boolean {
    if (!target || !(target instanceof Node)) {
      return false;
    }
    return elements.some(el => {
      let current: Node | null = target;
      while (current) {
        if (current === el) return true;
        current =
          typeof ShadowRoot !== 'undefined' && current instanceof ShadowRoot
            ? current.host
            : current.parentNode;
      }
      return false;
    });
  }

  /**
   * Evaluate a dismiss guard and call the dismiss function if allowed.
   * Supports boolean values and sync/async guard functions.
   */
  private evaluateGuardAndDismiss<T>(
    overlayId: string,
    guard: NgpDismissGuard<T>,
    target: T,
    dismiss: () => void,
  ): void {
    if (guard === true || guard === undefined) {
      dismiss();
      return;
    }

    if (guard === false) {
      return;
    }

    // Function guard → evaluate
    let result: boolean | Promise<boolean>;
    try {
      result = guard(target);
    } catch (error) {
      console.error('NgpOverlayRegistry: dismiss guard threw', error);
      return;
    }

    if (typeof result === 'boolean') {
      if (result) {
        dismiss();
      }
    } else {
      // Promise — track as pending to prevent re-triggering
      this.pendingGuardIds.add(overlayId);
      result
        .then(shouldDismiss => {
          if (shouldDismiss) {
            dismiss();
          }
        })
        .catch(error => {
          console.error('NgpOverlayRegistry: dismiss guard rejected', error);
        })
        .finally(() => {
          this.pendingGuardIds.delete(overlayId);
        });
    }
  }
}
