import { signal, Signal } from '@angular/core';
import { injectDisposables } from 'ng-primitives/utils';
import { HOVER_BRIDGE_TIMEOUT_MS } from './hover-bridge';

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

export interface HoverTransitDeclineOptions {
  /** Whether a sibling's corridor currently owns the transit. */
  isBlocked: () => boolean;
  /** Whether the pointer is still over this trigger when the retry fires. */
  isPointerOverTrigger: Signal<boolean>;
  /** Open this trigger's overlay. */
  show: () => void;
}

/**
 * Builds the hover-decline check a trigger runs before opening. Call it from
 * the state factory; the returned function goes in the pointerenter handler and
 * reports whether the hover was declined.
 *
 * A hover that arrives while a sibling's corridor is in flight is declined and
 * retried once that corridor has had time to end - the pointer may have
 * genuinely landed here rather than passing through, and a declined enter is
 * never re-delivered on its own.
 */
export function createHoverTransitDecline({
  isBlocked,
  isPointerOverTrigger,
  show,
}: HoverTransitDeclineOptions): () => boolean {
  const disposables = injectDisposables();
  let cancelPendingRetry: (() => void) | undefined = undefined;

  return () => {
    if (!isBlocked()) {
      return false;
    }

    // Only the newest retry is worth keeping - pointer jitter over a blocked
    // trigger would otherwise stack one per enter for the whole blocked window.
    cancelPendingRetry?.();

    cancelPendingRetry = disposables.setTimeout(() => {
      cancelPendingRetry = undefined;

      if (isPointerOverTrigger() && !isBlocked()) {
        show();
      }
    }, HOVER_BRIDGE_TIMEOUT_MS);

    return true;
  };
}
