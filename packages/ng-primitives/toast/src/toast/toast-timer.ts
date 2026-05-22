class NgpToastTimer {
  private startTime: number | null = null;
  private remaining: number;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;

  constructor(
    private duration: number,
    private callback: () => void,
    private readonly persistent = false,
  ) {
    this.remaining = duration;
  }

  start(): void {
    if (this.persistent) return;
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = Date.now();

    this.timeoutId = setTimeout(() => {
      this.isRunning = false;
      this.callback();
    }, this.remaining);
  }

  pause(): void {
    if (!this.isRunning || this.startTime === null) return;

    this.isRunning = false;
    clearTimeout(this.timeoutId!);

    const elapsed = Date.now() - this.startTime;
    this.remaining -= elapsed;
    this.startTime = null;
    this.timeoutId = null;
  }

  stop(): void {
    this.isRunning = false;
    clearTimeout(this.timeoutId!);
    this.timeoutId = null;
    this.startTime = null;
    this.remaining = this.duration;
  }
}

export interface NgpToastTimerOptions {
  /**
   * When true, the timer never fires. `start()`, `pause()`, and `stop()` are safe
   * to call but have no effect on the callback.
   */
  persistent?: boolean;
}

export function toastTimer(
  duration: number,
  callback: () => void,
  options: NgpToastTimerOptions = {},
): NgpToastTimer {
  return new NgpToastTimer(duration, callback, options.persistent);
}
