import {
  createEnvironmentInjector,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  createHoverBridge,
  HoverBridgeController,
  HoverBridgeOptions,
} from 'ng-primitives/internal';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * A horizontal corridor from a trigger on the left to a panel on the right,
 * matching the fixtures in hover-bridge.test.ts. Reused by every test here so
 * only the options under test vary.
 */
const TRACK_OPTIONS = {
  triggerRect: new DOMRect(0, 0, 40, 20),
  targetRect: new DOMRect(120, 0, 80, 40),
  exitPoint: { x: 40, y: 10 },
};

const INSIDE_CORRIDOR_POINT = { x: 80, y: 10 };
const OUTSIDE_CORRIDOR_POINT = { x: 80, y: 300 };

// The pointerdown guard is registered on the real, shared `document`, so a
// bridge left tracking at the end of a test would otherwise leak its listener
// into every later test in the file.
const activeEnvironments: EnvironmentInjector[] = [];

afterEach(() => {
  activeEnvironments.splice(0).forEach(env => env.destroy());
});

function setup(options: Partial<HoverBridgeOptions> = {}) {
  const env = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
  activeEnvironments.push(env);
  const close = vi.fn();
  const isPointerInAnchor = vi.fn(() => false);

  const bridge: HoverBridgeController = runInInjectionContext(env, () =>
    createHoverBridge({ isPointerInAnchor, close, ...options }),
  );

  const destroy = () => {
    const index = activeEnvironments.indexOf(env);
    if (index !== -1) {
      activeEnvironments.splice(index, 1);
    }
    env.destroy();
  };

  return { bridge, close, isPointerInAnchor, destroy };
}

function movePointer(point: { x: number; y: number }): void {
  document.dispatchEvent(new PointerEvent('pointermove', { clientX: point.x, clientY: point.y }));
}

describe('createHoverBridge - sibling pointer-events suppression', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('does nothing when siblingContainer is not provided', () => {
    const { bridge } = setup();

    expect(() => bridge.track(TRACK_OPTIONS)).not.toThrow();
    expect(bridge.isActive()).toBe(true);
  });

  it('does nothing when siblingContainer resolves to null', () => {
    const { bridge } = setup({ siblingContainer: () => null });

    expect(() => bridge.track(TRACK_OPTIONS)).not.toThrow();
    expect(bridge.isActive()).toBe(true);
  });

  it('applies pointer-events: none to the sibling container once a corridor is tracked', () => {
    const container = document.createElement('div');
    const { bridge } = setup({ siblingContainer: () => container });

    bridge.track(TRACK_OPTIONS);

    expect(container.style.pointerEvents).toBe('none');
  });

  it('restores the sibling container pointer-events when the bridge is cleared', () => {
    const container = document.createElement('div');
    const { bridge } = setup({ siblingContainer: () => container });

    bridge.track(TRACK_OPTIONS);
    bridge.clear();

    expect(container.style.pointerEvents).toBe('');
  });

  it('puts back the container inline pointer-events value it found, not a blank one', () => {
    const container = document.createElement('div');
    container.style.pointerEvents = 'auto';
    const { bridge } = setup({ siblingContainer: () => container });

    bridge.track(TRACK_OPTIONS);
    bridge.clear();

    expect(container.style.pointerEvents).toBe('auto');
  });

  it('restores pointer-events when the pointer leaves the corridor', () => {
    const container = document.createElement('div');
    const { bridge, close } = setup({ siblingContainer: () => container });

    bridge.track(TRACK_OPTIONS);
    movePointer(OUTSIDE_CORRIDOR_POINT);

    expect(close).toHaveBeenCalledTimes(1);
    expect(container.style.pointerEvents).toBe('');
  });

  it('keeps suppressing pointer-events while the pointer moves validly through the corridor', () => {
    const container = document.createElement('div');
    const { bridge, close } = setup({ siblingContainer: () => container });

    bridge.track(TRACK_OPTIONS);
    movePointer(INSIDE_CORRIDOR_POINT);

    expect(close).not.toHaveBeenCalled();
    expect(container.style.pointerEvents).toBe('none');
  });

  it('restores pointer-events via the idle fallback when the pointer never reaches the anchor', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const container = document.createElement('div');
    const { bridge, close } = setup({ siblingContainer: () => container, timeoutMs: 150 });

    bridge.track(TRACK_OPTIONS);
    vi.advanceTimersByTime(150);

    expect(close).toHaveBeenCalledTimes(1);
    expect(container.style.pointerEvents).toBe('');
  });

  it('tears the corridor down on the idle fallback even when the pointer is back in the anchor', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const container = document.createElement('div');
    const isPointerInAnchor = vi.fn(() => true);
    const { bridge, close } = setup({
      siblingContainer: () => container,
      isPointerInAnchor,
      timeoutMs: 150,
    });

    bridge.track(TRACK_OPTIONS);
    vi.advanceTimersByTime(150);

    // Declining to tear down here would leave the container suppressed with no
    // timer pending - only a later pointermove could ever restore it.
    expect(container.style.pointerEvents).toBe('');
    expect(bridge.isActive()).toBe(false);
    expect(close).not.toHaveBeenCalled();
  });

  it('does nothing when the idle fallback fires after the corridor already cleared', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const container = document.createElement('div');
    const { bridge, close } = setup({ siblingContainer: () => container, timeoutMs: 150 });

    bridge.track(TRACK_OPTIONS);
    bridge.clear();
    vi.advanceTimersByTime(150);

    expect(close).not.toHaveBeenCalled();
    expect(container.style.pointerEvents).toBe('');
  });

  it('restores pointer-events on the same element track() applied it to, even if siblingContainer would now resolve differently', () => {
    const containerA = document.createElement('div');
    const containerB = document.createElement('div');
    let current: HTMLElement = containerA;
    const { bridge } = setup({ siblingContainer: () => current });

    bridge.track(TRACK_OPTIONS);
    expect(containerA.style.pointerEvents).toBe('none');

    // Swap what the accessor would return before clearing - clear() must still
    // target the element it actually suppressed, not whatever the accessor
    // reports now.
    current = containerB;
    bridge.clear();

    expect(containerA.style.pointerEvents).toBe('');
    expect(containerB.style.pointerEvents).toBe('');
  });

  it('restores pointer-events when the injection context is destroyed mid-corridor', () => {
    const container = document.createElement('div');
    const { bridge, destroy } = setup({ siblingContainer: () => container });

    bridge.track(TRACK_OPTIONS);
    expect(container.style.pointerEvents).toBe('none');

    destroy();

    expect(container.style.pointerEvents).toBe('');
  });

  it('does not leak suppression across repeated track/clear cycles on different containers', () => {
    const containerA = document.createElement('div');
    const containerB = document.createElement('div');
    let current: HTMLElement = containerA;
    const { bridge } = setup({ siblingContainer: () => current });

    bridge.track(TRACK_OPTIONS);
    bridge.clear();
    expect(containerA.style.pointerEvents).toBe('');

    current = containerB;
    bridge.track(TRACK_OPTIONS);
    expect(containerB.style.pointerEvents).toBe('none');
    expect(containerA.style.pointerEvents).toBe('');

    bridge.clear();
    expect(containerB.style.pointerEvents).toBe('');
  });

  describe('two bridges sharing one container', () => {
    /** Sibling triggers in one group each own a bridge but suppress the same element. */
    function setupPair(container: HTMLElement) {
      return [
        setup({ siblingContainer: () => container }).bridge,
        setup({ siblingContainer: () => container }).bridge,
      ] as const;
    }

    it('leaves the container usable when their corridors overlap', () => {
      const container = document.createElement('div');
      const [a, b] = setupPair(container);

      a.track(TRACK_OPTIONS);
      b.track(TRACK_OPTIONS);
      a.clear();

      // The container is still suppressed by b, so a's teardown must not lift it.
      expect(container.style.pointerEvents).toBe('none');

      b.clear();

      // b captured the container mid-suppression: restoring what it read there
      // would pin pointer-events to none for the rest of the page's life.
      expect(container.style.pointerEvents).toBe('');
    });

    it('keeps the container suppressed until the last overlapping corridor ends', () => {
      const container = document.createElement('div');
      const [a, b] = setupPair(container);

      a.track(TRACK_OPTIONS);
      b.track(TRACK_OPTIONS);
      b.clear();

      expect(container.style.pointerEvents).toBe('none');

      a.clear();

      expect(container.style.pointerEvents).toBe('');
    });

    it('preserves a consumer inline value across overlapping corridors', () => {
      const container = document.createElement('div');
      container.style.pointerEvents = 'auto';
      const [a, b] = setupPair(container);

      a.track(TRACK_OPTIONS);
      b.track(TRACK_OPTIONS);
      a.clear();
      b.clear();

      expect(container.style.pointerEvents).toBe('auto');
    });
  });

  describe('pointerdown guard', () => {
    /** A container at a known viewport position, so coordinates can be aimed in and out of it. */
    function appendContainer(): HTMLElement {
      const container = document.createElement('div');
      container.style.cssText =
        'position: fixed; left: 200px; top: 200px; width: 100px; height: 100px;';
      document.body.appendChild(container);
      return container;
    }

    const OVER_CONTAINER = { clientX: 250, clientY: 250 };
    const AWAY_FROM_CONTAINER = { clientX: 600, clientY: 600 };

    function pointerDownAt(coords: { clientX: number; clientY: number }): PointerEvent {
      const event = new PointerEvent('pointerdown', { ...coords, cancelable: true, bubbles: true });
      document.body.dispatchEvent(event);
      return event;
    }

    function clickAt(target: HTMLElement, coords: { clientX: number; clientY: number }): boolean {
      const listener = vi.fn();
      target.addEventListener('click', listener);
      target.dispatchEvent(new MouseEvent('click', { ...coords, cancelable: true, bubbles: true }));
      target.removeEventListener('click', listener);
      return listener.mock.calls.length > 0;
    }

    it('prevents a pointerdown over the sibling container while the corridor is active', () => {
      const container = appendContainer();
      const { bridge } = setup({ siblingContainer: () => container });

      bridge.track(TRACK_OPTIONS);

      expect(pointerDownAt(OVER_CONTAINER).defaultPrevented).toBe(true);
      container.remove();
    });

    it('leaves a pointerdown elsewhere on the page alone while the corridor is active', () => {
      const container = appendContainer();
      const { bridge } = setup({ siblingContainer: () => container });

      bridge.track(TRACK_OPTIONS);

      // The container is the only inert surface - a press anywhere else must
      // keep its normal focus behaviour.
      expect(pointerDownAt(AWAY_FROM_CONTAINER).defaultPrevented).toBe(false);
      container.remove();
    });

    it('does not prevent a pointerdown once the corridor has cleared', () => {
      const container = appendContainer();
      const { bridge } = setup({ siblingContainer: () => container });

      bridge.track(TRACK_OPTIONS);
      bridge.clear();

      expect(pointerDownAt(OVER_CONTAINER).defaultPrevented).toBe(false);
      container.remove();
    });

    it('does not prevent a pointerdown when no corridor was ever tracked', () => {
      const container = appendContainer();
      setup({ siblingContainer: () => container });

      expect(pointerDownAt(OVER_CONTAINER).defaultPrevented).toBe(false);
      container.remove();
    });

    it('stops a click over the sibling container from reaching what the container covers', () => {
      const container = appendContainer();
      const { bridge } = setup({ siblingContainer: () => container });

      bridge.track(TRACK_OPTIONS);

      // Cancelling pointerdown does not stop the click, so it needs its own
      // guard or it activates whatever is hit-testable under the inert container.
      expect(clickAt(document.body, OVER_CONTAINER)).toBe(false);
      container.remove();
    });

    it('leaves a click elsewhere on the page alone while the corridor is active', () => {
      const container = appendContainer();
      const { bridge } = setup({ siblingContainer: () => container });

      bridge.track(TRACK_OPTIONS);

      expect(clickAt(document.body, AWAY_FROM_CONTAINER)).toBe(true);
      container.remove();
    });

    it('stops blocking presses even when the suppression callback throws on teardown', () => {
      const container = appendContainer();
      const { bridge } = setup({
        siblingContainer: () => container,
        onSuppressionChange: active => {
          if (!active) {
            throw new Error('consumer teardown failed');
          }
        },
      });

      bridge.track(TRACK_OPTIONS);

      try {
        bridge.clear();
      } catch {
        // The consumer blew up mid-teardown. A document guard that survived it
        // would swallow every press over the container for the page's lifetime.
      }

      expect(clickAt(document.body, OVER_CONTAINER)).toBe(true);
      expect(pointerDownAt(OVER_CONTAINER).defaultPrevented).toBe(false);
      container.remove();
    });

    it('releases both press guards after a repeated track() with no intervening clear()', () => {
      const container = appendContainer();
      const { bridge } = setup({ siblingContainer: () => container });

      // A second track() must not orphan the first call's document listeners -
      // clear() only holds one cleanup handle.
      bridge.track(TRACK_OPTIONS);
      bridge.track(TRACK_OPTIONS);
      bridge.clear();

      expect(pointerDownAt(OVER_CONTAINER).defaultPrevented).toBe(false);
      expect(clickAt(document.body, OVER_CONTAINER)).toBe(true);
      expect(container.style.pointerEvents).toBe('');
      container.remove();
    });
  });
});
