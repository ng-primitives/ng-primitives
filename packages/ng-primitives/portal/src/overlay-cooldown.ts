import { Injectable } from '@angular/core';

/** Interface for overlays that can be closed immediately */
export interface CooldownOverlay {
  hideImmediate(): void;
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
   * If another overlay of the same type is already active, it will be closed immediately.
   * @param overlayType The type identifier for the overlay group
   * @param overlay The overlay instance
   * @param cooldown The cooldown duration - only close previous if within cooldown
   */
  registerActive(overlayType: string, overlay: CooldownOverlay, cooldown: number): void {
    const existing = this.activeOverlays.get(overlayType);

    // Set the new overlay as active FIRST before closing the old one
    this.activeOverlays.set(overlayType, overlay);

    // Then close the old one if within cooldown
    if (existing && existing !== overlay && cooldown > 0) {
      if (this.isWithinCooldown(overlayType, cooldown)) {
        // Defer the close to next microtask to allow the new overlay to finish creating
        queueMicrotask(() => existing.hideImmediate());
      }
    }
  }

  /**
   * Unregister an overlay when it closes.
   * @param overlayType The type identifier for the overlay group
   * @param overlay The overlay instance (only unregisters if it matches)
   */
  unregisterActive(overlayType: string, overlay: CooldownOverlay): void {
    if (this.activeOverlays.get(overlayType) === overlay) {
      this.activeOverlays.delete(overlayType);
    }
  }
}
