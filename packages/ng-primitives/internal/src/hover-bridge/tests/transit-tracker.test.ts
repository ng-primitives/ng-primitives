import { createHoverTransitTracker } from 'ng-primitives/internal';
import { describe, expect, it } from 'vitest';

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
