import { describe, expect, it } from 'vitest';
import { setupExitAnimation } from '../exit-animation';

describe('setupExitAnimation', () => {
  /** A fake animation whose `finished` promise is controllable. */
  function finiteAnimation(): { animation: Animation; finish: () => void } {
    let finish!: () => void;
    const finished = new Promise<void>(resolve => (finish = resolve));
    return { animation: { finished } as unknown as Animation, finish };
  }

  /** A fake animation that repeats forever, so `finished` never resolves. */
  function infiniteAnimation(): Animation {
    return {
      finished: new Promise<void>(() => undefined),
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
});
