import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForDrawerTransition } from './transition-coordinator';

type StyleLists = Partial<
  Pick<
    CSSStyleDeclaration,
    | 'transitionProperty'
    | 'transitionDuration'
    | 'transitionDelay'
    | 'animationName'
    | 'animationDuration'
    | 'animationDelay'
    | 'animationIterationCount'
  >
>;

/** A document whose view has no `requestAnimationFrame`, so every wait runs on fake timers. */
function fakeDocument(style: StyleLists = {}): Document {
  const computed = {
    transitionProperty: '',
    transitionDuration: '',
    transitionDelay: '',
    animationName: '',
    animationDuration: '',
    animationDelay: '',
    animationIterationCount: '',
    ...style,
  };
  return {
    defaultView: {
      getComputedStyle: () => computed,
      setTimeout: (handler: () => void, timeout: number) => setTimeout(handler, timeout),
    },
  } as unknown as Document;
}

/** An element without `getAnimations`, forcing the computed-style fallback. */
function legacyElement(): HTMLElement {
  return {} as HTMLElement;
}

function animatedElement(animations: Animation[]): HTMLElement {
  return { getAnimations: () => animations } as unknown as HTMLElement;
}

function animation(endTime: number, finished: Promise<void> = new Promise(() => undefined)) {
  return {
    finished,
    effect: { getComputedTiming: () => ({ endTime }) },
  } as unknown as Animation;
}

/** Asserts the wait is still pending just before `time` ms and has settled at `time`. */
async function expectSettlesAt(
  elements: HTMLElement[],
  document: Document,
  time: number,
): Promise<void> {
  let settled = false;
  void waitForDrawerTransition(elements, document).then(() => (settled = true));
  if (time > 0) {
    await vi.advanceTimersByTimeAsync(time - 1);
    expect(settled).toBe(false);
  }
  await vi.advanceTimersByTimeAsync(time > 0 ? 1 : 0);
  expect(settled).toBe(true);
}

describe('waitForDrawerTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('without Web Animations', () => {
    it('waits out every iteration of an animation', async () => {
      const document = fakeDocument({
        animationName: 'slide',
        animationDuration: '100ms',
        animationIterationCount: '3',
      });
      // 300ms of animation plus the two-frame slack.
      await expectSettlesAt([legacyElement()], document, 334);
    });

    it('ignores an infinite animation instead of waiting forever', async () => {
      const document = fakeDocument({
        animationName: 'pulse, slide',
        animationDuration: '1s, 200ms',
        animationIterationCount: 'infinite, 1',
      });
      await expectSettlesAt([legacyElement()], document, 234);
    });

    it('repeats the shorter duration list when delays outnumber durations', async () => {
      const document = fakeDocument({
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: '100ms',
        transitionDelay: '0s, 0s, 400ms',
      });
      // The third transition reuses the 100ms duration after its 400ms delay.
      await expectSettlesAt([legacyElement()], document, 534);
    });

    it('drops list entries beyond the declared effects', async () => {
      const document = fakeDocument({
        transitionProperty: 'opacity',
        transitionDuration: '100ms, 900ms',
      });
      await expectSettlesAt([legacyElement()], document, 134);
    });

    it('skips animations named none', async () => {
      const document = fakeDocument({
        animationName: 'none',
        animationDuration: '500ms',
      });
      await expectSettlesAt([legacyElement()], document, 0);
    });
  });

  describe('with Web Animations', () => {
    it('settles when every animation finishes', async () => {
      let finish!: () => void;
      const finished = new Promise<void>(resolve => (finish = resolve));
      const element = animatedElement([animation(1000, finished)]);
      let settled = false;
      void waitForDrawerTransition([element], fakeDocument()).then(() => (settled = true));

      await vi.advanceTimersByTimeAsync(100);
      expect(settled).toBe(false);
      finish();
      await vi.advanceTimersByTimeAsync(0);
      expect(settled).toBe(true);
    });

    it('stops waiting on a paused animation after its end time', async () => {
      const element = animatedElement([animation(200), animation(300)]);
      // The longest end time plus the safety buffer.
      await expectSettlesAt([element], fakeDocument(), 350);
    });

    it('does not wait on an infinite animation', async () => {
      const element = animatedElement([animation(Infinity)]);
      await expectSettlesAt([element], fakeDocument(), 0);
    });
  });
});
