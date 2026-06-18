import { Injectable, WritableSignal } from '@angular/core';

/** Interface for overlays that can be closed immediately */
export interface CooldownOverlay {
  hideImmediate(): void;
  /** Optional signal to mark the transition as instant due to cooldown */
  instantTransition?: WritableSignal<boolean>;
  /**
   * Optional check for whether this overlay is a descendant of the given overlay
   * (i.e. its trigger is rendered within the other overlay's content). Used to
   * keep an ancestor open when a nested overlay of the same type is activated.
   */
  isDescendantOf?(other: CooldownOverlay): boolean;
}

/**
 * Singleton service that tracks close timestamps and active overlays per overlay type.
 * This enables the cooldown feature where quickly moving between triggers
 * of the same overlay type (e.g., tooltip to tooltip) shows the second
 * overlay immediately without the showDelay, and closes the first immediately.
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class NgpOverlayCooldownManager {
  private readonly lastCloseTimestamps = new Map<string, number>();
  /**
   * Active overlays per type, stored as a stack ordered oldest-first / topmost-last.
   * Most types only ever hold a single overlay, but when an overlay is nested inside
   * another of the same type (e.g. a popover whose trigger lives inside another
   * popover) the child is pushed on top of its ancestor instead of evicting it.
   * Closing the child then restores the ancestor as the active overlay.
   */
  private readonly activeOverlays = new Map<string, CooldownOverlay[]>();

  /**
   * Record the close timestamp for an overlay type.
   * @param overlayType The type identifier for the overlay group
   */
  recordClose(overlayType: string): void {
    this.lastCloseTimestamps.set(overlayType, Date.now());
  }

  /**
   * Check if the overlay type is within its cooldown period.
   * @param overlayType The type identifier for the overlay group
   * @param duration The cooldown duration in milliseconds
   * @returns true if within cooldown period, false otherwise
   */
  isWithinCooldown(overlayType: string, duration: number): boolean {
    const lastClose = this.lastCloseTimestamps.get(overlayType);
    if (lastClose === undefined) {
      return false;
    }
    return Date.now() - lastClose < duration;
  }

  /**
   * Register an overlay as active for its type.
   *
   * Any existing overlay of the same type is closed immediately so that only one
   * overlay of each type is open at a time - *unless* it is an ancestor of the
   * overlay being registered. A nested overlay (its trigger rendered inside an
   * ancestor overlay's content) is stacked on top of its ancestor instead of
   * evicting it, allowing legitimate nesting to coexist while sibling overlays
   * still replace one another.
   *
   * @param overlayType The type identifier for the overlay group
   * @param overlay The overlay instance
   * @param cooldown The cooldown duration - if > 0, enables instant transitions
   */
  registerActive(overlayType: string, overlay: CooldownOverlay, cooldown: number): void {
    const stack = this.activeOverlays.get(overlayType) ?? [];

    if (stack.includes(overlay)) {
      return;
    }

    // Evict overlays from the top of the stack until we reach the overlay itself
    // or one of its ancestors (or the stack empties). Ancestors are preserved so
    // nested same-type overlays can coexist; peers are closed immediately.
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      if (overlay.isDescendantOf?.(top)) {
        break;
      }
      if (top.isDescendantOf?.(overlay)) {
        const firstDescendantIndex = stack.findIndex(entry => entry.isDescendantOf?.(overlay));
        stack.splice(firstDescendantIndex, 0, overlay);
        this.activeOverlays.set(overlayType, stack);
        return;
      }
      stack.pop();
      // Enable instant transition only if cooldown is active
      if (cooldown > 0) {
        top.instantTransition?.set(true);
      }
      top.hideImmediate();
    }

    // Push as the topmost active overlay, avoiding a duplicate entry if it is
    // already there (e.g. re-registering after a cancelled destruction).
    if (stack[stack.length - 1] !== overlay) {
      stack.push(overlay);
    }

    this.activeOverlays.set(overlayType, stack);
  }

  /**
   * Unregister an overlay when it closes.
   * @param overlayType The type identifier for the overlay group
   * @param overlay The overlay instance to remove
   */
  unregisterActive(overlayType: string, overlay: CooldownOverlay): void {
    const stack = this.activeOverlays.get(overlayType);
    if (!stack) {
      return;
    }

    const index = stack.indexOf(overlay);
    if (index !== -1) {
      stack.splice(index, 1);
    }

    if (stack.length === 0) {
      this.activeOverlays.delete(overlayType);
    }
  }

  /**
   * Check if there's an active overlay of the given type.
   * @param overlayType The type identifier for the overlay group
   * @returns true if there's an active overlay, false otherwise
   */
  hasActiveOverlay(overlayType: string): boolean {
    const stack = this.activeOverlays.get(overlayType);
    return stack !== undefined && stack.length > 0;
  }
}
