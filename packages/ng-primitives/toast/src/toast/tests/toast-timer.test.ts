import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toastTimer } from '../toast-timer';

describe('toastTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should call callback after duration', () => {
    const callback = vi.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    vi.advanceTimersByTime(3000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback before duration', () => {
    const callback = vi.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    vi.advanceTimersByTime(2999);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should pause and resume timer', () => {
    const callback = vi.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    vi.advanceTimersByTime(1000);

    timer.pause();
    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();

    timer.start();
    vi.advanceTimersByTime(1999);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should stop and reset timer', () => {
    const callback = vi.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    vi.advanceTimersByTime(2000);

    timer.stop();
    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();

    timer.start();
    vi.advanceTimersByTime(2999);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not start if already running', () => {
    const callback = vi.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    vi.advanceTimersByTime(1000);
    timer.start();
    vi.advanceTimersByTime(2000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not pause if not running', () => {
    const callback = vi.fn();
    const timer = toastTimer(3000, callback);

    timer.pause();
    timer.start();
    vi.advanceTimersByTime(3000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple pause/resume cycles', () => {
    const callback = vi.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    vi.advanceTimersByTime(500);
    timer.pause();

    vi.advanceTimersByTime(1000);
    timer.start();
    vi.advanceTimersByTime(500);
    timer.pause();

    vi.advanceTimersByTime(1000);
    timer.start();
    vi.advanceTimersByTime(1999);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should report the time remaining, frozen while paused', () => {
    const timer = toastTimer(3000, vi.fn());
    expect(timer.remaining()).toBe(3000);

    timer.start();
    vi.advanceTimersByTime(1000);
    expect(timer.remaining()).toBe(2000);

    timer.pause();
    vi.advanceTimersByTime(5000);
    expect(timer.remaining()).toBe(2000);

    timer.start();
    vi.advanceTimersByTime(2000);
    expect(timer.remaining()).toBe(0);

    timer.stop();
    expect(timer.remaining()).toBe(3000);
  });

  it('should not report negative time when paused after the deadline', () => {
    const timer = toastTimer(3000, vi.fn());

    timer.start();
    // move the clock past the deadline without firing the timeout, as a main-thread stall would
    vi.setSystemTime(Date.now() + 5000);
    timer.pause();

    expect(timer.remaining()).toBe(0);
  });

  it('should not call callback when persistent', () => {
    const callback = vi.fn();
    const timer = toastTimer(3000, callback, { persistent: true });

    timer.start();
    vi.advanceTimersByTime(10_000);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should remain inert across pause/start cycles when persistent', () => {
    const callback = vi.fn();
    const timer = toastTimer(3000, callback, { persistent: true });

    timer.start();
    vi.advanceTimersByTime(1000);
    timer.pause();
    vi.advanceTimersByTime(1000);
    timer.start();
    vi.advanceTimersByTime(10_000);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call callback after stop when persistent', () => {
    const callback = vi.fn();
    const timer = toastTimer(3000, callback, { persistent: true });

    timer.start();
    timer.stop();
    vi.advanceTimersByTime(10_000);

    expect(callback).not.toHaveBeenCalled();
  });
});
