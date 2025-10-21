import { ElementRef, Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding, listener } from 'ng-primitives/state';
import { injectDisposables } from 'ng-primitives/utils';
import { isPressEnabled } from '../config/interactions-config';

interface NgpPressState {
  pressed: Signal<boolean>;
}

interface NgpPressProps {
  disabled?: Signal<boolean>;
  pressStart?: () => void;
  pressEnd?: () => void;
  element?: ElementRef<HTMLElement>;
}

/**
 * @internal
 */
export function ngpPressInteraction({
  pressStart,
  pressEnd,
  disabled = signal(false),
  element = injectElementRef(),
}: NgpPressProps): NgpPressState {
  const canPress = isPressEnabled();

  if (!canPress) {
    return { pressed: signal(false) };
  }

  const disposables = injectDisposables();

  /**
   * Whether the element is currently pressed.
   */
  const pressed = signal<boolean>(false);

  // setup event listeners
  listener(element, 'pointerdown', onPointerDown);

  // anytime the press state changes we want to update the attribute
  dataBinding(element, 'data-press', pressed);

  /**
   * Reset the press state.
   */
  function reset(): void {
    // if we are not pressing, then do nothing
    if (!pressed()) {
      return;
    }

    // clear any existing disposables
    disposableListeners.forEach(dispose => dispose());
    pressed.set(false);
    pressEnd?.();
  }

  /**
   * Store the list of disposables.
   */
  let disposableListeners: (() => void)[] = [];

  function onPointerDown(): void {
    if (disabled()) {
      return;
    }

    // clear any existing disposables
    disposableListeners.forEach(dispose => dispose());

    // update the press state
    pressed.set(true);
    pressStart?.();

    // setup global event listeners to catch events on elements outside the directive
    const ownerDocument = element.nativeElement.ownerDocument ?? document;

    // if the pointer up event happens on any elements, then we are no longer pressing on this element
    const pointerUp = disposables.addEventListener(
      ownerDocument,
      'pointerup',
      () => reset(),
      false,
    );

    // Instead of relying on the `pointerleave` event, which is not consistently called on iOS Safari,
    // we use the `pointermove` event to determine if we are still "pressing".
    // By checking if the target is still within the element, we can determine if the press is ongoing.
    const pointerMove = disposables.addEventListener(
      ownerDocument,
      'pointermove',
      () => onPointerMove as EventListener,
      false,
    );

    // if the pointer is cancelled, then we are no longer pressing on this element
    const pointerCancel = disposables.addEventListener(
      ownerDocument,
      'pointercancel',
      () => reset(),
      false,
    );

    disposableListeners = [pointerUp, pointerMove, pointerCancel];
  }

  function onPointerMove(event: PointerEvent): void {
    if (
      element.nativeElement !== event.target &&
      !element.nativeElement.contains(event.target as Node)
    ) {
      reset();
    }
  }

  return { pressed };
}
