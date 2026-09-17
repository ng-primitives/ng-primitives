import {
  createEnvironmentInjector,
  EnvironmentInjector,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  createHoverTransitDecline,
  createHoverTransitTracker,
  HOVER_BRIDGE_TIMEOUT_MS,
} from 'ng-primitives/internal';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('createHoverTransitTracker', () => {
  const triggerA = document.createElement('button');
  const triggerB = document.createElement('button');

  it('blocks nobody while no corridor is in flight', () => {
    const tracker = createHoverTransitTracker();

    expect(tracker.isTransitBlocked(triggerA)).toBe(false);
    expect(tracker.isTransitBlocked(triggerB)).toBe(false);
  });

  it('blocks the siblings of the trigger that claimed the transit, but not itself', () => {
    const tracker = createHoverTransitTracker();

    tracker.setTransitSource(triggerA);

    expect(tracker.isTransitBlocked(triggerB)).toBe(true);
    expect(tracker.isTransitBlocked(triggerA)).toBe(false);
  });

  it('releases the block when the claiming trigger clears it', () => {
    const tracker = createHoverTransitTracker();

    tracker.setTransitSource(triggerA);
    tracker.clearTransitSource(triggerA);

    expect(tracker.isTransitBlocked(triggerB)).toBe(false);
  });

  it('ignores a release from a trigger that does not own the transit', () => {
    const tracker = createHoverTransitTracker();

    tracker.setTransitSource(triggerA);
    // An older corridor tearing down late must not lift a newer one's block.
    tracker.clearTransitSource(triggerB);

    expect(tracker.isTransitBlocked(triggerB)).toBe(true);
  });

  it('hands the transit to the newer corridor when one starts before the last cleared', () => {
    const tracker = createHoverTransitTracker();

    tracker.setTransitSource(triggerA);
    tracker.setTransitSource(triggerB);
    tracker.clearTransitSource(triggerA);

    // A's late teardown is a no-op; B still owns it.
    expect(tracker.isTransitBlocked(triggerA)).toBe(true);
    expect(tracker.isTransitBlocked(triggerB)).toBe(false);
  });
});

describe('createHoverTransitDecline', () => {
  afterEach(() => vi.useRealTimers());

  function setup() {
    const env = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const blocked = signal(true);
    const pointerOverTrigger = signal(true);
    const show = vi.fn();

    const decline = runInInjectionContext(env, () =>
      createHoverTransitDecline({
        isBlocked: () => blocked(),
        isPointerOverTrigger: pointerOverTrigger,
        show,
      }),
    );

    return { decline, blocked, pointerOverTrigger, show, destroy: () => env.destroy() };
  }

  it('does not decline a hover while nothing owns the transit', () => {
    const { decline, blocked, destroy } = setup();
    blocked.set(false);

    expect(decline()).toBe(false);
    destroy();
  });

  it('declines the hover and retries it once the transit clears', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { decline, blocked, show, destroy } = setup();

    expect(decline()).toBe(true);
    blocked.set(false);
    vi.advanceTimersByTime(HOVER_BRIDGE_TIMEOUT_MS);

    expect(show).toHaveBeenCalledTimes(1);
    destroy();
  });

  it('drops the retry when the pointer has moved off the trigger', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { decline, blocked, pointerOverTrigger, show, destroy } = setup();

    decline();
    blocked.set(false);
    pointerOverTrigger.set(false);
    vi.advanceTimersByTime(HOVER_BRIDGE_TIMEOUT_MS);

    expect(show).not.toHaveBeenCalled();
    destroy();
  });

  it('keeps only the newest retry when jitter declines repeatedly', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { decline, blocked, show, destroy } = setup();

    // Pointer jitter over a blocked trigger: without cancelling the previous
    // retry each enter would leave its own timer pending.
    decline();
    decline();
    decline();
    blocked.set(false);
    vi.advanceTimersByTime(HOVER_BRIDGE_TIMEOUT_MS * 2);

    expect(show).toHaveBeenCalledTimes(1);
    destroy();
  });
});
