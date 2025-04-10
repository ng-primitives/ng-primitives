export type NgpToastPosition = 'start' | 'center' | 'end';
export type NgpToastGravity = 'top' | 'bottom';

export class NgpToastRef {
  /** Store the current timeout */
  private timeoutId: number | null = null;

  /** Get the toast height */
  get height(): number {
    return this.toastElement.offsetHeight;
  }

  constructor(
    /** Store the toast element */
    private readonly toastElement: HTMLElement,
    /** Store the duration */
    private readonly duration: number,
    /** The position of the toast */
    public readonly position: NgpToastPosition,
    /** The gravity of the toast */
    public readonly gravity: NgpToastGravity,
    /** Whether we should stop on focus */
    private readonly stopOnHover: boolean,
    /** The aria live setting */
    private readonly ariaLive: string,
    private readonly onDismiss: () => void,
  ) {
    this.toastElement.setAttribute('data-toast', 'visible');

    this.setPosition(position);
    this.setGravity(gravity);
    this.setAriaLive(ariaLive);
    this.setupTimeouts();
    this.setupListeners();
  }

  dismiss(): void {
    // determine if there is a transition on the element
    const transitionDuration = parseFloat(getComputedStyle(this.toastElement).transitionDuration);

    // if there is no transition, dismiss immediately
    if (transitionDuration === 0) {
      this.removeElement();
      return;
    }

    // wait for the transition to end
    this.toastElement.addEventListener('transitionend', () => this.removeElement());

    this.toastElement.setAttribute('data-toast', 'hidden');
  }

  private removeElement(): void {
    this.toastElement.parentNode?.removeChild(this.toastElement);
    this.onDismiss();
  }

  /** Setup duration timeouts */
  private setupTimeouts(): void {
    // if the duration is 0 skip
    if (this.duration === 0) {
      return;
    }

    this.timeoutId = window.setTimeout(() => this.dismiss(), this.duration);
  }

  private setupListeners(): void {
    if (!this.stopOnHover) {
      return;
    }

    // setup event listeners if we should stop on focus
    this.toastElement.addEventListener('mouseover', () => {
      window.clearTimeout(this.timeoutId!);
      this.timeoutId = null;
    });

    this.toastElement.addEventListener('mouseleave', () => this.setupTimeouts());
  }

  /** Set the position attribute */
  private setPosition(position: NgpToastPosition): void {
    this.toastElement.setAttribute('data-position', position);
  }

  /** Set the gravity attribute */
  private setGravity(gravity: NgpToastGravity): void {
    this.toastElement.setAttribute('data-gravity', gravity);
  }

  /** Set the aria live attribute */
  private setAriaLive(ariaLive: string): void {
    this.toastElement.setAttribute('aria-live', ariaLive);
  }

  /**
   * @internal
   */
  setInset(property: 'top' | 'bottom', value: string): void {
    this.toastElement.style[property] = value;
  }
}
