import { inject, Injector, Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding, listener } from 'ng-primitives/state';
import { isPressEnabled } from '../config/interactions-config';

interface NgpPressState {
  pressed: Signal<boolean>;
}

interface NgpPressProps {
  disabled?: Signal<boolean>;
  onPressStart?: () => void;
  onPressEnd?: () => void;
}

/**
 * @internal
 */
export function ngpPress({
  onPressStart,
  onPressEnd,
  disabled = signal(false),
}: NgpPressProps): NgpPressState {
  const canPress = isPressEnabled();

  if (!canPress) {
    return { pressed: signal(false) };
  }

  const elementRef = injectElementRef();
  const injector = inject(Injector);

  /**
   * Whether the element is currently pressed.
   */
  const pressed = signal<boolean>(false);

  // setup event listeners
  listener(elementRef, 'pointerdown', onPointerDown);

  // anytime the press state changes we want to update the attribute
  dataBinding(elementRef, 'data-press', () => pressed() && !disabled());

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
    onPressEnd?.();
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
    onPressStart?.();

    // setup global event listeners to catch events on elements outside the directive
    const ownerDocument = elementRef.nativeElement.ownerDocument ?? document;

    // if the pointer up event happens on any elements, then we are no longer pressing on this element
    const pointerUp = listener(ownerDocument, 'pointerup', () => reset(), {
      config: false,
      injector,
    });

    // Instead of relying on the `pointerleave` event, which is not consistently called on iOS Safari,
    // we use the `pointermove` event to determine if we are still "pressing".
    // By checking if the target is still within the element, we can determine if the press is ongoing.
    const pointerMove = listener(
      ownerDocument,
      'pointermove',
      () => onPointerMove as EventListener,
      { config: false, injector },
    );

    // if the pointer is cancelled, then we are no longer pressing on this element
    const pointerCancel = listener(ownerDocument, 'pointercancel', () => reset(), {
      config: false,
      injector,
    });

    disposableListeners = [pointerUp, pointerMove, pointerCancel];
  }

  function onPointerMove(event: PointerEvent): void {
    if (
      elementRef.nativeElement !== event.target &&
      !elementRef.nativeElement.contains(event.target as Node)
    ) {
      reset();
    }
  }

  return { pressed };
}
