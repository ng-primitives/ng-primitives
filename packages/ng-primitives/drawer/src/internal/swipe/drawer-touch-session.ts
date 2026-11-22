import type { DrawerSwipeInput } from './drawer-swipe-engine';

export class DrawerTouchSession {
  private identifier: number | null = null;

  get active(): boolean {
    return this.identifier !== null;
  }

  start(event: TouchEvent): DrawerSwipeInput | null {
    if (this.active || event.touches.length !== 1) {
      return null;
    }
    const touch = event.touches[0];
    this.identifier = touch.identifier;
    return this.toInput(touch, event);
  }

  move(event: TouchEvent): DrawerSwipeInput | null {
    const touch = this.findOwnedTouch(event.touches);
    return touch ? this.toInput(touch, event) : null;
  }

  end(event: TouchEvent): DrawerSwipeInput | null {
    const touch = this.findOwnedTouch(event.changedTouches);
    if (!touch) {
      return null;
    }
    const input = this.toInput(touch, event);
    this.reset();
    return input;
  }

  cancel(event: TouchEvent): DrawerSwipeInput | null {
    return this.end(event);
  }

  reset(): void {
    this.identifier = null;
  }

  private findOwnedTouch(touches: TouchList): Touch | null {
    if (this.identifier === null) {
      return null;
    }
    for (let index = 0; index < touches.length; index += 1) {
      const touch = touches[index];
      if (touch.identifier === this.identifier) {
        return touch;
      }
    }
    return null;
  }

  private toInput(touch: Touch, event: TouchEvent): DrawerSwipeInput {
    return {
      x: touch.clientX,
      y: touch.clientY,
      time: event.timeStamp,
      nativeEvent: event,
    };
  }
}
