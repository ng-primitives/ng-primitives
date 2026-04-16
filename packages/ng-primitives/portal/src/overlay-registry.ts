import { FocusOrigin } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import { inject, Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

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
  /** If true, clicks on the trigger element are treated as outside clicks */
  treatTriggerClickAsOutside?: boolean;
  /** Optional subject that receives pointer events that occur outside the overlay */
  outsidePointerEvents$?: Subject<MouseEvent>;
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
  private removeOutsidePointerListeners?: () => void;

  /** Tracks the pointerdown target for CDK-compatible outside pointer event dispatch */
  private pointerDownTarget: EventTarget | null = null;

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

      // CDK-compatible outside pointer event dispatch:
      // Track pointerdown origin, then emit click/auxclick/contextmenu events
      // to entries that have an outsidePointerEvents$ subject.
      const onPointerDown = (event: PointerEvent) => {
        this.pointerDownTarget = this.getComposedTarget(event);
      };

      const onPointerEvent = (event: MouseEvent) => this.handleOutsidePointerEvent(event);

      this.document.addEventListener('pointerdown', onPointerDown, true);
      this.document.addEventListener('click', onPointerEvent, true);
      this.document.addEventListener('auxclick', onPointerEvent, true);
      this.document.addEventListener('contextmenu', onPointerEvent, true);

      this.removeOutsidePointerListeners = () => {
        this.document.removeEventListener('pointerdown', onPointerDown, true);
        this.document.removeEventListener('click', onPointerEvent, true);
        this.document.removeEventListener('auxclick', onPointerEvent, true);
        this.document.removeEventListener('contextmenu', onPointerEvent, true);
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
  }

  /**
   * Outside-click dismiss: checks all overlays (not just the topmost) and
   * dismisses every overlay tree where the click landed outside.
   *
   * This handles the case where a non-dismissable overlay (e.g. a tooltip) is
   * topmost but other overlays (e.g. a popover) should still be dismissed.
   */
  private handleOutsideClick(event: MouseEvent): void {
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
    const { clientWidth, clientHeight } = this.document.documentElement;
    if (
      clientWidth > 0 &&
      clientHeight > 0 &&
      (event.clientX >= clientWidth || event.clientY >= clientHeight)
    ) {
      return;
    }

    const path = event.composedPath();

    // Step 1: Build a set of overlay IDs where the click is "inside"
    const insideIds = new Set<string>();
    for (const entry of this.entries) {
      if (!this.isClickOutsideEntry(entry, path)) {
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
    for (let i = this.entries.length - 1; i >= 0; i--) {
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
    const isInsideAnchor = entry.anchorElement ? path.includes(entry.anchorElement) : false;
    return !(isInsideElements || isInsideTrigger || isInsideAnchor);
  }

  /**
   * Escape-key dismiss: only the topmost overlay responds.
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
