/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ElementRef, Signal, effect, inject, signal } from '@angular/core';
import { injectDisposables } from 'ng-primitives/utils';

interface NgpPressState {
  pressed: Signal<boolean>;
}

interface NgpPressOptions {
  disabled?: Signal<boolean>;
  pressStart?: () => void;
  pressEnd?: () => void;
}

export function setupPress({
  pressStart,
  pressEnd,
  disabled = signal(false),
}: NgpPressOptions): NgpPressState {
  /**
   * Access the element reference.
   */
  const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the disposables helper.
   */
  const disposables = injectDisposables();

  /**
   * Whether the element is currently pressed.
   */
  const pressed = signal<boolean>(false);

  // setup event listeners
  disposables.addEventListener(elementRef.nativeElement, 'pointerdown', onPointerDown);

  // anytime the press state changes we want to update the attribute
  effect(() =>
    pressed() && !disabled()
      ? elementRef.nativeElement.setAttribute('data-press', '')
      : elementRef.nativeElement.removeAttribute('data-press'),
  );

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
    const ownerDocument = elementRef.nativeElement.ownerDocument ?? document;

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
      elementRef.nativeElement !== event.target &&
      !elementRef.nativeElement.contains(event.target as Node)
    ) {
      reset();
    }
  }

  return { pressed };
}
