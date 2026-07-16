import { DrawerSwipeEngine } from './drawer-swipe-engine';

describe('DrawerSwipeEngine', () => {
  it.each([
    ['down', 0, 60],
    ['up', 0, -60],
    ['right', 60, 0],
    ['left', -60, 0],
  ] as const)('dismisses a threshold swipe toward %s', (direction, x, y) => {
    const engine = new DrawerSwipeEngine({ direction: () => direction, size: () => 100 });
    engine.start({ x: 0, y: 0, time: 0, buttons: 1 });
    engine.move({ x, y, time: 60, buttons: 1 });
    expect(engine.release({ x, y, time: 61, buttons: 0 })?.dismissed).toBe(true);
  });

  it('lets cross-axis movement win before the direction locks', () => {
    const canceled = vi.fn();
    const engine = new DrawerSwipeEngine({
      direction: () => 'down',
      size: () => 100,
      onCancel: canceled,
    });
    engine.start({ x: 0, y: 0, time: 0, buttons: 1 });
    expect(engine.move({ x: 10, y: 2, time: 10, buttons: 1 })).toBeNull();
    expect(canceled).toHaveBeenCalledOnce();
  });

  it('locks to opposite primary-axis movement when bidirectional tracking is enabled', () => {
    const canceled = vi.fn();
    const engine = new DrawerSwipeEngine({
      direction: () => 'down',
      allowOppositeDirection: () => true,
      size: () => 100,
      onCancel: canceled,
    });

    engine.start({ x: 0, y: 0, time: 0, buttons: 1 });
    const update = engine.move({ x: 4, y: -40, time: 100, buttons: 1 });
    const release = engine.release({ x: 4, y: -40, time: 101, buttons: 0 });

    expect(update?.rawMovement).toEqual({ x: 4, y: -40 });
    expect(release?.dismissed).toBe(false);
    expect(canceled).not.toHaveBeenCalled();
  });

  it('cancels dismissal after reversing ten pixels', () => {
    const engine = new DrawerSwipeEngine({ direction: () => 'down', size: () => 100 });
    engine.start({ x: 0, y: 0, time: 0, buttons: 1 });
    engine.move({ x: 0, y: 70, time: 100, buttons: 1 });
    engine.move({ x: 0, y: 55, time: 200, buttons: 1 });
    expect(engine.release({ x: 0, y: 55, time: 210, buttons: 0 })?.dismissed).toBe(false);
  });

  it('commits a one-move buttons-zero flick once', () => {
    const release = vi.fn();
    const engine = new DrawerSwipeEngine({
      direction: () => 'down',
      size: () => 200,
      onRelease: release,
    });
    engine.start({ x: 0, y: 0, time: 0, buttons: 1 });
    engine.move({ x: 0, y: 30, time: 20, buttons: 0 });
    engine.release({ x: 0, y: 30, time: 21, buttons: 0 });
    expect(release).toHaveBeenCalledOnce();
    expect(release.mock.calls[0][0].dismissed).toBe(true);
  });

  it('preserves the last useful velocity through a stationary release', () => {
    const engine = new DrawerSwipeEngine({ direction: () => 'down', size: () => 400 });
    engine.start({ x: 0, y: 0, time: 0, buttons: 1 });
    engine.move({ x: 0, y: -30, time: 200, buttons: 1 });
    engine.move({ x: 0, y: -80, time: 300, buttons: 1 });

    const release = engine.release({ x: 0, y: -80, time: 330, buttons: 0 });

    expect(release?.velocity.recent.y).toBe(-0.5);
  });

  it('rejects non-primary starts and restores state on destroy', () => {
    const canceled = vi.fn();
    const engine = new DrawerSwipeEngine({
      direction: () => 'right',
      size: () => 100,
      onCancel: canceled,
    });
    expect(engine.start({ x: 0, y: 0, time: 0, buttons: 2 })).toBe(false);
    expect(engine.start({ x: 0, y: 0, time: 0, buttons: 1 })).toBe(true);
    engine.destroy();
    expect(engine.active).toBe(false);
    expect(canceled).toHaveBeenCalledOnce();
  });

  it('reads size once for any number of moves and release', () => {
    const size = vi.fn(() => 200);
    const engine = new DrawerSwipeEngine({ direction: () => 'down', size });

    engine.start({ x: 0, y: 0, time: 0, buttons: 1 });
    for (let index = 1; index <= 20; index += 1) {
      engine.move({ x: 0, y: index, time: index * 10, buttons: 1 });
    }
    engine.release({ x: 0, y: 20, time: 201, buttons: 0 });

    expect(size).toHaveBeenCalledOnce();
  });

  it('refreshes the active gesture size explicitly', () => {
    let currentSize = 100;
    const size = vi.fn(() => currentSize);
    const engine = new DrawerSwipeEngine({ direction: () => 'down', size });

    engine.start({ x: 0, y: 0, time: 0, buttons: 1 });
    expect(engine.move({ x: 0, y: 50, time: 100, buttons: 1 })?.progress).toBe(0.5);

    currentSize = 200;
    expect(engine.refreshSize()).toBe(200);
    expect(engine.move({ x: 0, y: 50, time: 200, buttons: 1 })?.progress).toBe(0.25);
    expect(size).toHaveBeenCalledTimes(2);
  });

  it('rebases an active gesture without restarting it or retaining the absorbed velocity', () => {
    const onStart = vi.fn();
    const engine = new DrawerSwipeEngine({
      direction: () => 'down',
      size: () => 200,
      onStart,
    });

    engine.start({ x: 0, y: 0, time: 0, buttons: 1 });
    expect(engine.rebase({ x: 0, y: 80, time: 100, buttons: 1 })).toBe(true);
    expect(engine.move({ x: 0, y: 80, time: 100, buttons: 1 })?.displacement).toBe(0);
    expect(engine.move({ x: 0, y: 100, time: 200, buttons: 1 })?.displacement).toBe(20);

    const release = engine.release({ x: 0, y: 100, time: 201, buttons: 0 });

    expect(onStart).toHaveBeenCalledOnce();
    expect(release?.velocity.total.y).toBeCloseTo(0.2);
    expect(release?.velocity.recent.y).toBeCloseTo(0.2);
  });

  it('rebases axis lock and maximum displacement while preserving the cached size', () => {
    const size = vi.fn(() => 200);
    const engine = new DrawerSwipeEngine({ direction: () => 'down', size });

    engine.start({ x: 0, y: 0, time: 0, buttons: 1 });
    engine.move({ x: 0, y: 30, time: 50, buttons: 1 });
    expect(engine.rebase({ x: 10, y: 80, time: 100, buttons: 1 })).toBe(true);
    expect(engine.move({ x: 10, y: 100, time: 200, buttons: 1 })?.progress).toBe(0.1);
    expect(engine.release({ x: 10, y: 95, time: 210, buttons: 0 })?.dismissed).toBe(false);
    expect(size).toHaveBeenCalledOnce();
  });

  it('does not rebase an inactive or released gesture', () => {
    const engine = new DrawerSwipeEngine({ direction: () => 'down', size: () => 100 });

    expect(engine.rebase({ x: 0, y: 10, time: 10 })).toBe(false);
    engine.start({ x: 0, y: 0, time: 0 });
    engine.release({ x: 0, y: 50, time: 100 });
    expect(engine.rebase({ x: 0, y: 60, time: 110 })).toBe(false);
  });

  it('reads fresh size after cancellation and destruction', () => {
    let currentSize = 100;
    const size = vi.fn(() => currentSize);
    const engine = new DrawerSwipeEngine({ direction: () => 'down', size });

    engine.start({ x: 0, y: 0, time: 0, buttons: 1 });
    engine.cancel();
    currentSize = 200;
    engine.start({ x: 0, y: 0, time: 100, buttons: 1 });
    expect(engine.move({ x: 0, y: 50, time: 200, buttons: 1 })?.progress).toBe(0.25);
    engine.destroy();
    currentSize = 400;
    engine.start({ x: 0, y: 0, time: 300, buttons: 1 });
    expect(engine.move({ x: 0, y: 50, time: 400, buttons: 1 })?.progress).toBe(0.125);

    expect(size).toHaveBeenCalledTimes(3);
  });
});
