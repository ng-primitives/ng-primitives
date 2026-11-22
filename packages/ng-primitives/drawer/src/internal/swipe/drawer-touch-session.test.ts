import { describe, expect, it } from 'vitest';
import { DrawerTouchSession } from './drawer-touch-session';

describe('DrawerTouchSession', () => {
  it('normalizes one owned touch through start, move, and end', () => {
    const session = new DrawerTouchSession();
    const start = touchEvent('touchstart', [touch(7, 10, 20)], [], 100);
    const move = touchEvent('touchmove', [touch(7, 15, 30)], [], 200);
    const end = touchEvent('touchend', [], [touch(7, 18, 40)], 300);

    expect(session.start(start)).toEqual({ x: 10, y: 20, time: 100, nativeEvent: start });
    expect(session.move(move)).toEqual({ x: 15, y: 30, time: 200, nativeEvent: move });
    expect(session.end(end)).toEqual({ x: 18, y: 40, time: 300, nativeEvent: end });
    expect(session.active).toBe(false);
  });

  it('uses changedTouches after the active touches list is empty', () => {
    const session = new DrawerTouchSession();
    session.start(touchEvent('touchstart', [touch(3, 1, 2)]));
    const end = touchEvent('touchend', [], [touch(3, 4, 5)]);

    expect(session.end(end)).toMatchObject({ x: 4, y: 5 });
  });

  it('ignores unrelated identifiers without releasing the owned touch', () => {
    const session = new DrawerTouchSession();
    session.start(touchEvent('touchstart', [touch(3, 1, 2)]));

    expect(session.move(touchEvent('touchmove', [touch(4, 4, 5)]))).toBeNull();
    expect(session.end(touchEvent('touchend', [], [touch(4, 4, 5)]))).toBeNull();
    expect(session.active).toBe(true);
  });

  it('rejects multi-touch starts and a second start while active', () => {
    const session = new DrawerTouchSession();

    expect(session.start(touchEvent('touchstart', [touch(1, 0, 0), touch(2, 1, 1)]))).toBeNull();
    expect(session.active).toBe(false);
    expect(session.start(touchEvent('touchstart', [touch(1, 0, 0)]))).not.toBeNull();
    expect(session.start(touchEvent('touchstart', [touch(2, 1, 1)]))).toBeNull();
  });

  it('cancels the owned touch and resets idempotently', () => {
    const session = new DrawerTouchSession();
    session.start(touchEvent('touchstart', [touch(5, 0, 0)]));
    const cancel = touchEvent('touchcancel', [], [touch(5, 2, 3)], 50);

    expect(session.cancel(cancel)).toEqual({ x: 2, y: 3, time: 50, nativeEvent: cancel });
    expect(session.active).toBe(false);
    session.reset();
    session.reset();
    expect(session.active).toBe(false);
  });
});

function touch(identifier: number, clientX: number, clientY: number): Touch {
  return { identifier, clientX, clientY } as Touch;
}

function touchEvent(
  type: string,
  touches: readonly Touch[],
  changedTouches: readonly Touch[] = [],
  timeStamp = 0,
): TouchEvent {
  const event = new Event(type) as TouchEvent;
  Object.defineProperties(event, {
    changedTouches: { value: changedTouches },
    timeStamp: { value: timeStamp },
    touches: { value: touches },
  });
  return event;
}
