/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { injectDisabled } from 'ng-primitives/internal';
import { NgpFocusVisibleToken } from './focus-visible.token';

@Directive({
  standalone: true,
  selector: '[ngpFocusVisible]',
  exportAs: 'ngpFocusVisible',
  providers: [{ provide: NgpFocusVisibleToken, useExisting: NgpFocusVisible }],
  host: {
    '[attr.data-focus-visible]': 'isFocused()',
  },
})
export class NgpFocusVisible {
  /**
   * Access the element that the directive is applied to.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the focus monitor.
   */
  private readonly focusMonitor = inject(FocusMonitor);

  /**
   * Whether focus events are listened to.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpFocusVisibleDisabled',
    transform: booleanAttribute,
  });

  /**
   * Access the disabled state from any parent.
   */
  private readonly isDisabled = injectDisabled(this.disabled);

  /**
   * Emit when the element is visually focused.
   */
  readonly focusChange = output<boolean>({
    alias: 'ngpFocusVisible',
  });

  /**
   * Whether the element is currently focused.
   */
  protected readonly isFocused = signal<boolean>(false);

  constructor() {
    // handle focus state
    this.focusMonitor
      .monitor(this.elementRef.nativeElement)
      .pipe(takeUntilDestroyed())
      .subscribe(origin =>
        // null indicates the element was blurred
        origin === null ? this.onBlur() : this.onFocus(origin),
      );

    // handle disabled state
    this.onDisabled();
  }

  private onFocus(origin: FocusOrigin): void {
    if (this.isDisabled() || this.isFocused()) {
      return;
    }

    // for some elements the focus visible state should always appear on focus
    if (this.alwaysShowFocus()) {
      this.focus(true);
      return;
    }

    // if the focus origin is keyboard, then the focus is visible
    if (origin === 'keyboard') {
      this.focus(true);
      return;
    }
  }

  private onBlur(): void {
    if (this.isDisabled() || !this.isFocused()) {
      return;
    }

    this.focus(false);
  }

  /**
   * Prevent the data-focus-visible attribute from becoming stale.
   */
  private onDisabled(): void {
    effect(
      () => {
        if (this.isDisabled()) {
          this.focus(false);
        }
      },
      { allowSignalWrites: true },
    );
  }

  /**
   * Trigger the focus signal along with the focusChange event.
   */
  private focus(value: boolean) {
    this.isFocused.set(value);
    this.focusChange.emit(value);
  }

  private alwaysShowFocus(): boolean {
    const nonTextInputTypes = [
      'checkbox',
      'radio',
      'range',
      'color',
      'file',
      'image',
      'button',
      'submit',
      'reset',
    ];

    // if this is an input element and it is a text input
    if (
      this.elementRef.nativeElement instanceof HTMLInputElement &&
      !nonTextInputTypes.includes(this.elementRef.nativeElement.type)
    ) {
      return true;
    }

    // if this is a textarea
    if (this.elementRef.nativeElement instanceof HTMLTextAreaElement) {
      return true;
    }

    // if this is an element with contenteditable
    if (
      this.elementRef.nativeElement.isContentEditable ||
      this.elementRef.nativeElement.hasAttribute('contenteditable')
    ) {
      return true;
    }

    return false;
  }
}
