/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ElementRef, Signal, effect, inject, signal } from '@angular/core';
import { injectDisposables } from 'ng-primitives/utils';

export interface NgpFocusOptions {
  disabled?: Signal<boolean>;
  focus?: () => void;
  blur?: () => void;
}

export interface NgpFocusState {
  isFocused: Signal<boolean>;
}

export function setupFocus({
  focus,
  blur,
  disabled = signal(false),
}: NgpFocusOptions): NgpFocusState {
  /**
   * Access the element reference.
   */
  const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the disposables helper.
   */
  const disposables = injectDisposables();

  /**
   * Whether the element is currently focused.
   */
  const isFocused = signal<boolean>(false);

  // setup event listeners
  disposables.addEventListener(elementRef.nativeElement, 'focus', onFocus);
  disposables.addEventListener(elementRef.nativeElement, 'blur', onBlur);

  // anytime the focus state changes we want to update the attribute
  effect(() => elementRef.nativeElement.setAttribute('data-focus', isFocused().toString()));

  /**
   * Listen for focus events.
   * @param event
   */
  function onFocus(event: FocusEvent): void {
    if (disabled()) {
      return;
    }

    const ownerDocument = (event.target as HTMLElement)?.ownerDocument ?? document;

    // ensure this element is still focused
    if (ownerDocument.activeElement === event.target && event.currentTarget === event.target) {
      focus?.();
      isFocused.set(true);
    }
  }

  /**
   * Listen for blur events.
   * @param event
   */
  function onBlur(event: FocusEvent): void {
    if (disabled()) {
      return;
    }

    if (event.currentTarget === event.target) {
      blur?.();
      isFocused.set(false);
    }
  }

  return {
    isFocused,
  };
}
