import { DrawerVelocityTracker } from './velocity';

describe('DrawerVelocityTracker', () => {
  it('reports total and recent velocity with minimum durations', () => {
    const tracker = new DrawerVelocityTracker();
    tracker.add({ x: 0, y: 0, time: 0 });
    tracker.add({ x: 0, y: 20, time: 40 });
    tracker.add({ x: 0, y: 60, time: 60 });
    expect(tracker.read({ x: 0, y: 60, time: 60 })).toEqual({
      total: { x: 0, y: 1 },
      recent: { x: 0, y: 2 },
    });
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
    expect(tracker.read({ x: 0, y: 0, time: 10 }).total).toEqual({ x: 0, y: 0 });
    tracker.reset();
    expect(tracker.read({ x: 0, y: 0, time: 20 }).total).toEqual({ x: 0, y: 0 });
  });
});
