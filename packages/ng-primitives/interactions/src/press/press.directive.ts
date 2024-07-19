/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  HostListener,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { injectDisabled } from 'ng-primitives/internal';
import { injectDisposables } from 'ng-primitives/utils';
import { NgpPressToken } from './press.token';

/**
 * This was inpsired by Headless UI's active-press hook:
 * https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/src/hooks/use-active-press.tsx
 */

@Directive({
  standalone: true,
  selector: '[ngpPress]',
  exportAs: 'ngpPress',
  providers: [{ provide: NgpPressToken, useExisting: NgpPress }],
  host: {
    '[attr.data-press]': 'pressed()',
  },
})
export class NgpPress {
  /**
   * Access the HTML Element.
   */
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the disposables.
   */
  private readonly disposables = injectDisposables();

  /**
   * Whether listening for press events is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPressDisabled',
    transform: booleanAttribute,
  });

  /**
   * Access the disabled state from any parent.
   */
  private readonly isDisabled = injectDisabled(this.disabled);

  /**
   * Emit when the press begins.
   */
  readonly pressStart = output<void>({
    alias: 'ngpPressStart',
  });

  /**
   * Emit when the press ends.
   */
  readonly pressEnd = output<void>({
    alias: 'ngpPressEnd',
  });

  /**
   * Emit when the press changes.
   */
  readonly pressChange = output<boolean>({
    alias: 'ngpPress',
  });

  /**
   * The press state.
   */
  protected readonly pressed = signal(false);

  /**
   * Reset the press state.
   */
  private reset(): void {
    // if we are not pressing, then do nothing
    if (!this.pressed()) {
      return;
    }

    // clear any existing disposables
    this.disposableListeners.forEach(dispose => dispose());
    this.pressed.set(false);
    this.pressEnd.emit();
    this.pressChange.emit(false);
  }

  /**
   * Store the list of disposables.
   */
  private disposableListeners: (() => void)[] = [];

  @HostListener('pointerdown')
  protected onPointerDown(): void {
    if (this.isDisabled()) {
      return;
    }

    // clear any existing disposables
    this.disposableListeners.forEach(dispose => dispose());

    // update the press state
    this.pressed.set(true);
    this.pressStart.emit();
    this.pressChange.emit(true);

    // setup global event listeners to catch events on elements outside the directive
    const ownerDocument = this.element.nativeElement.ownerDocument ?? document;

    // if the pointer up event happens on any elements, then we are no longer pressing on this element
    const pointerUp = this.disposables.addEventListener(
      ownerDocument,
      'pointerup',
      this.reset.bind(this),
      false,
    );

    // Instead of relying on the `pointerleave` event, which is not consistently called on iOS Safari,
    // we use the `pointermove` event to determine if we are still "pressing".
    // By checking if the target is still within the element, we can determine if the press is ongoing.
    const pointerMove = this.disposables.addEventListener(
      ownerDocument,
      'pointermove',
      this.onPointerMove.bind(this) as EventListener,
      false,
    );

    // if the pointer is cancelled, then we are no longer pressing on this element
    const pointerCancel = this.disposables.addEventListener(
      ownerDocument,
      'pointercancel',
      this.reset.bind(this),
      false,
    );

    this.disposableListeners = [pointerUp, pointerMove, pointerCancel];
  }

  private onPointerMove(event: PointerEvent): void {
    if (
      this.element.nativeElement !== event.target &&
      !this.element.nativeElement.contains(event.target as Node)
    ) {
      this.reset();
    }
  }
}
