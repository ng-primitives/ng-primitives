export type NgpDrawerModal = boolean | 'trap-focus';
export type NgpDrawerSwipeDirection = 'up' | 'down' | 'left' | 'right';
export type NgpDrawerSnapPoint = number | `${number}px` | `${number}rem`;
export type NgpDrawerChangeReason =
  | 'backdrop-press'
  | 'close-press'
  | 'escape-key'
  | 'focus-out'
  | 'imperative'
  | 'outside-press'
  | 'programmatic'
  | 'swipe'
  | 'swipe-area'
  | 'trigger-press';

export type NgpDrawerFocusTarget =
  | HTMLElement
  | string
  | false
  | null
  | undefined
  | (() => HTMLElement | null | undefined);

export class NgpDrawerOpenChangeEvent {
  readonly nativeEvent: Event | null;
  readonly trigger: HTMLElement | null;
  canceled = false;
  unmountPrevented = false;

  constructor(
    readonly nextOpen: boolean,
    readonly reason: NgpDrawerChangeReason,
    nativeEvent: Event | null = null,
    trigger: HTMLElement | null = null,
  ) {
    this.nativeEvent = nativeEvent;
    this.trigger = trigger;
  }

  cancel(): void {
    this.canceled = true;
  }

  preventUnmountOnClose(): void {
    if (!this.nextOpen) {
      this.unmountPrevented = true;
    }
  }
}

export class NgpDrawerSnapPointChangeEvent {
  readonly nativeEvent: Event | null;
  readonly trigger: HTMLElement | null;
  canceled = false;

  constructor(
    readonly nextSnapPoint: NgpDrawerSnapPoint | null | undefined,
    readonly reason: NgpDrawerChangeReason,
    nativeEvent: Event | null = null,
    trigger: HTMLElement | null = null,
  ) {
    this.nativeEvent = nativeEvent;
    this.trigger = trigger;
  }

  cancel(): void {
    this.canceled = true;
  }
}
