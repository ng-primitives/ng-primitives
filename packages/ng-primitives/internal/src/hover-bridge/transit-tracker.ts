import { signal } from '@angular/core';

export interface HoverTransitTracker {
  /** @internal */
  setTransitSource(trigger: HTMLElement): void;
  /** @internal */
  clearTransitSource(trigger: HTMLElement): void;
  /** @internal */
  isTransitBlocked(trigger: HTMLElement): boolean;
}

/**
 * Tracks which sibling currently owns a hover corridor so the others can
 * decline an enter the browser had already resolved before the corridor's
 * pointer-events suppression applied. Lives on whichever element holds the
 * siblings - a trigger group for root triggers, the panel itself for submenus.
 */
export function createHoverTransitTracker(): HoverTransitTracker {
  const source = signal<HTMLElement | null>(null);

  return {
    setTransitSource: trigger => source.set(trigger),
    clearTransitSource: trigger => {
      // Only the trigger that claimed the transit may release it, so a newer
      // corridor isn't cleared by an older one tearing down.
      if (source() === trigger) {
        source.set(null);
      }
    },
    isTransitBlocked: trigger => source() !== null && source() !== trigger,
  };
}
