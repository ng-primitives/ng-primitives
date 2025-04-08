/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ElementRef, Renderer2, Signal, inject, signal } from '@angular/core';
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
   * Access the renderer.
   */
  const renderer = inject(Renderer2);

  /**
   * Whether the element is currently focused.
   */
  const isFocused = signal<boolean>(false);

  // setup event listeners
  disposables.addEventListener(elementRef.nativeElement, 'focus', onFocus);
  disposables.addEventListener(elementRef.nativeElement, 'blur', onBlur);

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
      // set the data-focus attribute
      renderer.setAttribute(elementRef.nativeElement, 'data-focus', '');
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
      // remove the data-focus attribute
      renderer.removeAttribute(elementRef.nativeElement, 'data-focus');
    }
  }

  return {
    isFocused,
  };
}
