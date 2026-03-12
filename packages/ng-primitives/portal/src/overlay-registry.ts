import { FocusOrigin } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import { inject, Injectable, NgZone } from '@angular/core';

/**
 * A dismiss guard can be a boolean or a callback that returns a boolean (sync or async).
 * - `true` → always dismiss
 * - `false` → never dismiss
 * - `(target) => boolean | Promise<boolean>` → custom logic per interaction
 */
export type NgpDismissGuard<T = Element> = boolean | ((target: T) => boolean | Promise<boolean>);

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
  /** Optional anchor element */
  anchorElement?: HTMLElement | null;
  /** Per-instance dismiss configuration */
  dismissPolicy: NgpDismissPolicy;
}

/**
 * Minimal overlay reference needed by the registry.
 * This avoids a circular dependency with NgpOverlay.
 * @internal
 */
export interface NgpOverlayRef {
  hide(options?: { immediate?: boolean; origin?: FocusOrigin }): void;
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

  /** Ordered list of visible overlay entries (oldest first, newest/topmost last) */
  private readonly entries: NgpOverlayEntry[] = [];

  /** Set of overlay IDs currently evaluating an async dismiss guard */
  private readonly pendingGuardIds = new Set<string>();

  /** Cleanup functions for the centralized document listeners */
  private removeOutsideClickListener?: () => void;
  private removeEscapeKeyListener?: () => void;

  /**
   * Register an overlay as visible. The entry is appended to the end of the list
   * (making it the topmost overlay). Attaches document listeners if this is the
   * first entry.
   */
  register(entry: NgpOverlayEntry): void {
    // Avoid double-registration
    if (this.entries.some(e => e.id === entry.id)) {
      return;
    }
    this.entries.push(entry);

    // Attach listeners when the first overlay registers
    if (this.entries.length === 1) {
      this.attachListeners();
    }
  }

  /**
   * Remove an overlay from the registry.
   * Detaches document listeners if no entries remain.
   */
  deregister(id: string): void {
    const index = this.entries.findIndex(e => e.id === id);
    if (index !== -1) {
      this.entries.splice(index, 1);
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
    const descendants = this.getDescendants(id);
    // Close deepest first to avoid re-entrant issues
    for (let i = descendants.length - 1; i >= 0; i--) {
      descendants[i].overlay.hideImmediate();
    }
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
   * This is useful for auto-detecting the parent overlay when opening a nested overlay
   * (e.g. a dialog opened from inside a popover).
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
    const descendants: NgpOverlayEntry[] = [];
    const ancestorIds = new Set<string>([id]);

    // Walk the list and collect entries whose parentId is in the ancestor set.
    // Because entries are ordered by open time, a child always appears after its parent.
    for (const entry of this.entries) {
      if (entry.parentId !== null && ancestorIds.has(entry.parentId)) {
        descendants.push(entry);
        ancestorIds.add(entry.id);
      }
    }

    return descendants;
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
  }

  /**
   * Outside-click dismiss: only the topmost overlay responds.
   *
   * If the click landed inside the topmost overlay's elements, trigger, or anchor,
   * it is not an outside click. Otherwise, evaluate the topmost overlay's guard
   * and close it if allowed. When it closes, the next overlay becomes topmost
   * and will handle the next outside click — natural "peel off one layer" behavior.
   */
  private handleOutsideClick(event: MouseEvent): void {
    const topmost = this.getTopmost();
    if (!topmost || this.pendingGuardIds.has(topmost.id)) {
      return;
    }

    // Ignore scrollbar clicks — the click lands outside the viewport's client area.
    const { clientWidth, clientHeight } = this.document.documentElement;
    if (
      clientWidth > 0 &&
      clientHeight > 0 &&
      (event.clientX >= clientWidth || event.clientY >= clientHeight)
    ) {
      return;
    }

    // Check if the click is inside the topmost overlay
    const path = event.composedPath();
    const isInsideElements = topmost.getElements().some(el => path.includes(el));
    const isInsideTrigger = path.includes(topmost.triggerElement);
    const isInsideAnchor = topmost.anchorElement ? path.includes(topmost.anchorElement) : false;

    if (isInsideElements || isInsideTrigger || isInsideAnchor) {
      return;
    }

    // Derive a proper Element from the composed path — event.target may not be an Element
    // (e.g. it could be a Text node or the Document). Pick the first Element in the path,
    // falling back to documentElement so guard functions can safely use Element APIs.
    const target =
      (path.find((node): node is Element => node instanceof Element) as Element) ??
      this.document.documentElement;
    this.evaluateGuardAndDismiss(topmost.id, topmost.dismissPolicy.outsidePress, target, () =>
      this.ngZone.run(() => topmost.overlay.hide()),
    );
  }

  /**
   * Escape-key dismiss: only the topmost overlay responds.
   * One overlay per Escape press.
   */
  private handleEscapeKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.isComposing) {
      return;
    }

    const topmost = this.getTopmost();
    if (!topmost || this.pendingGuardIds.has(topmost.id)) {
      return;
    }

    this.evaluateGuardAndDismiss(topmost.id, topmost.dismissPolicy.escapeKey, event, () =>
      this.ngZone.run(() => topmost.overlay.hide({ origin: 'keyboard', immediate: true })),
    );
  }

  /**
   * Evaluate a dismiss guard and call the dismiss function if allowed.
   * Supports boolean values and sync/async guard functions.
   * Tracks pending async guards to prevent re-triggering.
   */
  private evaluateGuardAndDismiss<T>(
    overlayId: string,
    guard: NgpDismissGuard<T>,
    target: T,
    dismiss: () => void,
  ): void {
    // Boolean true or undefined → always dismiss
    if (guard === true || guard === undefined) {
      dismiss();
      return;
    }

    // Boolean false → never dismiss (should be filtered before reaching here)
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
