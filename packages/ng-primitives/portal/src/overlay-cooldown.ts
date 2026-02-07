import { Injectable, WritableSignal } from '@angular/core';

/** Interface for overlays that can be closed immediately */
export interface CooldownOverlay {
  hideImmediate(): void;
  /** Optional signal to mark the transition as instant due to cooldown */
  instantTransition?: WritableSignal<boolean>;
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
  private readonly activeOverlays = new Map<string, CooldownOverlay>();

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
   * Any existing overlay of the same type will be closed immediately.
   * @param overlayType The type identifier for the overlay group
   * @param overlay The overlay instance
   * @param cooldown The cooldown duration - if > 0, enables instant transitions
   */
  registerActive(overlayType: string, overlay: CooldownOverlay, cooldown: number): void {
    const existing = this.activeOverlays.get(overlayType);

    // If there's an existing overlay and cooldown is enabled, close it immediately.
    // This ensures instant DOM swap when hovering between items of the same type.
    if (existing && existing !== overlay && cooldown > 0) {
      existing.instantTransition?.set(true);
      existing.hideImmediate();
    }

    this.activeOverlays.set(overlayType, overlay);
  }

  /**
   * Unregister an overlay when it closes.
   * @param overlayType The type identifier for the overlay group
   * @param overlay The overlay instance to remove
   */
  unregisterActive(overlayType: string, overlay: CooldownOverlay): void {
    if (this.activeOverlays.get(overlayType) === overlay) {
      this.activeOverlays.delete(overlayType);
    }
  }

  /**
   * Check if there's an active overlay of the given type.
   * @param overlayType The type identifier for the overlay group
   * @returns true if there's an active overlay, false otherwise
   */
  hasActiveOverlay(overlayType: string): boolean {
    return this.activeOverlays.has(overlayType);
  }
}
