class NgpToastTimer {
  private startTime: number | null = null;
  private remainingMs: number;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;

  constructor(
    private duration: number,
    private callback: () => void,
    private readonly persistent = false,
  ) {
    this.remainingMs = duration;
  }

  start(): void {
    if (this.persistent) return;
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = Date.now();

    this.timeoutId = setTimeout(() => {
      this.isRunning = false;
      this.callback();
    }, this.remainingMs);
  }

  pause(): void {
    if (!this.isRunning || this.startTime === null) return;

    this.isRunning = false;
    clearTimeout(this.timeoutId!);

    const elapsed = Date.now() - this.startTime;
    this.remainingMs = Math.max(0, this.remainingMs - elapsed);
    this.startTime = null;
    this.timeoutId = null;
  }

  remaining(): number {
    if (this.startTime === null) return this.remainingMs;
    return Math.max(0, this.remainingMs - (Date.now() - this.startTime));
  }

  stop(): void {
    this.isRunning = false;
    clearTimeout(this.timeoutId!);
    this.timeoutId = null;
    this.startTime = null;
    this.remainingMs = this.duration;
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
