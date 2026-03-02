import { toastTimer } from './toast-timer';

describe('toastTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should call callback after duration', () => {
    const callback = jest.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    jest.advanceTimersByTime(3000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback before duration', () => {
    const callback = jest.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    jest.advanceTimersByTime(2999);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should pause and resume timer', () => {
    const callback = jest.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    jest.advanceTimersByTime(1000);

    timer.pause();
    jest.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();

    timer.start();
    jest.advanceTimersByTime(1999);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should stop and reset timer', () => {
    const callback = jest.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    jest.advanceTimersByTime(2000);

    timer.stop();
    jest.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();

    // After stop, starting again should use full duration
    timer.start();
    jest.advanceTimersByTime(2999);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not start if already running', () => {
    const callback = jest.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    jest.advanceTimersByTime(1000);
    timer.start(); // Should be ignored since already running
    jest.advanceTimersByTime(2000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not pause if not running', () => {
    const callback = jest.fn();
    const timer = toastTimer(3000, callback);

    timer.pause(); // Should be a no-op
    timer.start();
    jest.advanceTimersByTime(3000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple pause/resume cycles', () => {
    const callback = jest.fn();
    const timer = toastTimer(3000, callback);

    timer.start();
    jest.advanceTimersByTime(500);
    timer.pause();

    jest.advanceTimersByTime(1000);
    timer.start();
    jest.advanceTimersByTime(500);
    timer.pause();

    jest.advanceTimersByTime(1000);
    timer.start();
    jest.advanceTimersByTime(1999);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
