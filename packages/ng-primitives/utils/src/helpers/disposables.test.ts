import {
  createEnvironmentInjector,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { injectDisposables } from './disposables';

/**
 * inject(DestroyRef) in an environment context resolves to the injector itself
 * (Angular ignores user providers for DestroyRef), so to observe registrations
 * we wrap a real child environment injector's onDestroy. The wrapper tracks
 * which callbacks are still registered while delegating to the real
 * implementation, so destroy() behaviour stays authentic.
 */
function setup() {
  const env = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
  const registrations = new Set<() => void>();
  const originalOnDestroy = env.onDestroy.bind(env);

  vi.spyOn(env, 'onDestroy').mockImplementation((callback: () => void) => {
    registrations.add(callback);
    const unregister = originalOnDestroy(callback);
    return () => {
      registrations.delete(callback);
      unregister();
    };
  });

  const disposables = runInInjectionContext(env, () => injectDisposables());

  // injectDisposables registers one callback of its own (the isDestroyed flag).
  const baseline = registrations.size;

  return {
    disposables,
    baseline,
    get size() {
      return registrations.size;
    },
    destroy: () => env.destroy(),
  };
}

describe('injectDisposables', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('setTimeout', () => {
    it('releases its destroy registration once the timeout fires', () => {
      vi.useFakeTimers();
      const ctx = setup();
      const callback = vi.fn();

      ctx.disposables.setTimeout(callback, 100);
      expect(ctx.size).toBe(ctx.baseline + 1);

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(ctx.size).toBe(ctx.baseline);
    });

    it('releases its destroy registration when cleared early', () => {
      vi.useFakeTimers();
      const ctx = setup();
      const callback = vi.fn();

      const cleanup = ctx.disposables.setTimeout(callback, 100);
      cleanup();

      expect(ctx.size).toBe(ctx.baseline);
      vi.advanceTimersByTime(100);
      expect(callback).not.toHaveBeenCalled();
    });

    it('does not accumulate registrations across repeated schedule/clear cycles', () => {
      vi.useFakeTimers();
      const ctx = setup();

      let cleanup: () => void = () => void 0;
      for (let i = 0; i < 50; i++) {
        cleanup();
        cleanup = ctx.disposables.setTimeout(() => void 0, 100);
      }

      expect(ctx.size).toBe(ctx.baseline + 1);
    });

    it('is idempotent when the cleanup is called multiple times', () => {
      vi.useFakeTimers();
      const ctx = setup();

      const cleanup = ctx.disposables.setTimeout(() => void 0, 100);
      cleanup();
      cleanup();

      expect(ctx.size).toBe(ctx.baseline);
    });

    it('still clears a pending timeout on destroy', () => {
      vi.useFakeTimers();
      const ctx = setup();
      const callback = vi.fn();

      ctx.disposables.setTimeout(callback, 100);
      ctx.destroy();

      vi.advanceTimersByTime(100);
      expect(callback).not.toHaveBeenCalled();
    });

    it('does not schedule or register after destroy', () => {
      vi.useFakeTimers();
      const ctx = setup();
      const callback = vi.fn();

      ctx.destroy();
      const sizeAfterDestroy = ctx.size;
      ctx.disposables.setTimeout(callback, 100);

      expect(ctx.size).toBe(sizeAfterDestroy);
      vi.advanceTimersByTime(100);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('setInterval', () => {
    it('releases its destroy registration when cleared', () => {
      vi.useFakeTimers();
      const ctx = setup();
      const callback = vi.fn();

      const cleanup = ctx.disposables.setInterval(callback, 100);
      vi.advanceTimersByTime(300);
      expect(callback).toHaveBeenCalledTimes(3);

      cleanup();
      expect(ctx.size).toBe(ctx.baseline);

      vi.advanceTimersByTime(300);
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('still stops the interval on destroy', () => {
      vi.useFakeTimers();
      const ctx = setup();
      const callback = vi.fn();

      ctx.disposables.setInterval(callback, 100);
      ctx.destroy();

      vi.advanceTimersByTime(300);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('addEventListener', () => {
    it('releases its destroy registration when the listener is removed', () => {
      const ctx = setup();
      const target = document.createElement('div');
      const listener = vi.fn();

      const cleanup = ctx.disposables.addEventListener(target, 'click', listener);
      expect(ctx.size).toBe(ctx.baseline + 1);

      target.dispatchEvent(new MouseEvent('click'));
      expect(listener).toHaveBeenCalledTimes(1);

      cleanup();
      expect(ctx.size).toBe(ctx.baseline);

      target.dispatchEvent(new MouseEvent('click'));
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('still removes the listener on destroy', () => {
      const ctx = setup();
      const target = document.createElement('div');
      const listener = vi.fn();

      ctx.disposables.addEventListener(target, 'click', listener);
      ctx.destroy();

      target.dispatchEvent(new MouseEvent('click'));
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('requestAnimationFrame', () => {
    it('releases its destroy registration once the frame fires', async () => {
      const ctx = setup();
      const callback = vi.fn();

      ctx.disposables.requestAnimationFrame(callback);
      expect(ctx.size).toBe(ctx.baseline + 1);

      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      expect(callback).toHaveBeenCalledTimes(1);
      expect(ctx.size).toBe(ctx.baseline);
    });

    it('releases its destroy registration when cancelled early', async () => {
      const ctx = setup();
      const callback = vi.fn();

      const cleanup = ctx.disposables.requestAnimationFrame(callback);
      cleanup();

      expect(ctx.size).toBe(ctx.baseline);

      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
