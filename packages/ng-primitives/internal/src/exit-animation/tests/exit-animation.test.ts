import { describe, expect, it } from 'vitest';
import { setupExitAnimation } from '../exit-animation';

describe('setupExitAnimation', () => {
  /**
   * A fake animation whose `finished` promise is controllable. `endTime` feeds
   * the defensive fallback timeout; it defaults to a large value so tests that
   * exercise `finished` are never resolved early by the fallback.
   */
  function finiteAnimation(endTime = 100_000): {
    animation: Animation;
    finish: () => void;
    fail: (reason: unknown) => void;
  } {
    let finish!: () => void;
    let fail!: (reason: unknown) => void;
    const finished = new Promise<void>((resolve, reject) => {
      finish = resolve;
      fail = reject;
    });
    // Prevent an unhandled rejection warning; the code under test observes it.
    finished.catch(() => undefined);
    const animation = {
      finished,
      cancel: () => undefined,
      effect: { getComputedTiming: () => ({ iterations: 1, endTime }) },
    } as unknown as Animation;
    return { animation, finish, fail };
  }

  /** A fake animation that repeats forever, so `finished` never resolves. */
  function infiniteAnimation(): Animation {
    return {
      finished: new Promise<void>(() => undefined),
      cancel: () => undefined,
      effect: { getComputedTiming: () => ({ iterations: Infinity }) },
    } as unknown as Animation;
  }

  it('marks the element with data-exit when exiting', async () => {
    const element = document.createElement('div');
    element.getAnimations = () => [];

    const ref = setupExitAnimation({ element, immediate: true });
    await ref.exit();

    expect(element).toHaveAttribute('data-exit');
    expect(element).not.toHaveAttribute('data-enter');
  });

  it('waits for the exit animations to finish before resolving', async () => {
    const element = document.createElement('div');
    const { animation, finish } = finiteAnimation();
    element.getAnimations = () => [animation];

    const ref = setupExitAnimation({ element, immediate: true });

    let settled = false;
    const exit = ref.exit().then(() => (settled = true));

    // Give any synchronous/microtask resolution a chance to run.
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(settled).toBe(false);

    finish();
    await exit;
    expect(settled).toBe(true);
  });

  it('resolves without waiting when the only animation runs forever', async () => {
    const element = document.createElement('div');
    // If the exit waited on the infinite animation's `finished` promise, this
    // test would time out and the overlay would be stuck on screen.
    element.getAnimations = () => [infiniteAnimation()];

    const ref = setupExitAnimation({ element, immediate: true });

    await expect(ref.exit()).resolves.toBeUndefined();
    expect(element).toHaveAttribute('data-exit');
  });

  it('waits for finite animations while ignoring infinite ones', async () => {
    const element = document.createElement('div');
    const { animation, finish } = finiteAnimation();
    element.getAnimations = () => [infiniteAnimation(), animation];

    const ref = setupExitAnimation({ element, immediate: true });

    let settled = false;
    const exit = ref.exit().then(() => (settled = true));

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(settled).toBe(false);

    finish();
    await exit;
    expect(settled).toBe(true);
  });

  it('resolves (never rejects) when an animation fails, so teardown still happens', async () => {
    const element = document.createElement('div');
    const { animation, fail } = finiteAnimation();
    element.getAnimations = () => [animation];

    const ref = setupExitAnimation({ element, immediate: true });
    const exit = ref.exit();

    // A non-AbortError rejection must not propagate - it would otherwise trap the
    // overlay in the DOM forever when `detach()` awaits this promise.
    fail(new Error('boom'));

    await expect(exit).resolves.toBeUndefined();
  });

  it('resolves on AbortError (element removed mid-animation)', async () => {
    const element = document.createElement('div');
    const { animation, fail } = finiteAnimation();
    element.getAnimations = () => [animation];

    const ref = setupExitAnimation({ element, immediate: true });
    const exit = ref.exit();

    fail(Object.assign(new Error('aborted'), { name: 'AbortError' }));

    await expect(exit).resolves.toBeUndefined();
  });

  it('falls back to a timeout when `finished` never settles', async () => {
    const element = document.createElement('div');
    // A finite (non-infinite) animation whose `finished` never resolves - e.g. a
    // paused animation. The short endTime keeps the fallback fast for the test.
    const { animation } = finiteAnimation(10);
    element.getAnimations = () => [animation];

    const ref = setupExitAnimation({ element, immediate: true });

    // Should resolve via the fallback timeout (endTime + buffer) rather than hang.
    await expect(ref.exit()).resolves.toBeUndefined();
  });

  it('resolves immediately when the environment cannot run animations (SSR)', async () => {
    const element = document.createElement('div');
    // Simulate a non-DOM environment where getAnimations is unavailable.
    (element as unknown as { getAnimations?: unknown }).getAnimations = undefined;

    const ref = setupExitAnimation({ element, immediate: true });

    await expect(ref.exit()).resolves.toBeUndefined();
    expect(element).toHaveAttribute('data-exit');
  });

  /** An animation whose `finished` rejects with AbortError when cancelled, like real WAAPI. */
  function abortableAnimation(): Animation {
    let reject!: (reason: unknown) => void;
    const finished = new Promise<void>((_, r) => (reject = r));
    finished.catch(() => undefined);
    return {
      finished,
      cancel: () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
      effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
    } as unknown as Animation;
  }

  /** A finite animation whose `finished` never settles - only the fallback timer can resolve it. */
  function neverSettlingAnimation(endTime: number): Animation {
    return {
      finished: new Promise<void>(() => undefined),
      cancel: () => undefined,
      effect: { getComputedTiming: () => ({ iterations: 1, endTime }) },
    } as unknown as Animation;
  }

  it('a superseded cycle does not clobber the new cycle (exit → cancel → exit)', async () => {
    const element = document.createElement('div');
    const first = abortableAnimation();
    element.getAnimations = () => [first];

    const ref = setupExitAnimation({ element, immediate: true });

    // Cycle 1: exit then cancel. cancel() rejects `first.finished` asynchronously,
    // so cycle 1's Promise.allSettled(...).then(settle) is still pending.
    const exit1 = ref.exit();
    ref.cancel();

    // Cycle 2 starts synchronously (portal cancelDetach → detach → exit again on the
    // same ref) BEFORE microtasks flush, so cycle 1's late settle() runs while cycle 2
    // owns the shared state. Cycle 2's animation never settles, so it can only resolve
    // via the fallback timer - which a stale settle() would wrongly clear.
    const stuck = neverSettlingAnimation(10);
    element.getAnimations = () => [stuck];
    const exit2 = ref.exit();

    // exit2 must still resolve (via its fallback timer), proving the timer survived.
    await expect(exit2).resolves.toBeUndefined();
    await exit1;
  });

  it('cancel() returns to the enter state and resolves a pending exit', async () => {
    const element = document.createElement('div');
    const { animation } = finiteAnimation();
    element.getAnimations = () => [animation];

    const ref = setupExitAnimation({ element, immediate: true });
    const exit = ref.exit();
    expect(element).toHaveAttribute('data-exit');

    ref.cancel();

    await expect(exit).resolves.toBeUndefined();
    expect(element).toHaveAttribute('data-enter');
    expect(element).not.toHaveAttribute('data-exit');
  });
});
