import { DrawerVelocityTracker } from './velocity';

describe('DrawerVelocityTracker', () => {
  it('reports total and recent velocity', () => {
    const tracker = new DrawerVelocityTracker();
    tracker.add({ x: 0, y: 0, time: 0 });
    tracker.add({ x: 0, y: 20, time: 40 });
    tracker.add({ x: 0, y: 60, time: 60 });
    expect(tracker.read({ x: 0, y: 60, time: 60 })).toEqual({
      total: { x: 0, y: 1 },
      recent: { x: 0, y: 2 },
    });
  });

  it('clamps sub-minimum intervals to the minimum durations', () => {
    const tracker = new DrawerVelocityTracker();
    tracker.add({ x: 0, y: 0, time: 0 });
    // 10ms is below both the 16ms release and 50ms total minimums.
    tracker.add({ x: 0, y: 4, time: 10 });
    expect(tracker.read({ x: 0, y: 4, time: 10 })).toEqual({
      total: { x: 0, y: 4 / 50 },
      recent: { x: 0, y: 4 / 16 },
    });
    // The release sample's own short interval is clamped too.
    expect(tracker.read({ x: 0, y: 8, time: 20 }).recent).toEqual({ x: 0, y: 4 / 16 });
  });

  it('discards stale recent velocity', () => {
    const tracker = new DrawerVelocityTracker();
    tracker.add({ x: 0, y: 0, time: 0 });
    tracker.add({ x: 40, y: 0, time: 50 });
    expect(tracker.read({ x: 40, y: 0, time: 131 }).recent).toEqual({ x: 0, y: 0 });
  });

  it('ignores out-of-order samples and resets deterministically', () => {
    const tracker = new DrawerVelocityTracker();
    tracker.add({ x: 0, y: 0, time: 10 });
    tracker.add({ x: 100, y: 0, time: 5 });
    // Had the earlier sample been accepted, the release would read as a fast move back to x=0.
    expect(tracker.read({ x: 0, y: 0, time: 10 }).recent).toEqual({ x: 0, y: 0 });
    tracker.reset();
    expect(tracker.read({ x: 50, y: 0, time: 20 })).toEqual({
      total: { x: 0, y: 0 },
      recent: { x: 0, y: 0 },
    });
  });
});
