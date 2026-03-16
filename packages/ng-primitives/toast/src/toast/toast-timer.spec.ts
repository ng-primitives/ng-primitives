import { toastTimer } from './toast-timer';

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

    // After stop, starting again should use full duration
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
    timer.start(); // Should be ignored since already running
    vi.advanceTimersByTime(2000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not pause if not running', () => {
    const callback = vi.fn();
    const timer = toastTimer(3000, callback);

    timer.pause(); // Should be a no-op
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
});
